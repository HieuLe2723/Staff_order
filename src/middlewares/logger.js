// src/middlewares/logger.js
const winston = require('winston');
const DateUtils = require('../utils/date');
const log = require('../utils/logger');

// Cấu hình Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: () => DateUtils.formatDate(new Date()) }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log yêu cầu
  log.debug('Request', {
    method,
    url,
    ip,
    params: req.params,
    query: req.query,
    body: req.body,
    user: req.user ? { nhanvien_id: req.user.nhanvien_id, role: req.user.role_name } : 'Unauthenticated',
  });

  // Ghi log phản hồi
  const originalSend = res.send;
  res.send = function (body) {
    log.debug('Response', {
      method,
      url,
      status: res.statusCode,
      duration: Date.now() - start,
      user: req.user ? { nhanvien_id: req.user.nhanvien_id, role: req.user.role_name } : 'Unauthenticated',
    });
    return originalSend.call(this, body);
  };

  next();
};

module.exports = loggerMiddleware;