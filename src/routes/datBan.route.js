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
  roleMiddleware(['Khach Hang', 'Quan Ly', 'NhanVien']),
  validate(schemas.reservation),
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
  validate(schemas.reservation),
  DatBanController.updateDatBan
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  DatBanController.deleteDatBan
);

module.exports = router;