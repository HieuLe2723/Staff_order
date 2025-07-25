// src/routes/thanhToan.route.js
const express = require('express');
const router = express.Router();
const ThanhToanController = require('../controllers/thanhToan.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate'); // Thêm schemas
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Create a new payment (Admin or employee)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['QuanLy', 'NhanVien']),
  validate(schemas.thanhToan), // Sửa thanhToanSchema thành schemas.thanhToan
  ThanhToanController.createThanhToan
);

// Get payment by ID (Admin or employee)
router.get(
  '/:thanhtoan_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ThanhToanController.getThanhToan
);

// Update payment (Admin or employee)
router.put(
  '/:thanhtoan_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.thanhToan), // Sửa thanhToanSchema thành schemas.thanhToan
  ThanhToanController.updateThanhToan
);

// Update payment status (Admin or employee)
router.patch(
  '/:thanhtoan_id/status',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.statusSchema), // Sửa statusSchema thành schemas.statusSchema
  ThanhToanController.updateThanhToanStatus
);

// Delete payment (Admin only)
router.delete(
  '/:thanhtoan_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  ThanhToanController.deleteThanhToan
);

module.exports = router;