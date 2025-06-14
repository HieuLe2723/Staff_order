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

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.chiTietDonHang), // Sửa chiTietSchema thành schemas.chiTietDonHang
  ChiTietDonHangController.updateChiTietDonHang
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  ChiTietDonHangController.deleteChiTietDonHang
);

module.exports = router;