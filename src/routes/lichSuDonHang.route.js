// src/routes/lichSuDonHang.route.js
const express = require('express');
const router = express.Router();
const LichSuDonHangController = require('../controllers/lichSuDonHang.controller');
const { authMiddleware } = require('../middlewares/auth');
const { roleMiddleware } = require('../middlewares/role');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Thêm log mới
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  LichSuDonHangController.createLog
);

// Lấy toàn bộ lịch sử của một đơn hàng
router.get(
  '/:donhang_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  LichSuDonHangController.getLogsByDonHang
);

module.exports = router;
