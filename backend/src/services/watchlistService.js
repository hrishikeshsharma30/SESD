const db = require('../config/db');
const { formatStock } = require('./stockService');

const getUserWatchlist = async (userId) => {
  const result = await db.query(
    `SELECT s.*, w.created_at as added_at
     FROM watchlist w
     JOIN stocks s ON w.stock_id = s.id
     WHERE w.user_id = $1
     ORDER BY s.symbol ASC`,
    [userId]
  );

  return result.rows.map(row => ({
    ...formatStock(row),
    added_at: row.added_at
  }));
};

const addToWatchlist = async (userId, stockId) => {
  // Check stock exists
  const stockRes = await db.query('SELECT id FROM stocks WHERE id = $1', [stockId]);
  if (stockRes.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if already in watchlist
  const existing = await db.query('SELECT id FROM watchlist WHERE user_id = $1 AND stock_id = $2', [userId, stockId]);
  if (existing.rows.length > 0) {
    const error = new Error('Stock is already in your watchlist');
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    'INSERT INTO watchlist (user_id, stock_id) VALUES ($1, $2) RETURNING *',
    [userId, stockId]
  );

  return result.rows[0];
};

const removeFromWatchlist = async (userId, stockId) => {
  const result = await db.query(
    'DELETE FROM watchlist WHERE user_id = $1 AND stock_id = $2 RETURNING *',
    [userId, stockId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Stock is not in your watchlist');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
