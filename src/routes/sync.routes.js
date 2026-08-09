const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');

router.post('/sync-bulk', syncController.syncBulk);

module.exports = router;
