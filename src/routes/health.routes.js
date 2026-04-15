const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// Health point route
router.get('/health', healthController.getHealthStatus);

module.exports = router;
