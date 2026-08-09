const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'looking_you_secret_key_2024');
      socket.admin = decoded;
      socket.isAdmin = true;
      console.log(`🔐 Socket authenticated as Admin: ${decoded.username}`);
    } catch (err) {
      console.warn('⚠️ Invalid Socket JWT token, marking connection as non-admin device');
      socket.isAdmin = false;
    }
  } else {
    socket.isAdmin = false;
  }
  
  next();
};

module.exports = socketAuth;
