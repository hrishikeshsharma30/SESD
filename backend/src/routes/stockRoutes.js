const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// Public routes
router.get('/', stockController.getAllStocks);
router.get('/:id', stockController.getStockById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, stockController.createStock);
router.put('/:id', authenticate, requireAdmin, stockController.updateStock);
router.delete('/:id', authenticate, requireAdmin, stockController.deleteStock);

module.exports = router;
