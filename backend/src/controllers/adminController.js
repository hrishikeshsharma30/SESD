const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const updated = await adminService.updateUserStatus(id, status);
    return sendSuccess(res, `User status updated to ${status}`, updated);
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();
    return sendSuccess(res, 'All orders retrieved successfully', orders);
  } catch (err) {
    next(err);
  }
};

const getAllTrades = async (req, res, next) => {
  try {
    const trades = await adminService.getAllTrades();
    return sendSuccess(res, 'All trades retrieved successfully', trades);
  } catch (err) {
    next(err);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const stats = await adminService.getSystemStats();
    return sendSuccess(res, 'System statistics retrieved successfully', stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllTrades,
  getSystemStats
};
