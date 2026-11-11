const test = require('node:test');
const assert = require('node:assert');
const authService = require('../src/services/authService');
const stockService = require('../src/services/stockService');
const orderService = require('../src/services/orderService');
const portfolioService = require('../src/services/portfolioService');
const transactionService = require('../src/services/transactionService');
const watchlistService = require('../src/services/watchlistService');
const adminService = require('../src/services/adminService');
const { seedDatabase } = require('../src/database/seed');

test('Virtual Stock Exchange Test Suite', async (t) => {
  // Ensure database is seeded
  await seedDatabase();

  let buyerUser;
  let sellerUser;
  let testStock;

  await t.test('1. User Registration & ₹10,00,000 Starting Virtual Balance', async () => {
    const timestamp = Date.now();
    const buyer = await authService.register({
      name: 'Test Buyer',
      email: `buyer_${timestamp}@test.com`,
      password: 'Password123'
    });

    assert.strictEqual(buyer.user.balance, 1000000);
    assert.strictEqual(buyer.user.role, 'INVESTOR');
    assert.ok(buyer.token, 'JWT token should be generated');
    buyerUser = buyer.user;

    const seller = await authService.register({
      name: 'Test Seller',
      email: `seller_${timestamp}@test.com`,
      password: 'Password123'
    });
    assert.strictEqual(seller.user.balance, 1000000);
    sellerUser = seller.user;

    // Check transaction ledger for initial deposit
    const txs = await transactionService.getUserTransactions(buyerUser.id);
    assert.strictEqual(txs.length, 1);
    assert.strictEqual(txs[0].transaction_type, 'INITIAL_DEPOSIT');
    assert.strictEqual(txs[0].amount, 1000000);
  });

  await t.test('2. Duplicate Email Registration Prevention', async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          name: 'Duplicate',
          email: buyerUser.email,
          password: 'Password123'
        });
      },
      (err) => err.statusCode === 409
    );
  });

  await t.test('3. Stocks Fetching & Format', async () => {
    const stocks = await stockService.getAllStocks();
    assert.ok(stocks.length >= 8, 'Should have at least 8 seeded stocks');
    testStock = stocks.find(s => s.symbol === 'TCS');
    assert.ok(testStock, 'TCS stock should exist');
    assert.strictEqual(typeof testStock.current_price, 'number');
  });

  await t.test('4. Buy Order Validation - Insufficient Balance Protection', async () => {
    await assert.rejects(
      async () => {
        // Attempt to buy more than ₹10,00,000 balance
        await orderService.placeBuyOrder(buyerUser.id, {
          stockId: testStock.id,
          quantity: 1000,
          price: 5000 // 1000 * 5000 = ₹50,00,000 > ₹10,00,000
        });
      },
      (err) => {
        assert.match(err.message, /Insufficient virtual balance/);
        return true;
      }
    );
  });

  await t.test('5. Sell Order Validation - Cannot Sell Shares Not Owned', async () => {
    await assert.rejects(
      async () => {
        await orderService.placeSellOrder(sellerUser.id, {
          stockId: testStock.id,
          quantity: 10,
          price: 3500
        });
      },
      (err) => {
        assert.match(err.message, /Insufficient shares to sell/);
        return true;
      }
    );
  });

  await t.test('6. Order Cancellation & Fund Refund', async () => {
    // Place a buy order that rests in the book
    const placed = await orderService.placeBuyOrder(buyerUser.id, {
      stockId: testStock.id,
      quantity: 5,
      price: 2000 // Low price, won't match immediately
    });

    const buyerProfileBefore = await authService.getMe(buyerUser.id);
    // Balance should be reduced by 5 * 2000 = 10,000
    assert.strictEqual(buyerProfileBefore.balance, 1000000 - 10000);

    // Cancel order
    const cancelled = await orderService.cancelOrder(buyerUser.id, placed.order.id);
    assert.strictEqual(cancelled.status, 'CANCELLED');

    const buyerProfileAfter = await authService.getMe(buyerUser.id);
    // Balance should be fully refunded to ₹10,00,000
    assert.strictEqual(buyerProfileAfter.balance, 1000000);
  });

  await t.test('7. Order Matching Engine - Compatible Match & Atomic Execution', async () => {
    const db = require('../src/config/db');

    // Give seller 20 shares of TCS in portfolio
    await db.query(
      `INSERT INTO portfolio (user_id, stock_id, quantity, average_price)
       VALUES ($1, $2, 20, 3500.00)`,
      [sellerUser.id, testStock.id]
    );

    // Seller places resting SELL limit order: 10 shares @ ₹3600
    const sellRes = await orderService.placeSellOrder(sellerUser.id, {
      stockId: testStock.id,
      quantity: 10,
      price: 3600
    });

    assert.strictEqual(sellRes.order.status, 'OPEN');

    // Buyer places BUY order: 10 shares @ ₹3600
    const buyRes = await orderService.placeBuyOrder(buyerUser.id, {
      stockId: testStock.id,
      quantity: 10,
      price: 3600
    });

    // Check that order matched and filled
    assert.strictEqual(buyRes.order.status, 'FILLED');
    assert.strictEqual(buyRes.order.remaining_quantity, 0);

    // Verify Buyer Portfolio
    const buyerPort = await portfolioService.getUserPortfolio(buyerUser.id);
    const buyerHolding = buyerPort.holdings.find(h => h.stockId === testStock.id);
    assert.ok(buyerHolding, 'Buyer should now have TCS shares in portfolio');
    assert.strictEqual(buyerHolding.quantity, 10);
    assert.strictEqual(buyerHolding.average_price, 3600);

    // Verify Seller Received Funds (+ ₹36,000)
    const sellerProfile = await authService.getMe(sellerUser.id);
    assert.strictEqual(sellerProfile.balance, 1000000 + 36000);
  });

  await t.test('8. Watchlist Add & Remove', async () => {
    const added = await watchlistService.addToWatchlist(buyerUser.id, testStock.id);
    assert.ok(added);

    const list = await watchlistService.getUserWatchlist(buyerUser.id);
    assert.ok(list.some(s => s.id === testStock.id));

    const removed = await watchlistService.removeFromWatchlist(buyerUser.id, testStock.id);
    assert.ok(removed);
  });

  await t.test('9. Admin System Statistics', async () => {
    const stats = await adminService.getSystemStats();
    assert.ok(stats.totalUsers >= 2);
    assert.ok(stats.totalStocks >= 8);
    assert.ok(stats.completedTrades >= 1);
  });
});
