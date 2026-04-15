const express = require('express');
const router = express.Router();
const TrackingLog = require('../models/tracking.model');
const Device = require('../models/device.model');
const authMiddleware = require('../middlewares/auth.middleware');

// @route   POST api/history/sync-bulk
// @desc    Sync multiple location logs from mobile (Offline Sync)
router.post('/sync-bulk', async (req, res) => {
    const { deviceId, logs } = req.body;

    if (!deviceId || !logs || !Array.isArray(logs)) {
        return res.status(400).json({ message: 'Invalid sync data' });
    }

    try {
        // Resolve internal Device ID
        const device = await Device.findOne({ where: { deviceId } });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Prepare data for bulk insert
        const logsToInsert = logs.map(log => ({
            deviceId: device.id,
            latitude: log.latitude,
            longitude: log.longitude,
            batteryLevel: log.batteryLevel,
            isCharging: log.isCharging,
            logType: log.logType || 'location',
            createdAt: log.timestamp || new Date() // Use original timestamp if provided
        }));

        // Efficient Bulk Insert
        await TrackingLog.bulkCreate(logsToInsert);

        console.log(`📡 Bulk sync successful: ${logs.length} points for ${deviceId}`);
        res.json({ success: true, count: logs.length });

    } catch (err) {
        console.error('❌ Bulk Sync Error:', err);
        res.status(500).json({ message: 'Server Error during sync' });
    }
});

module.exports = router;
