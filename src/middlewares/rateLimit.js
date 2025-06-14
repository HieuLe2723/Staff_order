const rateLimit = require('express-rate-limit');
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

const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), 
  max: parseInt(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res, next) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.url });
    return res.status(429).json(
      ResponseUtils.error('Too many requests, please try again later', 429)
    );
  },
});

module.exports = rateLimitMiddleware;