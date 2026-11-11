const db = require('../config/db');
const OrderBook = require('./orderBook');
const TradeExecutor = require('./tradeExecutor');

class MatchingEngine {
  /**
   * Match orders for a specific stock using Price-Time Priority
   * Matching Rule: BUY Price >= SELL Price
   * @param {number} stockId 
   * @returns {Array} List of executed trades
   */
  static async matchOrdersForStock(stockId) {
    // 1. Fetch stock symbol for audit logs
    const stockRes = await db.query('SELECT symbol FROM stocks WHERE id = $1', [stockId]);
    if (stockRes.rows.length === 0) return [];
    const stockSymbol = stockRes.rows[0].symbol;

    // 2. Fetch all open / partially filled BUY orders sorted by price DESC, created_at ASC
    const bidsRes = await db.query(
      `SELECT * FROM orders
       WHERE stock_id = $1 AND order_type = 'BUY' AND status IN ('OPEN', 'PARTIALLY_FILLED')
       ORDER BY price DESC, created_at ASC`,
      [stockId]
    );

    // 3. Fetch all open / partially filled SELL orders sorted by price ASC, created_at ASC
    const asksRes = await db.query(
      `SELECT * FROM orders
       WHERE stock_id = $1 AND order_type = 'SELL' AND status IN ('OPEN', 'PARTIALLY_FILLED')
       ORDER BY price ASC, created_at ASC`,
      [stockId]
    );

    const bids = OrderBook.sortBids(bidsRes.rows);
    const asks = OrderBook.sortAsks(asksRes.rows);

    const executedTrades = [];

    // 4. Matching loop
    while (bids.length > 0 && asks.length > 0) {
      const bestBid = bids[0];
      const bestAsk = asks[0];

      const bidPrice = parseFloat(bestBid.price);
      const askPrice = parseFloat(bestAsk.price);

      // Check matching condition: BUY price >= SELL price
      if (bidPrice < askPrice) {
        break; // No further matches possible
      }

      // Check self-trading (buyer and seller cannot be the same account)
      if (bestBid.user_id === bestAsk.user_id) {
        console.warn(`[MatchingEngine] Self-trading avoided for user_id=${bestBid.user_id}`);
        // Advance ask to avoid deadlocking
        asks.shift();
        continue;
      }

      // Determine trade execution price:
      // In price-time priority, the order that was placed first is the Maker.
      // Execution happens at the Maker's limit price.
      const isBidMaker = new Date(bestBid.created_at) <= new Date(bestAsk.created_at);
      const executionPrice = isBidMaker ? bidPrice : askPrice;

      // Executable quantity
      const tradeQuantity = Math.min(bestBid.remaining_quantity, bestAsk.remaining_quantity);

      if (tradeQuantity <= 0) break;

      // Execute trade atomically in database
      const tradeResult = await TradeExecutor.executeTrade(
        bestBid,
        bestAsk,
        tradeQuantity,
        executionPrice,
        stockSymbol
      );

      executedTrades.push({
        ...tradeResult,
        stockSymbol,
        buyerId: bestBid.user_id,
        sellerId: bestAsk.user_id
      });

      // Update in-memory representations
      bestBid.remaining_quantity -= tradeQuantity;
      bestAsk.remaining_quantity -= tradeQuantity;

      if (bestBid.remaining_quantity === 0) {
        bids.shift();
      }
      if (bestAsk.remaining_quantity === 0) {
        asks.shift();
      }
    }

    if (executedTrades.length > 0) {
      console.log(`[MatchingEngine] Executed ${executedTrades.length} trade(s) for ${stockSymbol}`);
    }

    return executedTrades;
  }
}

module.exports = MatchingEngine;
