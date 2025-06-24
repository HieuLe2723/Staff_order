// src/routes/phienSuDungBan.route.js
const express = require('express');
const router = express.Router();
const PhienSuDungBanController = require('../controllers/phienSuDungBan.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const rateLimitMiddleware = require('../middlewares/rateLimit');
const { validate, schemas } = require('../middlewares/validate'); // Sửa để import schemas
const loggerMiddleware = require('../middlewares/logger');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);

// Lấy danh sách loại khách
router.get('/loai-khach', require('../controllers/phienSuDungBan.controller').getLoaiKhach);

// Lấy danh sách loại menu
router.get('/loai-menu', require('../controllers/phienSuDungBan.controller').getLoaiMenu);

// Lấy tất cả các món ăn trong phiên (cho màn hình Kiểm Đồ)
router.get(
  '/:phien_id/items',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.getAllItemsInPhien
);

// Create a new table session (Admin or employee)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.phienSuDungBan), // Sửa phienSchema thành schemas.phienSuDungBan
  PhienSuDungBanController.createPhien
);

// Get table session by ID (Admin or employee)
router.get(
  '/:phien_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.getPhien
);

// Get active session by table ID
router.get(
  '/active/by-table/:ban_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.getActivePhienByBanId
);

// Update table session (Admin or employee)
router.put(
  '/:phien_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.phienSuDungBan), // Sửa phienSchema thành schemas.phienSuDungBan
  PhienSuDungBanController.updatePhien
);

// Calculate bill for a session (Admin or employee)
router.get(
  '/:phien_id/bill',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.calculateBill
);

// Áp dụng mã khuyến mãi
router.post(
  '/:phien_id/apply-promo',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.applyPromotion
);

// Cancel an empty table session (Employee or Manager)
router.delete(
  '/:phien_id/cancel-empty',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.cancelEmptyPhien
);

// Delete table session (Admin only)
router.delete(
  '/:phien_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  PhienSuDungBanController.deletePhien
);

// Tự động kiểm tra và hủy phiên nếu order rỗng
router.post('/:phien_id/auto-cancel-if-empty',
  require('../middlewares/auth').authMiddleware,
  require('../middlewares/role').roleMiddleware(['Quan Ly', 'Nhan Vien']),
  require('../controllers/phienSuDungBan.controller').autoCancelIfEmpty
);

module.exports = router;
