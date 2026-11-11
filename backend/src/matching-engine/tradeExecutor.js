const db = require('../config/db');

class TradeExecutor {
  /**
   * Execute an atomic trade between a buyer and seller in a database transaction
   * @param {Object} buyOrder - Open Buy order
   * @param {Object} sellOrder - Open Sell order
   * @param {number} quantity - Quantity to execute
   * @param {number} executionPrice - Execution price (maker order price)
   * @param {string} stockSymbol - Symbol for ledger logs
   */
  static async executeTrade(buyOrder, sellOrder, quantity, executionPrice, stockSymbol) {
    const client = await db.getClient();
    const tradeAmount = +(quantity * executionPrice).toFixed(2);

    try {
      await client.query('BEGIN');

      // 1. Create Trade record
      const tradeRes = await client.query(
        `INSERT INTO trades (buy_order_id, sell_order_id, buyer_id, seller_id, stock_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, executed_at`,
        [buyOrder.id, sellOrder.id, buyOrder.user_id, sellOrder.user_id, buyOrder.stock_id, quantity, executionPrice]
      );
      const tradeId = tradeRes.rows[0].id;

      // 2. Update Buy Order remaining quantity & status
      const buyRemaining = buyOrder.remaining_quantity - quantity;
      const buyStatus = buyRemaining === 0 ? 'FILLED' : 'PARTIALLY_FILLED';
      await client.query(
        `UPDATE orders
         SET remaining_quantity = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [buyRemaining, buyStatus, buyOrder.id]
      );

      // 3. Update Sell Order remaining quantity & status
      const sellRemaining = sellOrder.remaining_quantity - quantity;
      const sellStatus = sellRemaining === 0 ? 'FILLED' : 'PARTIALLY_FILLED';
      await client.query(
        `UPDATE orders
         SET remaining_quantity = $1, status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [sellRemaining, sellStatus, sellOrder.id]
      );

      // 4. Update Buyer Portfolio
      // Check existing holdings
      const buyerPortRes = await client.query(
        'SELECT quantity, average_price FROM portfolio WHERE user_id = $1 AND stock_id = $2',
        [buyOrder.user_id, buyOrder.stock_id]
      );

      if (buyerPortRes.rows.length === 0) {
        await client.query(
          `INSERT INTO portfolio (user_id, stock_id, quantity, average_price)
           VALUES ($1, $2, $3, $4)`,
          [buyOrder.user_id, buyOrder.stock_id, quantity, executionPrice]
        );
      } else {
        const existingQty = buyerPortRes.rows[0].quantity;
        const existingAvg = parseFloat(buyerPortRes.rows[0].average_price);
        const newTotalQty = existingQty + quantity;
        const newAvgPrice = +(((existingQty * existingAvg) + (quantity * executionPrice)) / newTotalQty).toFixed(2);

        await client.query(
          `UPDATE portfolio
           SET quantity = $1, average_price = $2, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $3 AND stock_id = $4`,
          [newTotalQty, newAvgPrice, buyOrder.user_id, buyOrder.stock_id]
        );
      }

      // 5. Update Seller Virtual Balance (+ tradeAmount)
      await client.query(
        `UPDATE users
         SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [tradeAmount, sellOrder.user_id]
      );

      // 6. Check if Buyer gets price improvement refund
      // (If buyer bid @ 3600 but maker sell was @ 3500, difference of ₹100/share is refunded to buyer)
      const buyBidPrice = parseFloat(buyOrder.price);
      if (buyBidPrice > executionPrice) {
        const refundAmount = +((buyBidPrice - executionPrice) * quantity).toFixed(2);
        await client.query(
          `UPDATE users
           SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [refundAmount, buyOrder.user_id]
        );

        await client.query(
          `INSERT INTO transactions (user_id, trade_id, transaction_type, amount, description)
           VALUES ($1, $2, 'ORDER_CANCEL_REFUND', $3, $4)`,
          [
            buyOrder.user_id,
            tradeId,
            refundAmount,
            `Price improvement refund on ${quantity} shares of ${stockSymbol} (bid ₹${buyBidPrice}, executed @ ₹${executionPrice})`
          ]
        );
      }

      // 7. Record Transaction Log for Buyer
      await client.query(
        `INSERT INTO transactions (user_id, trade_id, transaction_type, amount, description)
         VALUES ($1, $2, 'BUY_DEDUCTION', $3, $4)`,
        [
          buyOrder.user_id,
          tradeId,
          tradeAmount,
          `Bought ${quantity} shares of ${stockSymbol} @ ₹${executionPrice}`
        ]
      );

      // 8. Record Transaction Log for Seller
      await client.query(
        `INSERT INTO transactions (user_id, trade_id, transaction_type, amount, description)
         VALUES ($1, $2, 'SELL_CREDIT', $3, $4)`,
        [
          sellOrder.user_id,
          tradeId,
          tradeAmount,
          `Sold ${quantity} shares of ${stockSymbol} @ ₹${executionPrice}`
        ]
      );

      // 9. Update current stock price to latest executed trade price
      await client.query(
        `UPDATE stocks
         SET previous_price = current_price, current_price = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [executionPrice, buyOrder.stock_id]
      );

      await client.query('COMMIT');

      return {
        tradeId,
        quantity,
        price: executionPrice,
        amount: tradeAmount,
        buyRemaining,
        sellRemaining,
        buyStatus,
        sellStatus
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[TradeExecutor Error - Transaction Rolled Back]:', err);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = TradeExecutor;
