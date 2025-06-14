const crypto = require('crypto');

module.exports = function nonceMiddleware(req, res, next) {
  req.nonce = crypto.randomBytes(16).toString('hex');
  next();
};
