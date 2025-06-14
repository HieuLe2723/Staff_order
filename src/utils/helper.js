// src/utils/helper.js
const sanitizeHtml = require('sanitize-html'); 

class HelperUtils {
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return sanitizeHtml(str.trim(), {
      allowedTags: [], // Không cho phép bất kỳ thẻ HTML nào
      allowedAttributes: {}, // Không cho phép thuộc tính HTML
    });
  }

  static generateUniqueId(prefix = 'ID_') {
    const randomStr = `${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    const id = `${prefix}${randomStr}`.slice(0, 10); // Giới hạn 10 ký tự
    return id;
  }

  static isValidPhoneNumber(phone) {
    if (typeof phone !== 'string') return false;
    // Hỗ trợ số Việt Nam (+84 hoặc 0) và số quốc tế cơ bản
    const vnPhoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
    const internationalRegex = /^\+[1-9][0-9]{7,14}$/;
    return vnPhoneRegex.test(phone) || internationalRegex.test(phone);
  }
}

module.exports = HelperUtils;