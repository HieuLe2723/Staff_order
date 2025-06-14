// src/routes/thietBi.route.js
const express = require('express');
const router = express.Router();
const ThietBiController = require('../controllers/thietBi.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate'); // Thêm schemas
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Create a new equipment (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.thietBi), // Sửa thietBiSchema thành schemas.thietBi
  ThietBiController.createThietBi
);

// Get equipment by ID (Admin or employee)
router.get(
  '/:thietbi_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ThietBiController.getThietBi
);

// Update equipment (Admin only)
router.put(
  '/:thietbi_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.thietBi), // Sửa thietBiSchema thành schemas.thietBi
  ThietBiController.updateThietBi
);

// Delete equipment (Admin only)
router.delete(
  '/:thietbi_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  ThietBiController.deleteThietBi
);

module.exports = router;