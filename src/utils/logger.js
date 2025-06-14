const winston = require('winston');

const log = {
  info: (message) => {
    // Only show essential info messages
    if (!message.includes('function') && !message.includes('middleware')) {
      console.log(`[INFO] ${message}`);
    }
  },
  success: (message) => {
    console.log(`[SUCCESS] ${message}`);
  },
  error: (message) => {
    console.error(`[ERROR] ${message}`);
  },
  warn: (message) => {
    console.log(`[WARNING] ${message}`);
  },
  debug: (message) => {
    // Only show debug messages that don't contain function details
    if (!message.includes('function') && !message.includes('middleware')) {
      console.log(`[DEBUG] ${message}`);
    }
  }
};

module.exports = log;
