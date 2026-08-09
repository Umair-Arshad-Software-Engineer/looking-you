const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

router.get('/:deviceId', historyController.getHistoryByDevice);
router.delete('/:id', historyController.deleteLog);

module.exports = router;
