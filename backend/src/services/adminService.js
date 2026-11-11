const db = require('../config/db');

const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, name, email, role, balance, status, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows.map(u => ({
    id: Number(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    balance: parseFloat(u.balance),
    status: u.status,
    created_at: u.created_at,
    updated_at: u.updated_at
  }));
};

const updateUserStatus = async (userId, status) => {
  if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
    const error = new Error("Status must be 'ACTIVE' or 'DEACTIVATED'");
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, status',
    [status, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const getAllOrders = async () => {
  const result = await db.query(
    `SELECT o.*, u.name as user_name, u.email as user_email, s.symbol, s.company_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN stocks s ON o.stock_id = s.id
     ORDER BY o.created_at DESC`
  );
  return result.rows.map(o => ({
    id: Number(o.id),
    user_id: Number(o.user_id),
    user_name: o.user_name,
    user_email: o.user_email,
    stock_id: Number(o.stock_id),
    symbol: o.symbol,
    company_name: o.company_name,
    order_type: o.order_type,
    quantity: o.quantity,
    remaining_quantity: o.remaining_quantity,
    price: parseFloat(o.price),
    status: o.status,
    created_at: o.created_at,
    updated_at: o.updated_at
  }));
};

const getAllTrades = async () => {
  const result = await db.query(
    `SELECT t.*, s.symbol, s.company_name,
            b.name as buyer_name, b.email as buyer_email,
            sl.name as seller_name, sl.email as seller_email
     FROM trades t
     JOIN stocks s ON t.stock_id = s.id
     JOIN users b ON t.buyer_id = b.id
     JOIN users sl ON t.seller_id = sl.id
     ORDER BY t.executed_at DESC`
  );
  return result.rows.map(t => ({
    id: Number(t.id),
    buy_order_id: Number(t.buy_order_id),
    sell_order_id: Number(t.sell_order_id),
    buyer_id: Number(t.buyer_id),
    buyer_name: t.buyer_name,
    seller_id: Number(t.seller_id),
    seller_name: t.seller_name,
    stock_id: Number(t.stock_id),
    symbol: t.symbol,
    company_name: t.company_name,
    quantity: t.quantity,
    price: parseFloat(t.price),
    total_amount: +(t.quantity * parseFloat(t.price)).toFixed(2),
    executed_at: t.executed_at
  }));
};

const getSystemStats = async () => {
  const totalUsersRes = await db.query('SELECT COUNT(*) as count FROM users');
  const activeUsersRes = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'ACTIVE'");
  const totalStocksRes = await db.query('SELECT COUNT(*) as count FROM stocks');
  const openOrdersRes = await db.query("SELECT COUNT(*) as count FROM orders WHERE status IN ('OPEN', 'PARTIALLY_FILLED')");
  const tradesRes = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(quantity * price), 0) as total_volume FROM trades');
  const systemLiquidityRes = await db.query('SELECT COALESCE(SUM(balance), 0) as total_cash FROM users');

  return {
    totalUsers: Number(totalUsersRes.rows[0].count),
    activeUsers: Number(activeUsersRes.rows[0].count),
    totalStocks: Number(totalStocksRes.rows[0].count),
    openOrders: Number(openOrdersRes.rows[0].count),
    completedTrades: Number(tradesRes.rows[0].count),
    totalVolume: parseFloat(tradesRes.rows[0].total_volume),
    systemLiquidity: parseFloat(systemLiquidityRes.rows[0].total_cash)
  };
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllTrades,
  getSystemStats
};
