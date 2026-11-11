const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token required. Format: Bearer <token>', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_virtual_stock_exchange_2026_sesd');

    const result = await db.query(
      'SELECT id, name, email, role, balance, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User account no longer exists', 401);
    }

    const user = result.rows[0];
    if (user.status === 'DEACTIVATED') {
      return sendError(res, 'Your account has been deactivated by the administrator', 403);
    }

    req.user = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      balance: parseFloat(user.balance),
      status: user.status
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return sendError(res, 'Invalid or expired authentication token', 401);
    }
    return next(err);
  }
};

module.exports = { authenticate };
