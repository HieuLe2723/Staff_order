// src/routes/baoCaoChiTietMonAn.route.js
const express = require('express');
const router = express.Router();
const BaoCaoChiTietMonAnController = require('../controllers/baoCaoChiTietMonAn.controller');
const { authMiddleware } = require('../middlewares/auth'); // Sửa import
const { roleMiddleware } = require('../middlewares/role');
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Debug logging
// console.log('BaoCaoChiTietMonAnController:', BaoCaoChiTietMonAnController);
// console.log('createBaoCaoMonAn:', typeof BaoCaoChiTietMonAnController.createBaoCaoMonAn);
// console.log('authMiddleware:', typeof authMiddleware);
// console.log('roleMiddleware:', typeof roleMiddleware(['Quan Ly']));
// console.log('validate:', typeof validate(schemas.baoCaoChiTietMonAn));

// Routes
router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

// Lấy danh sách món bán chạy
router.get(
  '/best-sellers',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  BaoCaoChiTietMonAnController.getBestSellers
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  validate(schemas.baoCaoChiTietMonAn),
  BaoCaoChiTietMonAnController.createBaoCaoMonAn
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoChiTietMonAnController.getBaoCaoMonAnById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  validate(schemas.baoCaoChiTietMonAn),
  BaoCaoChiTietMonAnController.updateBaoCaoMonAn
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoChiTietMonAnController.deleteBaoCaoMonAn
);

module.exports = router;