const transactionService = require('../services/transactionService');
const { sendSuccess } = require('../utils/apiResponse');

const getUserTransactions = async (req, res, next) => {
  try {
    const { type, limit, offset } = req.query;
    const transactions = await transactionService.getUserTransactions(req.user.id, { type, limit, offset });
    return sendSuccess(res, 'Transactions retrieved successfully', transactions);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserTransactions
};
