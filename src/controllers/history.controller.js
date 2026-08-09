const TrackingLog = require('../models/tracking.model');
const Device = require('../models/device.model');
const path = require('path');
const fs = require('fs');

// GET history for a device
exports.getHistoryByDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ where: { deviceId: req.params.deviceId } });
    if (!device) return res.status(404).send({ message: 'Device not found' });

    const logs = await TrackingLog.findAll({
      where: { deviceId: device.id },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const processedLogs = logs.map(log => {
      const plainLog = log.get({ plain: true });
      if (plainLog.fileName) {
        plainLog.url = `/uploads/${plainLog.fileName}`;
      }
      return plainLog;
    });

    res.json(processedLogs);
  } catch (err) {
    console.error('❌ History Fetch Error:', err);
    res.status(500).send({ message: 'Error fetching history' });
  }
};

// DELETE a specific log entry
exports.deleteLog = async (req, res) => {
  try {
    const log = await TrackingLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });

    if (log.fileName) {
      const filePath = path.join(__dirname, '../../uploads', log.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await log.destroy();
    res.json({ message: 'Log and associated file deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).send({ message: 'Error deleting log' });
  }
};
