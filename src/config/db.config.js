// src/config/db.config.js
const mysql = require('mysql2/promise');

// Tạo pool với các cấu hình từ .env
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'stafforder',
  waitForConnections: true, // Chờ khi tất cả kết nối đều bận
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10, // Số kết nối tối đa
  queueLimit: 0, // Không giới hạn số yêu cầu chờ
  // Sử dụng múi giờ offset thay vì tên múi giờ IANA
  timezone: '+07:00', // Thay 'Asia/Ho_Chi_Minh' bằng offset +07:00
  multipleStatements: false, // Ngăn chặn thực thi nhiều câu lệnh SQL cùng lúc
  connectTimeout: 30000, // Thời gian chờ kết nối (30 giây)
  // Loại bỏ acquireTimeout vì nó không cần thiết cho pool (đã có connectTimeout)
  dateStrings: true // Trả về ngày dưới dạng string
});

// Kiểm tra kết nối pool khi khởi tạo
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection pool initialization failed:', err);
    if (connection) connection.release();
    return;
  }
  console.log('Database connection pool initialized successfully');
  connection.release();
});

// Xử lý sự kiện khi pool bị lỗi
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.warn('Database connection lost, attempting to reconnect...');
  }
});

module.exports = pool;