const db = require('../config/db');

const formatStock = (stock) => {
  const current = parseFloat(stock.current_price);
  const previous = parseFloat(stock.previous_price || stock.current_price);
  const change = +(current - previous).toFixed(2);
  const changePercent = previous > 0 ? +((change / previous) * 100).toFixed(2) : 0;

  return {
    id: Number(stock.id),
    symbol: stock.symbol,
    company_name: stock.company_name,
    current_price: current,
    previous_price: previous,
    change,
    changePercent,
    created_at: stock.created_at,
    updated_at: stock.updated_at
  };
};

const getAllStocks = async (search = '') => {
  let queryText = 'SELECT * FROM stocks';
  const params = [];

  if (search && search.trim() !== '') {
    queryText += ' WHERE UPPER(symbol) LIKE $1 OR UPPER(company_name) LIKE $1';
    params.push(`%${search.trim().toUpperCase()}%`);
  }

  queryText += ' ORDER BY symbol ASC';

  const result = await db.query(queryText, params);
  return result.rows.map(formatStock);
};

const getStockById = async (stockId) => {
  const result = await db.query('SELECT * FROM stocks WHERE id = $1', [stockId]);
  if (result.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  const stock = formatStock(result.rows[0]);

  // Fetch Order Book Depth (top 5 buy bids and top 5 sell asks)
  const bidsRes = await db.query(
    `SELECT price, SUM(remaining_quantity) as total_quantity, COUNT(id) as orders_count
     FROM orders
     WHERE stock_id = $1 AND order_type = 'BUY' AND status IN ('OPEN', 'PARTIALLY_FILLED')
     GROUP BY price
     ORDER BY price DESC
     LIMIT 5`,
    [stockId]
  );

  const asksRes = await db.query(
    `SELECT price, SUM(remaining_quantity) as total_quantity, COUNT(id) as orders_count
     FROM orders
     WHERE stock_id = $1 AND order_type = 'SELL' AND status IN ('OPEN', 'PARTIALLY_FILLED')
     GROUP BY price
     ORDER BY price ASC
     LIMIT 5`,
    [stockId]
  );

  // Fetch recent trades for this stock
  const recentTradesRes = await db.query(
    `SELECT id, quantity, price, executed_at
     FROM trades
     WHERE stock_id = $1
     ORDER BY executed_at DESC
     LIMIT 10`,
    [stockId]
  );

  return {
    ...stock,
    orderBook: {
      bids: bidsRes.rows.map(r => ({ price: parseFloat(r.price), quantity: Number(r.total_quantity), ordersCount: Number(r.orders_count) })),
      asks: asksRes.rows.map(r => ({ price: parseFloat(r.price), quantity: Number(r.total_quantity), ordersCount: Number(r.orders_count) }))
    },
    recentTrades: recentTradesRes.rows.map(t => ({
      id: Number(t.id),
      quantity: Number(t.quantity),
      price: parseFloat(t.price),
      executed_at: t.executed_at
    }))
  };
};

const createStock = async ({ symbol, company_name, current_price }) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  const price = parseFloat(current_price);

  if (!cleanSymbol || !company_name || isNaN(price) || price <= 0) {
    const error = new Error('Valid symbol, company name, and positive price are required');
    error.statusCode = 400;
    throw error;
  }

  const existing = await db.query('SELECT id FROM stocks WHERE symbol = $1', [cleanSymbol]);
  if (existing.rows.length > 0) {
    const error = new Error(`Stock with symbol ${cleanSymbol} already exists`);
    error.statusCode = 409;
    throw error;
  }

  const result = await db.query(
    `INSERT INTO stocks (symbol, company_name, current_price, previous_price)
     VALUES ($1, $2, $3, $3)
     RETURNING *`,
    [cleanSymbol, company_name.trim(), price]
  );

  return formatStock(result.rows[0]);
};

const updateStock = async (stockId, { company_name, current_price }) => {
  const stock = await db.query('SELECT * FROM stocks WHERE id = $1', [stockId]);
  if (stock.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  const existing = stock.rows[0];
  const newName = company_name ? company_name.trim() : existing.company_name;
  const newPrice = current_price ? parseFloat(current_price) : parseFloat(existing.current_price);

  if (newPrice <= 0) {
    const error = new Error('Stock price must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `UPDATE stocks
     SET company_name = $1,
         previous_price = current_price,
         current_price = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [newName, newPrice, stockId]
  );

  return formatStock(result.rows[0]);
};

const deleteStock = async (stockId) => {
  const result = await db.query('DELETE FROM stocks WHERE id = $1 RETURNING id, symbol', [stockId]);
  if (result.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }
  return result.rows[0];
};

module.exports = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  formatStock
};
