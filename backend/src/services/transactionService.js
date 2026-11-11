const db = require('../config/db');

const getUserTransactions = async (userId, { type, limit = 50, offset = 0 } = {}) => {
  let queryText = `
    SELECT t.*, tr.quantity as trade_quantity, tr.price as trade_price, s.symbol as stock_symbol, s.company_name
    FROM transactions t
    LEFT JOIN trades tr ON t.trade_id = tr.id
    LEFT JOIN stocks s ON tr.stock_id = s.id
    WHERE t.user_id = $1
  `;
  const params = [userId];

  if (type) {
    queryText += ' AND t.transaction_type = $2';
    params.push(type.toUpperCase());
  }

  queryText += ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const result = await db.query(queryText, params);

  return result.rows.map(row => ({
    id: Number(row.id),
    trade_id: row.trade_id ? Number(row.trade_id) : null,
    transaction_type: row.transaction_type,
    amount: parseFloat(row.amount),
    description: row.description,
    trade_quantity: row.trade_quantity ? Number(row.trade_quantity) : null,
    trade_price: row.trade_price ? parseFloat(row.trade_price) : null,
    stock_symbol: row.stock_symbol || null,
    company_name: row.company_name || null,
    created_at: row.created_at
  }));
};

module.exports = {
  getUserTransactions
};
