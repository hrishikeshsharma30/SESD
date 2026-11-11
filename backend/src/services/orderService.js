const db = require('../config/db');
const MatchingEngine = require('../matching-engine/matchingEngine');

const placeBuyOrder = async (userId, { stockId, quantity, price }) => {
  const qty = parseInt(quantity, 10);
  const prc = parseFloat(price);

  if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
    const error = new Error('Quantity and price must be positive numbers');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify stock exists
  const stockRes = await db.query('SELECT id, symbol, company_name FROM stocks WHERE id = $1', [stockId]);
  if (stockRes.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }
  const stock = stockRes.rows[0];

  const totalRequired = +(qty * prc).toFixed(2);

  // 2. Atomic Balance Check & Reservation
  const client = await db.getClient();
  let createdOrder;

  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentBalance = parseFloat(userRes.rows[0].balance);
    if (currentBalance < totalRequired) {
      const error = new Error(`Insufficient virtual balance. Required: ₹${totalRequired.toLocaleString('en-IN')}, Available: ₹${currentBalance.toLocaleString('en-IN')}`);
      error.statusCode = 400;
      throw error;
    }

    // Reserve virtual balance
    await client.query(
      'UPDATE users SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [totalRequired, userId]
    );

    // Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, remaining_quantity, price, status)
       VALUES ($1, $2, 'BUY', $3, $3, $4, 'OPEN')
       RETURNING *`,
      [userId, stockId, qty, prc]
    );
    createdOrder = orderRes.rows[0];

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // 3. Trigger Matching Engine
  const trades = await MatchingEngine.matchOrdersForStock(stockId);

  // Fetch refreshed order status after matching
  const updatedOrder = await db.query('SELECT * FROM orders WHERE id = $1', [createdOrder.id]);

  return {
    order: updatedOrder.rows[0],
    tradesExecuted: trades.filter(t => t.buy_order_id === createdOrder.id)
  };
};

const placeSellOrder = async (userId, { stockId, quantity, price }) => {
  const qty = parseInt(quantity, 10);
  const prc = parseFloat(price);

  if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
    const error = new Error('Quantity and price must be positive numbers');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify stock exists
  const stockRes = await db.query('SELECT id, symbol FROM stocks WHERE id = $1', [stockId]);
  if (stockRes.rows.length === 0) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Atomic Portfolio Holdings Check & Share Reservation
  const client = await db.getClient();
  let createdOrder;

  try {
    await client.query('BEGIN');

    const portRes = await client.query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    const availableShares = portRes.rows.length > 0 ? portRes.rows[0].quantity : 0;
    if (availableShares < qty) {
      const error = new Error(`Insufficient shares to sell. Required: ${qty}, Available in Portfolio: ${availableShares}`);
      error.statusCode = 400;
      throw error;
    }

    // Reserve shares from portfolio
    await client.query(
      'UPDATE portfolio SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND stock_id = $3',
      [qty, userId, stockId]
    );

    // Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, remaining_quantity, price, status)
       VALUES ($1, $2, 'SELL', $3, $3, $4, 'OPEN')
       RETURNING *`,
      [userId, stockId, qty, prc]
    );
    createdOrder = orderRes.rows[0];

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // 3. Trigger Matching Engine
  const trades = await MatchingEngine.matchOrdersForStock(stockId);

  // Fetch refreshed order status
  const updatedOrder = await db.query('SELECT * FROM orders WHERE id = $1', [createdOrder.id]);

  return {
    order: updatedOrder.rows[0],
    tradesExecuted: trades.filter(t => t.sell_order_id === createdOrder.id)
  };
};

const cancelOrder = async (userId, orderId) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderRes.rows.length === 0) {
      const error = new Error('Order not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    const order = orderRes.rows[0];

    if (order.status !== 'OPEN' && order.status !== 'PARTIALLY_FILLED') {
      const error = new Error(`Cannot cancel order with status '${order.status}'`);
      error.statusCode = 400;
      throw error;
    }

    const remainingQty = order.remaining_quantity;
    if (remainingQty > 0) {
      if (order.order_type === 'BUY') {
        // Refund reserved balance
        const refundAmount = +(remainingQty * parseFloat(order.price)).toFixed(2);
        await client.query(
          'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [refundAmount, userId]
        );

        await client.query(
          `INSERT INTO transactions (user_id, transaction_type, amount, description)
           VALUES ($1, 'ORDER_CANCEL_REFUND', $2, $3)`,
          [userId, refundAmount, `Refund for cancelled BUY order #${order.id} (${remainingQty} shares @ ₹${order.price})`]
        );
      } else if (order.order_type === 'SELL') {
        // Return reserved shares to portfolio
        await client.query(
          `UPDATE portfolio
           SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2 AND stock_id = $3`,
          [remainingQty, userId, order.stock_id]
        );
      }
    }

    // Mark order CANCELLED
    await client.query(
      `UPDATE orders
       SET status = 'CANCELLED', remaining_quantity = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );

    const updatedOrderRes = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);

    await client.query('COMMIT');
    return updatedOrderRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getUserOrders = async (userId, statusFilter) => {
  let queryText = `
    SELECT o.*, s.symbol, s.company_name
    FROM orders o
    JOIN stocks s ON o.stock_id = s.id
    WHERE o.user_id = $1
  `;
  const params = [userId];

  if (statusFilter) {
    queryText += ' AND o.status = $2';
    params.push(statusFilter.toUpperCase());
  }

  queryText += ' ORDER BY o.created_at DESC';

  const result = await db.query(queryText, params);
  return result.rows.map(o => ({
    id: Number(o.id),
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

const getOpenOrders = async (userId) => {
  const result = await db.query(
    `SELECT o.*, s.symbol, s.company_name
     FROM orders o
     JOIN stocks s ON o.stock_id = s.id
     WHERE o.user_id = $1 AND o.status IN ('OPEN', 'PARTIALLY_FILLED')
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getOrderHistory = async (userId) => {
  const result = await db.query(
    `SELECT o.*, s.symbol, s.company_name
     FROM orders o
     JOIN stocks s ON o.stock_id = s.id
     WHERE o.user_id = $1 AND o.status IN ('FILLED', 'CANCELLED')
     ORDER BY o.updated_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  placeBuyOrder,
  placeSellOrder,
  cancelOrder,
  getUserOrders,
  getOpenOrders,
  getOrderHistory
};
