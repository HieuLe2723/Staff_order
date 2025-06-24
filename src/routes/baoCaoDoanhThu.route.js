const express = require('express');
const router = express.Router();
const BaoCaoDoanhThuController = require('../controllers/baoCaoDoanhThu.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role');
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');

// Debug
// console.log('authMiddleware:', typeof authMiddleware);
// console.log('roleMiddleware:', typeof roleMiddleware(['Quan Ly']));
// console.log('validate(schemas.revenueReport):', typeof validate(schemas.revenueReport));
// console.log('BaoCaoDoanhThuController.createReport:', typeof BaoCaoDoanhThuController.createReport);
// console.log('rateLimitMiddleware:', typeof rateLimitMiddleware);
// console.log('loggerMiddleware:', typeof loggerMiddleware);

// Debug route loading
console.log('BaoCaoDoanhThu routes loaded');

router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  validate(schemas.revenueReport),
  BaoCaoDoanhThuController.createBaoCao
);

// Other routes (e.g., GET, PUT, DELETE)
router.get(
  '/summary',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  BaoCaoDoanhThuController.getSummary
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoDoanhThuController.getAllBaoCao
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoDoanhThuController.getBaoCaoById
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoDoanhThuController.deleteBaoCao
);

router.get(
  '/export',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  BaoCaoDoanhThuController.exportBaoCao
);

module.exports = router;