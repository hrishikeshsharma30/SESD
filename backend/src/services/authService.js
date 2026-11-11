const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { INITIAL_VIRTUAL_BALANCE } = require('../config/constants');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_virtual_stock_exchange_2026_sesd',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check duplicate email
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create user with ₹10,00,000 initial virtual balance
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role, balance, status)
     VALUES ($1, $2, $3, 'INVESTOR', $4, 'ACTIVE')
     RETURNING id, name, email, role, balance, status, created_at`,
    [name.trim(), normalizedEmail, passwordHash, INITIAL_VIRTUAL_BALANCE]
  );

  const newUser = result.rows[0];

  // 4. Log initial virtual cash allocation in transaction ledger
  await db.query(
    `INSERT INTO transactions (user_id, transaction_type, amount, description)
     VALUES ($1, 'INITIAL_DEPOSIT', $2, 'Virtual starting balance credited for trading simulation')`,
    [newUser.id, INITIAL_VIRTUAL_BALANCE]
  );

  const token = generateToken(newUser);

  return {
    user: {
      id: Number(newUser.id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      balance: parseFloat(newUser.balance),
      status: newUser.status
    },
    token
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.query(
    'SELECT id, name, email, password_hash, role, balance, status FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  if (user.status === 'DEACTIVATED') {
    const error = new Error('Your account has been deactivated. Please contact the administrator.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      balance: parseFloat(user.balance),
      status: user.status
    },
    token
  };
};

const getMe = async (userId) => {
  const result = await db.query(
    'SELECT id, name, email, role, balance, status, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];
  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    balance: parseFloat(user.balance),
    status: user.status,
    created_at: user.created_at
  };
};

module.exports = {
  register,
  login,
  getMe
};
