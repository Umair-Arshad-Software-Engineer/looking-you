const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const authMiddleware = require('../middlewares/auth.middleware');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await admin.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { id: admin.id, username: admin.username, role: admin.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'looking_you_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({ token, admin: payload });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/seed
// @desc    Create initial admin (Run once)
router.post('/seed', async (req, res) => {
  try {
    const count = await Admin.count();
    if (count > 0) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123', // Will be hashed by hook
      role: 'admin'
    });

    res.json({ message: 'Initial Admin created successfully', username: admin.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// @route   GET api/auth/me
// @desc    Get current admin data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, { attributes: ['id', 'username', 'role'] });
    res.json(admin);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
