// src/routes/donHang.route.js
const express = require('express');
const router = express.Router();
const DonHangController = require('../controllers/donHang.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');
const loggerMiddleware = require('../middlewares/logger');
const Joi = require('joi');

// Routes
router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.order), // Sử dụng schema 'order' cho việc tạo đơn hàng
  DonHangController.createDonHang
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.getDonHangById
);

// Lấy danh sách đơn hàng theo phiên
router.get(
  '/by-phien/:phien_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.getDonHangsByPhienId
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.order.keys({
    gia_tri_giam: Joi.number().precision(2).min(0).optional(),
    tong_tien: Joi.number().precision(2).min(0).optional(),
    trang_thai: Joi.string().valid('ChoXuLy', 'DangNau', 'DaPhucVu', 'DaThanhToan', 'DaHuy').optional(),
    items: Joi.array().items(
      Joi.object({
        monan_id: Joi.number().integer().min(1).required(),
        so_luong: Joi.number().integer().min(1).required(),
        ghi_chu: Joi.string().max(255).allow('')
      })
    ).optional() // Cho phép items là tùy chọn khi cập nhật
  })),
  DonHangController.updateDonHang
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  DonHangController.deleteDonHang
);

// Lấy danh sách cảnh báo đơn hàng
router.get(
  '/alerts',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.getAlerts
);

// Danh sách món của 1 order
router.get(
  '/:id/items',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.getOrderItems
);

// Thêm nhanh món vào đơn hàng
router.post(
  '/:id/items',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(Joi.object({
    items: Joi.array().items(
      Joi.object({
        monan_id: Joi.number().integer().min(1).required(),
        so_luong: Joi.number().integer().min(1).required(),
        ghi_chu: Joi.string().max(255).allow(null, '')
      })
    ).min(1).required()
  })),
  DonHangController.addItemsToOrder
);

// Hủy món khỏi đơn hàng
router.patch(
  '/items/:chitiet_id/cancel',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.cancelOrderItem
);

// Ra món (phục vụ)
router.patch(
  '/items/:chitiet_id/serve',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.serveOrderItem
);

// Kiểm tra order rỗng
router.get('/:id/is-empty',
  require('../middlewares/auth').authMiddleware,
  require('../middlewares/role').roleMiddleware(['Quan Ly', 'Nhan Vien']),
  require('../controllers/donHang.controller').isOrderEmpty
);

// Cập nhật ghi chú cho món trong order
router.patch('/items/:chitiet_id/ghichu',
  require('../middlewares/auth').authMiddleware,
  require('../middlewares/role').roleMiddleware(['Quan Ly', 'Nhan Vien']),
  require('../controllers/donHang.controller').updateItemNote
);

// Thống kê thời gian ra món cho từng món trong order
router.get('/:id/items-serving-stats',
  require('../middlewares/auth').authMiddleware,
  require('../middlewares/role').roleMiddleware(['Quan Ly', 'Nhan Vien']),
  require('../controllers/donHang.controller').getOrderItemsServingStats
);

module.exports = router;