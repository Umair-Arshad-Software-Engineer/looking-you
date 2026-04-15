const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Device = require('../models/device.model');
const TrackingLog = require('../models/tracking.model');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const deviceId = req.body.deviceId || 'unknown';
    cb(null, `${deviceId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// POST endpoint for image upload
router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  
  const deviceId = req.body.deviceId || 'unknown';
  console.log('📸 Photo received from device:', deviceId);

  try {
    // 1. Find device
    const device = await Device.findOne({ where: { deviceId } });
    
    if (device) {
      // 2. Save record to database with filename reference
      const log = await TrackingLog.create({
        deviceId: device.id,
        logType: 'photo',
        fileName: req.file.filename,
        data: { originalName: req.file.originalname }
      });

      // 3. Notify Dashboard live with the static URL
      const io = req.app.get('socketio');
      if (io) {
        io.emit('photo_uploaded', {
          deviceId: deviceId,
          logId: log.id,
          url: `/uploads/${req.file.filename}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      res.status(200).send({
        message: 'Photo captured and logged successfully',
        id: log.id
      });
    } else {
      res.status(404).send({ message: 'Device not found' });
    }
  } catch (err) {
    console.error('❌ Upload Logging Error:', err);
    res.status(500).send({ message: 'Internal server error during logging' });
  }
});

module.exports = router;
