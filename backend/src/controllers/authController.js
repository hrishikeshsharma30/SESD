const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const data = await authService.register({ name, email, password });
    return sendSuccess(res, 'Registration successful! ₹10,00,000 virtual balance credited.', data, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const data = await authService.login({ email, password });
    return sendSuccess(res, 'Login successful', data, 200);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, 'User profile fetched', user, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe
};
