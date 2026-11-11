const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All admin routes require JWT authentication and ADMIN role
router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getSystemStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/orders', adminController.getAllOrders);
router.get('/trades', adminController.getAllTrades);

module.exports = router;
