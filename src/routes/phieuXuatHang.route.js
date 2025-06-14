// src/routes/phieuXuatHang.route.js
const express = require('express');
const router = express.Router();
const PhieuXuatHangController = require('../controllers/phieuXuatHang.controller');
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
  validate(schemas.phieuXuatHang), // Sửa phieuXuatHangSchema thành schemas.phieuXuatHang
  PhieuXuatHangController.createPhieuXuatHang
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhieuXuatHangController.getPhieuXuatHangById
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhieuXuatHangController.getAllPhieuXuatHang
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('QuanLy'),
  validate(schemas.phieuXuatHang), // Sửa phieuXuatHangSchema thành schemas.phieuXuatHang
  PhieuXuatHangController.updatePhieuXuatHang
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('QuanLy'),
  PhieuXuatHangController.deletePhieuXuatHang
);

module.exports = router;