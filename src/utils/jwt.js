// src/utils/jwt.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTUtils {
  static generateToken(payload) {
    if (!payload || !payload.nhanvien_id) {
      throw new Error('Payload phải chứa nhanvien_id');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Thay '1d' bằng '1h' để khớp với .env
    });
  }

  static generateRefreshToken(payload) {
    if (!payload || !payload.nhanvien_id) {
      throw new Error('Payload phải chứa nhanvien_id');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Token đã hết hạn. Vui lòng yêu cầu refresh token.');
      }
      throw new Error('Token không hợp lệ hoặc đã bị hủy.');
    }
  }
}

module.exports = JWTUtils;