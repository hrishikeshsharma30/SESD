const stockService = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getAllStocks = async (req, res, next) => {
  try {
    const { search } = req.query;
    const stocks = await stockService.getAllStocks(search);
    return sendSuccess(res, 'Stocks retrieved successfully', stocks);
  } catch (err) {
    next(err);
  }
};

const getStockById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stock = await stockService.getStockById(id);
    return sendSuccess(res, 'Stock details retrieved successfully', stock);
  } catch (err) {
    next(err);
  }
};

const createStock = async (req, res, next) => {
  try {
    const { symbol, company_name, current_price } = req.body;
    const stock = await stockService.createStock({ symbol, company_name, current_price });
    return sendSuccess(res, 'Stock created successfully', stock, 201);
  } catch (err) {
    next(err);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company_name, current_price } = req.body;
    const stock = await stockService.updateStock(id, { company_name, current_price });
    return sendSuccess(res, 'Stock updated successfully', stock);
  } catch (err) {
    next(err);
  }
};

const deleteStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await stockService.deleteStock(id);
    return sendSuccess(res, 'Stock deleted successfully', deleted);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock
};
