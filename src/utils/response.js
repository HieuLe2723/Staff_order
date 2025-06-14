// src/utils/response.js
const DateUtils = require('./date');

class ResponseUtils {
  static success(data, message = 'Success', statusCode = 200, meta = {}) {
    return {
      success: true,
      message,
      data,
      statusCode,
      meta,
      timestamp: DateUtils.formatDate(DateUtils.getCurrentDateTime()),
    };
  }

  static error(message, statusCode = 500, error = null, meta = {}) {
    return {
      success: false,
      message,
      statusCode,
      error,
      meta,
      timestamp: DateUtils.formatDate(DateUtils.getCurrentDateTime()),
    };
  }
}

module.exports = ResponseUtils;