const db = require('../config/db');

let priceInterval = null;

/**
 * Geometric Brownian Motion / Random Walk Price Generator
 * Simulates real-world market movements between -1.5% and +1.5%
 */
const updateStockPrices = async () => {
  try {
    const stocks = await db.query('SELECT id, symbol, current_price FROM stocks');

    for (const stock of stocks.rows) {
      const current = parseFloat(stock.current_price);
      // Fluctuation between -1.5% and +1.5%
      const percentageChange = (Math.random() * 0.03) - 0.0145; 
      let newPrice = +(current * (1 + percentageChange)).toFixed(2);

      // Prevent unrealistically low prices
      if (newPrice < 1.00) newPrice = 1.00;

      await db.query(
        `UPDATE stocks
         SET previous_price = current_price,
             current_price = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newPrice, stock.id]
      );
    }
  } catch (err) {
    console.error('[Price Service Error]:', err.message);
  }
};

const startPriceSimulation = (intervalMs = 6000) => {
  if (priceInterval) return;
  console.log(`[Price Service] Started simulated stock ticker (every ${intervalMs}ms)`);
  priceInterval = setInterval(updateStockPrices, intervalMs);
};

const stopPriceSimulation = () => {
  if (priceInterval) {
    clearInterval(priceInterval);
    priceInterval = null;
    console.log('[Price Service] Stopped simulated stock ticker');
  }
};

module.exports = {
  updateStockPrices,
  startPriceSimulation,
  stopPriceSimulation
};
