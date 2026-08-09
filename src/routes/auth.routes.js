const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   POST api/auth/seed
router.post('/seed', authController.seed);

// @route   GET api/auth/me
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
