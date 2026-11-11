const orderService = require('../services/orderService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const createBuyOrder = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;

    if (!stockId || !quantity || !price) {
      return sendError(res, 'Stock ID, quantity, and price are required', 400);
    }

    const result = await orderService.placeBuyOrder(req.user.id, { stockId, quantity, price });
    return sendSuccess(res, 'Buy order placed successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

const createSellOrder = async (req, res, next) => {
  try {
    const { stockId, quantity, price } = req.body;

    if (!stockId || !quantity || !price) {
      return sendError(res, 'Stock ID, quantity, and price are required', 400);
    }

    const result = await orderService.placeSellOrder(req.user.id, { stockId, quantity, price });
    return sendSuccess(res, 'Sell order placed successfully', result, 201);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cancelled = await orderService.cancelOrder(req.user.id, id);
    return sendSuccess(res, 'Order cancelled successfully and funds/shares released', cancelled);
  } catch (err) {
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const orders = await orderService.getUserOrders(req.user.id, status);
    return sendSuccess(res, 'Orders retrieved successfully', orders);
  } catch (err) {
    next(err);
  }
};

const getOpenOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOpenOrders(req.user.id);
    return sendSuccess(res, 'Open orders retrieved successfully', orders);
  } catch (err) {
    next(err);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await orderService.getOrderHistory(req.user.id);
    return sendSuccess(res, 'Order history retrieved successfully', orders);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBuyOrder,
  createSellOrder,
  cancelOrder,
  getUserOrders,
  getOpenOrders,
  getOrderHistory
};
