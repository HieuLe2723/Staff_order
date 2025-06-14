// src/routes/role.route.js
const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate'); // Thêm schemas
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Create a new role (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('QuanLy'),
  validate(schemas.role), // Sửa roleSchema thành schemas.role
  RoleController.createRole
);

// Get role by ID (Admin only)
router.get(
  '/:role_id',
  authMiddleware,
  roleMiddleware('QuanLy'),
  RoleController.getRole
);

// Get all roles (Admin only)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('QuanLy'),
  RoleController.getAllRoles
);

// Update role (Admin only)
router.put(
  '/:role_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.role), // Sửa roleSchema thành schemas.role
  RoleController.updateRole
);

// Delete role (Admin only)
router.delete(
  '/:role_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  RoleController.deleteRole
);

module.exports = router;