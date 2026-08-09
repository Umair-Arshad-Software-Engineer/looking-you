const Device = require('../models/device.model');
const TrackingLog = require('../models/tracking.model');

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  
  const deviceId = req.body.deviceId || 'unknown';
  const logType = req.body.logType || 'photo';
  console.log(`📂 ${logType} received from device:`, deviceId);

  try {
    const device = await Device.findOne({ where: { deviceId } });
    
    if (device) {
      const log = await TrackingLog.create({
        deviceId: device.id,
        logType: logType,
        fileName: req.file.filename,
        data: { originalName: req.file.originalname }
      });

      console.log(`✅ ${logType} saved to Database: ${req.file.originalname}`);

      const io = req.app.get('socketio');
      if (io) {
        let eventName = 'photo_uploaded';
        if (logType === 'audio') eventName = 'audio_uploaded';
        if (logType === 'file') eventName = 'file_uploaded';
        if (logType === 'screenshot') eventName = 'screenshot_uploaded';

        io.emit(eventName, {
          deviceId: deviceId,
          logId: log.id,
          url: `/uploads/${req.file.filename}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      res.status(200).send({
        message: `${logType} logged successfully`,
        id: log.id
      });
    } else {
      res.status(404).send({ message: 'Device not found' });
    }
  } catch (err) {
    console.error('❌ Upload Logging Error:', err);
    res.status(500).send({ message: 'Internal server error during logging' });
  }
};
