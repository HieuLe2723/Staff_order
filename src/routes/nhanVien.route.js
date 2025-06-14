// src/routes/nhanVien.route.js
const express = require('express');
const router = express.Router();
const NhanVienController = require('../controllers/nhanVien.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Create a new employee (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('QuanLy'),
  validate(schemas.nhanVien), // Sửa nhanVienSchema thành schemas.nhanVien
  NhanVienController.createNhanVien
);

// Get employee by ID (Admin or employee themselves)
router.get(
  '/:nhanvien_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  NhanVienController.getNhanVien
);

// Update employee (Admin only)
router.put(
  '/:Nhan Vien_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.nhanVien), // Sửa nhanVienSchema thành schemas.nhanVien
  NhanVienController.updateNhanVien
);

// Delete employee (Admin only)
router.delete(
  '/:nhanvien_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  NhanVienController.deleteNhanVien
);

module.exports = router;