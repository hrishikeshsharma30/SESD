const watchlistService = require('../services/watchlistService');
const { sendSuccess } = require('../utils/apiResponse');

const getUserWatchlist = async (req, res, next) => {
  try {
    const watchlist = await watchlistService.getUserWatchlist(req.user.id);
    return sendSuccess(res, 'Watchlist retrieved successfully', watchlist);
  } catch (err) {
    next(err);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const added = await watchlistService.addToWatchlist(req.user.id, stockId);
    return sendSuccess(res, 'Stock added to watchlist', added, 201);
  } catch (err) {
    next(err);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const { stockId } = req.params;
    const removed = await watchlistService.removeFromWatchlist(req.user.id, stockId);
    return sendSuccess(res, 'Stock removed from watchlist', removed);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
