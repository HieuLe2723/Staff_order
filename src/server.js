const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config();

const pool = require('./config/db.config');
const errorMiddleware = require('./middlewares/error');
const loggerMiddleware = require('./middlewares/logger');
const rateLimitMiddleware = require('./middlewares/rateLimit');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const log = require('./utils/logger');
const nonceMiddleware = require('./middlewares/nonce');
const http = require('http');
const socketIo = require('socket.io');


const app = express();

// Add nonce middleware
app.use(nonceMiddleware);

// Set views directory to staff-order-backend/views
const viewsPath = path.join(__dirname, '..', 'views');
app.set('views', viewsPath);
if (process.env.NODE_ENV === 'development') {
  log.debug(`Views directory: ${viewsPath}`);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      styleSrcAttr: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      formAction: ["'self'"]
    }
  }
}));
app.use(compression());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

// Template engine
const engine = require('ejs-mate');
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('layout', 'layout'); // Specify the default layout
app.use(express.static('public'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'Server is running',
      timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database connection failed',
      timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    });
  }
});

// Routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Error handling
app.use(errorMiddleware);

// Server configuration
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    console.log('Attempting to connect to database...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
     const server = http.createServer(app);

    // Khởi tạo socket.io
    const io = socketIo(server, {
      cors: {
        origin: 'http://localhost:3001', 
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
      // Bạn có thể xử lý các sự kiện ở đây
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Start server (dùng server.listen thay vì app.listen)
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🕒 Timezone: ${process.env.TIMEZONE || 'UTC'}`);
      console.log(`📅 Server time: ${new Date()}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Consider restarting the server or handling the error appropriately
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Consider restarting the server or handling the error appropriately
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

// Start server
startServer();

// Tự động cập nhật trạng thái bàn quá hạn chưa có order mỗi 5 phút
const { updateBanStatusIfNoOrder } = require('./services/autoUpdateBanStatus');
setInterval(() => {
  updateBanStatusIfNoOrder()
    .then(() => console.log('[AutoUpdateBanStatus] Đã kiểm tra và cập nhật trạng thái các bàn quá hạn.'))
    .catch(err => console.error('[AutoUpdateBanStatus] Lỗi:', err));
}, 5 * 60 * 1000); // 5 phút

// Process event handlers
process.on('unhandledRejection', (error) => {
  log.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  pool.end((err) => {
    if (err) log.error('Error closing pool:', err);
    process.exit(0);
  });
});

module.exports = app;
