require('dotenv').config();
const app = require('./src/app');
const { seedDatabase } = require('./src/database/seed');
const { startPriceSimulation } = require('./src/services/priceService');

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Services
const startServer = async () => {
  try {
    // Run seed to ensure stocks and accounts exist
    await seedDatabase();

    // Start background stock price simulator (every 5 seconds)
    const intervalMs = parseInt(process.env.PRICE_SIMULATION_INTERVAL_MS || '5000', 10);
    startPriceSimulation(intervalMs);

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Virtual Stock Exchange Backend Server Running     `);
      console.log(`  Port: ${PORT}                                     `);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}    `);
      console.log(`  Health Check: http://localhost:${PORT}/api/health `);
      console.log(`====================================================`);
    });

    return server;
  } catch (err) {
    console.error('[Server Startup Error]:', err);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
