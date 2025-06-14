// src/routes/danhGiaNhanVien.route.js
const express = require('express');
const router = express.Router();
const DanhGiaNhanVienController = require('../controllers/danhGiaNhanVien.controller');
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
  roleMiddleware(['Quan Ly']),
  validate(schemas.danhGiaNhanVien), // Sửa danhGiaNhanVienSchema thành schemas.danhGiaNhanVien
  DanhGiaNhanVienController.createDanhGiaNhanVien
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  DanhGiaNhanVienController.getDanhGiaNhanVienById
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  DanhGiaNhanVienController.deleteDanhGiaNhanVien
);

module.exports = router;