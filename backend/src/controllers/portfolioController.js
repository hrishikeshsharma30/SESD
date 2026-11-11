const portfolioService = require('../services/portfolioService');
const { sendSuccess } = require('../utils/apiResponse');

const getUserPortfolio = async (req, res, next) => {
  try {
    const portfolio = await portfolioService.getUserPortfolio(req.user.id);
    return sendSuccess(res, 'Portfolio retrieved successfully', portfolio);
  } catch (err) {
    next(err);
  }
};

const getStockPortfolio = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const stockPortfolio = await portfolioService.getStockPortfolio(req.user.id, stockId);
    return sendSuccess(res, 'Stock portfolio details retrieved successfully', stockPortfolio);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserPortfolio,
  getStockPortfolio
};
