// src/routes/chiTietPhieuNhap.route.js
const express = require('express');
const router = express.Router();
const ChiTietPhieuNhapController = require('../controllers/chiTietPhieuNhap.controller');
const { validate, schemas } = require('../middlewares/validate');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Routes
router.post(
  '/',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.chiTietPhieuNhap), // Sửa chiTietPhieuNhapSchema thành schemas.chiTietPhieuNhap
  ChiTietPhieuNhapController.createChiTietPhieuNhap
);

router.get(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietPhieuNhapController.getChiTietPhieuNhapById
);

router.get(
  '/',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietPhieuNhapController.getAllChiTietPhieuNhap
);

router.put(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.chiTietPhieuNhap), // Sửa chiTietPhieuNhapSchema thành schemas.chiTietPhieuNhap
  ChiTietPhieuNhapController.updateChiTietPhieuNhap
);

router.delete(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  ChiTietPhieuNhapController.deleteChiTietPhieuNhap
);

module.exports = router;