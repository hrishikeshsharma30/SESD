const { sendError } = require('../utils/apiResponse');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
};

module.exports = { requireAdmin };
