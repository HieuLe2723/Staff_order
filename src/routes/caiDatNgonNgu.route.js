// src/routes/caiDatNgonNgu.route.js
const express = require('express');
const router = express.Router();
const CaiDatNgonNguController = require('../controllers/caiDatNgonNgu.controller');
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
  validate(schemas.caiDatNgonNgu), // Sửa ngonNguSchema thành schemas.caiDatNgonNgu
  CaiDatNgonNguController.createNgonNgu
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien', 'Khach Hang']),
  CaiDatNgonNguController.getNgonNguById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  validate(schemas.caiDatNgonNgu), // Sử dụng schemas.caiDatNgonNgu thay vì schema inline
  CaiDatNgonNguController.updateNgonNgu
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['Quan Ly']),
  CaiDatNgonNguController.deleteNgonNgu
);

module.exports = router;