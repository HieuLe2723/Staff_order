// src/routes/chiTietPhieuXuat.route.js
const express = require('express');
const router = express.Router();
const ChiTietPhieuXuatController = require('../controllers/chiTietPhieuXuat.controller');
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
  validate(schemas.chiTietPhieuXuat), // Sửa chiTietPhieuXuatSchema thành schemas.chiTietPhieuXuat
  ChiTietPhieuXuatController.createChiTietPhieuXuat
);

router.get(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietPhieuXuatController.getChiTietPhieuXuatById
);

router.get(
  '/',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  ChiTietPhieuXuatController.getAllChiTietPhieuXuat
);

router.put(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.chiTietPhieuXuat), // Sửa chiTietPhieuXuatSchema thành schemas.chiTietPhieuXuat
  ChiTietPhieuXuatController.updateChiTietPhieuXuat
);

router.delete(
  '/:id',
  loggerMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  ChiTietPhieuXuatController.deleteChiTietPhieuXuat
);

module.exports = router;