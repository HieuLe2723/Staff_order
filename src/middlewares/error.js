// src/middlewares/error.js
const ResponseUtils = require('../utils/response');
const winston = require('winston');
const log = require('../utils/logger');

// Cấu hình winston logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

const errorMiddleware = (err, req, res, next) => {
  // Ghi log lỗi
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date()
  });

  // Log ra console với màu sắc
  log.error(`[${req.method} ${req.path}] Error: ${err.message}`);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  // Xử lý lỗi MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Dữ liệu đã tồn tại';
  } else if (err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    message = 'Dữ liệu tham chiếu không tồn tại';
  }

  // Xử lý lỗi Joi validation
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map((detail) => detail.message).join(', ');
    errorDetails = process.env.NODE_ENV === 'development' ? err.details : undefined;
  }

  res.status(statusCode).json(
    ResponseUtils.error(message, statusCode, errorDetails)
  );
};

module.exports = errorMiddleware;