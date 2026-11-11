const bcrypt = require('bcryptjs');
const db = require('../config/db');

const initialStocks = [
  { symbol: 'TCS', company_name: 'Tata Consultancy Services Ltd.', current_price: 3850.00, previous_price: 3820.00 },
  { symbol: 'INFY', company_name: 'Infosys Limited', current_price: 1620.00, previous_price: 1635.00 },
  { symbol: 'RELIANCE', company_name: 'Reliance Industries Ltd.', current_price: 2980.00, previous_price: 2940.00 },
  { symbol: 'HDFCBANK', company_name: 'HDFC Bank Limited', current_price: 1680.00, previous_price: 1675.00 },
  { symbol: 'ICICIBANK', company_name: 'ICICI Bank Limited', current_price: 1120.00, previous_price: 1110.00 },
  { symbol: 'WIPRO', company_name: 'Wipro Limited', current_price: 480.00, previous_price: 485.00 },
  { symbol: 'ITC', company_name: 'ITC Limited', current_price: 435.00, previous_price: 430.00 },
  { symbol: 'SBIN', company_name: 'State Bank of India', current_price: 790.00, previous_price: 785.00 }
];

const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding...');

  try {
    // 1. Seed Stocks
    for (const s of initialStocks) {
      const existing = await db.query('SELECT id FROM stocks WHERE symbol = $1', [s.symbol]);
      if (existing.rows.length === 0) {
        await db.query(
          'INSERT INTO stocks (symbol, company_name, current_price, previous_price) VALUES ($1, $2, $3, $4)',
          [s.symbol, s.company_name, s.current_price, s.previous_price]
        );
      }
    }
    console.log(`[Seed] Seeded ${initialStocks.length} demo stocks.`);

    // 2. Seed Admin User
    const adminEmail = 'admin@exchange.com';
    const adminCheck = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    let adminId;
    if (adminCheck.rows.length === 0) {
      const adminHash = await bcrypt.hash('Admin@123', 10);
      const res = await db.query(
        `INSERT INTO users (name, email, password_hash, role, balance, status)
         VALUES ($1, $2, $3, 'ADMIN', 10000000.00, 'ACTIVE') RETURNING id`,
        ['Exchange Administrator', adminEmail, adminHash]
      );
      adminId = res.rows[0].id;
      console.log(`[Seed] Created Admin account: ${adminEmail} (password: Admin@123)`);
    } else {
      adminId = adminCheck.rows[0].id;
    }

    // 3. Seed Demo Investor 1
    const investorEmail = 'investor@exchange.com';
    const investorCheck = await db.query('SELECT id FROM users WHERE email = $1', [investorEmail]);
    let investorId;
    if (investorCheck.rows.length === 0) {
      const userHash = await bcrypt.hash('User@123', 10);
      const res = await db.query(
        `INSERT INTO users (name, email, password_hash, role, balance, status)
         VALUES ($1, $2, $3, 'INVESTOR', 1000000.00, 'ACTIVE') RETURNING id`,
        ['Hrishikesh Sharma', investorEmail, userHash]
      );
      investorId = res.rows[0].id;

      // Add initial deposit transaction
      await db.query(
        `INSERT INTO transactions (user_id, transaction_type, amount, description)
         VALUES ($1, 'INITIAL_DEPOSIT', 1000000.00, 'Initial virtual balance credited upon registration')`,
        [investorId]
      );
      console.log(`[Seed] Created Demo Investor: ${investorEmail} (password: User@123)`);
    } else {
      investorId = investorCheck.rows[0].id;
    }

    // 4. Seed Demo Trader 2 (for counterparty order matching)
    const trader2Email = 'trader2@exchange.com';
    const trader2Check = await db.query('SELECT id FROM users WHERE email = $1', [trader2Email]);
    let trader2Id;
    if (trader2Check.rows.length === 0) {
      const trader2Hash = await bcrypt.hash('Trader@123', 10);
      const res = await db.query(
        `INSERT INTO users (name, email, password_hash, role, balance, status)
         VALUES ($1, $2, $3, 'INVESTOR', 1000000.00, 'ACTIVE') RETURNING id`,
        ['Aditya Verma', trader2Email, trader2Hash]
      );
      trader2Id = res.rows[0].id;

      await db.query(
        `INSERT INTO transactions (user_id, transaction_type, amount, description)
         VALUES ($1, 'INITIAL_DEPOSIT', 1000000.00, 'Initial virtual balance credited upon registration')`,
        [trader2Id]
      );
      console.log(`[Seed] Created Demo Trader 2: ${trader2Email} (password: Trader@123)`);
    } else {
      trader2Id = trader2Check.rows[0].id;
    }

    // 5. Seed initial demo portfolio for Trader 2 so there are shares to sell in order matching
    const tcsStock = await db.query("SELECT id FROM stocks WHERE symbol = 'TCS'");
    const relStock = await db.query("SELECT id FROM stocks WHERE symbol = 'RELIANCE'");

    if (tcsStock.rows.length > 0) {
      const portCheck = await db.query('SELECT id FROM portfolio WHERE user_id = $1 AND stock_id = $2', [trader2Id, tcsStock.rows[0].id]);
      if (portCheck.rows.length === 0) {
        await db.query(
          'INSERT INTO portfolio (user_id, stock_id, quantity, average_price) VALUES ($1, $2, $3, $4)',
          [trader2Id, tcsStock.rows[0].id, 100, 3800.00]
        );
      }
    }

    if (relStock.rows.length > 0) {
      const portCheck = await db.query('SELECT id FROM portfolio WHERE user_id = $1 AND stock_id = $2', [trader2Id, relStock.rows[0].id]);
      if (portCheck.rows.length === 0) {
        await db.query(
          'INSERT INTO portfolio (user_id, stock_id, quantity, average_price) VALUES ($1, $2, $3, $4)',
          [trader2Id, relStock.rows[0].id, 50, 2900.00]
        );
      }
    }

    // 6. Seed sample resting sell orders from Trader 2 to demonstrate the matching engine
    if (tcsStock.rows.length > 0) {
      const orderCheck = await db.query('SELECT id FROM orders WHERE user_id = $1 AND stock_id = $2 AND status = $3', [trader2Id, tcsStock.rows[0].id, 'OPEN']);
      if (orderCheck.rows.length === 0) {
        await db.query(
          `INSERT INTO orders (user_id, stock_id, order_type, quantity, remaining_quantity, price, status)
           VALUES ($1, $2, 'SELL', 20, 20, 3850.00, 'OPEN')`,
          [trader2Id, tcsStock.rows[0].id]
        );
        console.log('[Seed] Created resting SELL order: 20 TCS @ ₹3850 by trader2@exchange.com');
      }
    }

    console.log('[Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
};

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
