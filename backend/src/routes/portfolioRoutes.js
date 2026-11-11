const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', portfolioController.getUserPortfolio);
router.get('/:stockId', portfolioController.getStockPortfolio);

module.exports = router;
