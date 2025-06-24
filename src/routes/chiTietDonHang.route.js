// src/routes/chiTietDonHang.route.js
const express = require('express');
const router = express.Router();
const ChiTietDonHangController = require('../controllers/chiTietDonHang.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Routes
router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.chiTietDonHang), // Sửa chiTietSchema thành schemas.chiTietDonHang
  ChiTietDonHangController.createChiTietDonHang
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietDonHangController.getChiTietDonHangById
);

// Lấy chi tiết đơn hàng theo id phiên
router.get(
  '/by-session/:sessionId',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietDonHangController.getChiTietDonHangBySessionId
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.chiTietDonHang), // Sửa chiTietSchema thành schemas.chiTietDonHang
  ChiTietDonHangController.updateChiTietDonHang
);



// Ra món hàng loạt
router.patch(
  '/serve-bulk',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietDonHangController.serveDishesBulk
);

// Ra món
router.patch(
  '/:id/serve',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietDonHangController.serveDish
);

// Endpoint mới để cập nhật số lượng đã ra món
router.post(
  '/update-so-luong-ra',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietDonHangController.updateSoLuongDaRa
);

module.exports = router;