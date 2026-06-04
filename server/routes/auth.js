import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already exists` });
    }

    const user = await User.create({ fullName, email, username, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const message = error.code === 11000
      ? 'User with this email or username already exists'
      : error.message || 'Registration failed';
    res.status(400).json({ message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      token,
      rememberMe,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'If an account exists, a reset link has been sent',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const newToken = generateToken(user._id);
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
