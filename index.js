const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./src/config/database');
const uploadRoutes = require('./src/routes/upload.routes');
const historyRoutes = require('./src/routes/history.routes');
const authRoutes = require('./src/routes/auth.routes');
const syncRoutes = require('./src/routes/sync.routes');
const healthRoutes = require('./src/routes/health.routes');
const authMiddleware = require('./src/middlewares/auth.middleware');
const socketAuthMiddleware = require('./src/middlewares/socketAuth.middleware');
const { initCronJobs } = require('./src/services/cron.service');
const { seedAdmin } = require('./seed');

// Sockets
const registerDeviceSockets = require('./src/sockets/device.socket');
const registerMediaSockets = require('./src/sockets/media.socket');
const registerStreamSockets = require('./src/sockets/stream.socket');
const registerFileSockets = require('./src/sockets/file.socket');

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || "*";
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"]
  }
});

// Share io with routes
app.set('socketio', io);

// Middlewares
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Logger for all requests
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// HTTP Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/health', healthRoutes);
app.use('/upload', uploadRoutes);
app.use('/api/history', authMiddleware, historyRoutes);
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
  res.send('🚀 Looking You Backend is ONLINE and READY for Socket connections!');
});

// Socket Auth Middleware
io.use(socketAuthMiddleware);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (Admin: ${socket.isAdmin})`);

  registerDeviceSockets(io, socket);
  registerMediaSockets(io, socket);
  registerStreamSockets(io, socket);
  registerFileSockets(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();
  initCronJobs();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
};

start();
