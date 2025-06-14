// src/routes/phieuNhapHang.route.js
const express = require('express');
const router = express.Router();
const PhieuNhapHangController = require('../controllers/phieuNhapHang.controller');
const { validate, schemas } = require('../middlewares/validate');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Routes
router.use(loggerMiddleware); // Di chuyển lên router.use
router.use(rateLimitMiddleware); // Di chuyển lên router.use

router.post(
  '/',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.phieuNhapHang), // Sửa phieuNhapHangSchema thành schemas.phieuNhapHang
  PhieuNhapHangController.createPhieuNhapHang
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhieuNhapHangController.getPhieuNhapHangById
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhieuNhapHangController.getAllPhieuNhapHang
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('QuanLy'),
  validate(schemas.phieuNhapHang), // Sửa phieuNhapHangSchema thành schemas.phieuNhapHang
  PhieuNhapHangController.updatePhieuNhapHang
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('QuanLy'),
  PhieuNhapHangController.deletePhieuNhapHang
);

module.exports = router;