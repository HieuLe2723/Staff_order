const express = require('express');
const router = express.Router();
const BanNhaHangController = require('../controllers/banNhaHang.controller');
const { authMiddleware } = require('../middlewares/auth'); // Fixed import
const { roleMiddleware } = require('../middlewares/role');
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Debug
// console.log('authMiddleware:', typeof authMiddleware);
// console.log('roleMiddleware:', typeof roleMiddleware(['Quan Ly', 'Nhan Vien']));
// console.log('validate(schemas.banNhaHang):', typeof validate(schemas.banNhaHang));
// console.log('BanNhaHangController.createBan:', typeof BanNhaHangController.createBan);
// console.log('rateLimitMiddleware:', typeof rateLimitMiddleware);
// console.log('loggerMiddleware:', typeof loggerMiddleware);

router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.banNhaHang),
  BanNhaHangController.createBan
);

// Các tuyến đường khác
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  BanNhaHangController.getBanById
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  BanNhaHangController.getAllBans
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.banNhaHang),
  BanNhaHangController.updateBan
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BanNhaHangController.deleteBan
);

module.exports = router;