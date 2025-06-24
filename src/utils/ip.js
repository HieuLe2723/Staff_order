// src/utils/ip.js

class IpUtils {
  static getClientIp(req) {
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';

    // Handle localhost cases for development
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
      ipAddr = '127.0.0.1';
    } else if (ipAddr.startsWith('::ffff:')) {
      // Handle IPv4-mapped IPv6 addresses
      ipAddr = ipAddr.replace('::ffff:', '');
    }

    return ipAddr;
  }
}

module.exports = IpUtils;
