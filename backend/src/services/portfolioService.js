const db = require('../config/db');

const getUserPortfolio = async (userId) => {
  // Fetch user's cash balance
  const userRes = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);
  const cashBalance = userRes.rows.length > 0 ? parseFloat(userRes.rows[0].balance) : 0;

  // Fetch portfolio holdings joined with current stock prices
  const result = await db.query(
    `SELECT p.*, s.symbol, s.company_name, s.current_price, s.previous_price
     FROM portfolio p
     JOIN stocks s ON p.stock_id = s.id
     WHERE p.user_id = $1 AND p.quantity > 0
     ORDER BY s.symbol ASC`,
    [userId]
  );

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const holdings = result.rows.map((row) => {
    const qty = Number(row.quantity);
    const avgPrice = parseFloat(row.average_price);
    const currentPrice = parseFloat(row.current_price);

    const invested = +(qty * avgPrice).toFixed(2);
    const currentValue = +(qty * currentPrice).toFixed(2);
    const profitLoss = +(currentValue - invested).toFixed(2);
    const profitLossPercent = invested > 0 ? +((profitLoss / invested) * 100).toFixed(2) : 0;

    totalInvested += invested;
    totalCurrentValue += currentValue;

    return {
      id: Number(row.id),
      stockId: Number(row.stock_id),
      symbol: row.symbol,
      company_name: row.company_name,
      quantity: qty,
      average_price: avgPrice,
      current_price: currentPrice,
      invested_value: invested,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      updated_at: row.updated_at
    };
  });

  const totalProfitLoss = +(totalCurrentValue - totalInvested).toFixed(2);
  const totalProfitLossPercent = totalInvested > 0 ? +((totalProfitLoss / totalInvested) * 100).toFixed(2) : 0;
  const totalNetWorth = +(cashBalance + totalCurrentValue).toFixed(2);

  return {
    summary: {
      cash_balance: cashBalance,
      portfolio_value: +totalCurrentValue.toFixed(2),
      total_invested: +totalInvested.toFixed(2),
      total_profit_loss: totalProfitLoss,
      total_profit_loss_percent: totalProfitLossPercent,
      total_net_worth: totalNetWorth,
      holdings_count: holdings.length
    },
    holdings
  };
};

const getStockPortfolio = async (userId, stockId) => {
  const result = await db.query(
    `SELECT p.*, s.symbol, s.company_name, s.current_price
     FROM portfolio p
     JOIN stocks s ON p.stock_id = s.id
     WHERE p.user_id = $1 AND p.stock_id = $2`,
    [userId, stockId]
  );

  if (result.rows.length === 0 || result.rows[0].quantity === 0) {
    return {
      stockId: Number(stockId),
      quantity: 0,
      average_price: 0,
      current_price: 0,
      current_value: 0,
      profit_loss: 0,
      profit_loss_percent: 0
    };
  }

  const row = result.rows[0];
  const qty = Number(row.quantity);
  const avgPrice = parseFloat(row.average_price);
  const currentPrice = parseFloat(row.current_price);
  const invested = +(qty * avgPrice).toFixed(2);
  const currentValue = +(qty * currentPrice).toFixed(2);
  const profitLoss = +(currentValue - invested).toFixed(2);
  const profitLossPercent = invested > 0 ? +((profitLoss / invested) * 100).toFixed(2) : 0;

  return {
    id: Number(row.id),
    stockId: Number(row.stock_id),
    symbol: row.symbol,
    company_name: row.company_name,
    quantity: qty,
    average_price: avgPrice,
    current_price: currentPrice,
    invested_value: invested,
    current_value: currentValue,
    profit_loss: profitLoss,
    profit_loss_percent: profitLossPercent,
    updated_at: row.updated_at
  };
};

module.exports = {
  getUserPortfolio,
  getStockPortfolio
};
