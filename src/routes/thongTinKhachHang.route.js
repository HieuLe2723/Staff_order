const express = require('express');
const router = express.Router();
const ThongTinKhachHangController = require('../controllers/thongTinKhachHang.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Create a new customer (Admin, employee, or customer)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  validate(schemas.customer),
  ThongTinKhachHangController.createKhachHang
);

// Get customer by ID (Admin, employee, or customer themselves)
router.get(
  '/:khachhang_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  ThongTinKhachHangController.getKhachHang
);

// Update customer (Admin, employee, or customer themselves)
router.put(
  '/:khachhang_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  validate(schemas.customer),
  ThongTinKhachHangController.updateKhachHang
);

// Delete customer (Admin only)
router.delete(
  '/:khachhang_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  ThongTinKhachHangController.deleteKhachHang
);

module.exports = router;