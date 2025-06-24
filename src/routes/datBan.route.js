// src/routes/datBan.route.js
const express = require('express');
const router = express.Router();
const DatBanController = require('../controllers/datBan.controller');
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
  roleMiddleware(['Khach Hang', 'Quan Ly', 'Nhan Vien']),
  validate(schemas.datBan),
  DatBanController.createDatBan
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  DatBanController.getDatBanById
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  DatBanController.getAllDatBan
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.datBan),
  DatBanController.updateDatBan
);

router.patch(
  '/:id/gan-khach-hang',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DatBanController.ganKhachHang
);

router.patch(
  '/:id/huy',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  DatBanController.huyDatBan
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  DatBanController.deleteDatBan
);

router.post(
  '/dat-coc',
  authMiddleware,
  roleMiddleware(['Khach Hang', 'Quan Ly', 'Nhan Vien']),
  DatBanController.datCoc
);

router.post(
  '/thanh-toan-dat-coc',
  authMiddleware,
  roleMiddleware(['Khach Hang', 'Quan Ly', 'Nhan Vien']),
  DatBanController.thanhToanDatCoc
);

module.exports = router;