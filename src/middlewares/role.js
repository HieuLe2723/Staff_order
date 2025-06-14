// src/middlewares/role.js
const ResponseUtils = require('../utils/response');

const roleMiddleware = (requiredRoles) => (req, res, next) => {
  try {
    const userRoleName = req.user.role_name;
    if (!userRoleName) {
      return res.status(403).json(
        ResponseUtils.error('User role not found', 403)
      );
    }

    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }

    if (!requiredRoles.includes(userRoleName)) {
      return res.status(403).json(
        ResponseUtils.error(
          `Access denied. One of ${requiredRoles.join(', ')} roles required.`,
          403
        )
      );
    }

    next();
  } catch (err) {
    res.status(500).json(
      ResponseUtils.error('Error checking role', 500, err.message)
    );
  }
};
const adminRoleMiddleware = roleMiddleware(['Quan Ly']);

module.exports = { roleMiddleware, adminRoleMiddleware };