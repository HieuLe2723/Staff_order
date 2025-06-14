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
  validate(schemas.order), // Sửa donHangSchema thành schemas.order
  DonHangController.createDonHang
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DonHangController.getDonHangById
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
  roleMiddleware(['QuanLy']),
  DonHangController.deleteDonHang
);

module.exports = router;