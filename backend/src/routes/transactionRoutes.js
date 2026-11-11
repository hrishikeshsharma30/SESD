const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', transactionController.getUserTransactions);

module.exports = router;
