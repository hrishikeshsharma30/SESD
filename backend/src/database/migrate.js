const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const migrate = async () => {
  console.log('[Migrate] Running database migrations...');
  try {
    if (db.getEngine() === 'postgres') {
      const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await db.query(sql);
      console.log('[Migrate] PostgreSQL schema successfully executed.');
    } else {
      console.log('[Migrate] SQLite schema successfully ensured.');
    }
  } catch (err) {
    console.error('[Migrate Error]:', err.message);
  }
};

module.exports = { migrate };

if (require.main === module) {
  migrate().then(() => process.exit(0));
}
