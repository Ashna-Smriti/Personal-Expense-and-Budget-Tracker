import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, username } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    await user.save();

    res.json({ user: { id: user._id, fullName: user.fullName, email: user.email, username: user.username, avatar: user.avatar } });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Update failed' });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Password update failed' });
  }
});

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    req.user.avatar = avatarUrl;
    await req.user.save({ validateBeforeSave: false });
    res.json({ avatar: avatarUrl });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Avatar upload failed' });
  }
});

export default router;
