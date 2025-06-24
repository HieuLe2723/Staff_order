const winston = require('winston');
const ResponseUtils = require('../utils/response');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/rateLimit.log' }),
    new winston.transports.Console(),
  ],
});

// Đã vô hiệu hóa rateLimit, luôn cho phép request
const rateLimitMiddleware = (req, res, next) => next();

module.exports = rateLimitMiddleware;