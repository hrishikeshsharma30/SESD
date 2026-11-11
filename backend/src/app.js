const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Virtual Stock Exchange & Trading System API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
