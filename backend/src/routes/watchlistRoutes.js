const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', watchlistController.getUserWatchlist);
router.post('/:stockId', watchlistController.addToWatchlist);
router.delete('/:stockId', watchlistController.removeFromWatchlist);

module.exports = router;
