const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/buy', orderController.createBuyOrder);
router.post('/sell', orderController.createSellOrder);
router.get('/', orderController.getUserOrders);
router.get('/open', orderController.getOpenOrders);
router.get('/history', orderController.getOrderHistory);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
