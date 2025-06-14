// src/routes/danhGia.route.js
const express = require('express');
const router = express.Router();
const DanhGiaController = require('../controllers/danhGia.controller');
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
  roleMiddleware(['Khach Hang']),
  validate(schemas.evaluation),
  DanhGiaController.createDanhGia
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Khach Hang']),
  DanhGiaController.getDanhGiaById
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Khach Hang']),
  DanhGiaController.deleteDanhGia
);

module.exports = router;