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

// Update table session (Admin or employee)
router.put(
  '/:phien_id',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  validate(schemas.phienSuDungBan), // Sửa phienSchema thành schemas.phienSuDungBan
  PhienSuDungBanController.updatePhien
);

// End table session (Admin or employee)
router.patch(
  '/:phien_id/end',
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  PhienSuDungBanController.endPhien
);

// Delete table session (Admin only)
router.delete(
  '/:phien_id',
  authMiddleware,
  roleMiddleware('Quan Ly'),
  PhienSuDungBanController.deletePhien
);

module.exports = router;