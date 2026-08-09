module.exports = (io, socket) => {
  // Start live audio stream
  socket.on('start_audio_stream', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`🎙️ Admin requested LIVE AUDIO START for device:`, data.deviceId);
    io.to(data.deviceId).emit('start_audio_stream');
  });

  // Stop live audio stream
  socket.on('stop_audio_stream', (data) => {
    if (!socket.isAdmin) {
      return socket.emit('unauthorized', { message: 'Admin authentication required' });
    }
    console.log(`🎙️ Admin requested LIVE AUDIO STOP for device:`, data.deviceId);
    io.to(data.deviceId).emit('stop_audio_stream');
  });

  // Relay audio stream chunks to admins
  socket.on('audio_stream_chunk', (data) => {
    socket.broadcast.emit('live_audio_relay', data);
  });
};
