// src/routes/CaLamViec.route.js
const express = require('express');
const router = express.Router();
const CaLamViecController = require('../controllers/CaLamViec.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.post(
  '/create',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.caLamViec),
  CaLamViecController.createShift
);

router.get(
  '/:calamviec_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan  Vien']),
  CaLamViecController.getShiftById
);

router.get(
  '/',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.getAllShifts
);

router.put(
  '/:calamviec_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.caLamViec),
  CaLamViecController.updateShift
);

router.delete(
  '/:calamviec_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  CaLamViecController.deleteShift
);


router.post(
  '/assign',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.phanCaNhanVien),
  CaLamViecController.assignShift
);

router.put(
  '/check-in/:phanca_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.checkIn
);

router.put(
  '/check-out/:phanca_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.checkOut
);

router.get(
  '/employee-shifts',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.getEmployeeShifts
);

router.get(
  '/salary',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.getSalaryByEmployee
);

router.put(
  '/salary/paid/:luong_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  CaLamViecController.markSalaryPaid
);
router.get(
  '/nhan-vien',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  async (req, res, next) => {
    try {
      const employees = await CaLamViecService.getAllEmployees(); // Assuming this method exists or will be added
      return res.status(200).json(
        ResponseUtils.success(employees, 'Lấy danh sách nhân viên thành công')
      );
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  '/nhan-vien',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware(['Quan Ly', 'Nhan Vien']),
  CaLamViecController.getAllEmployees // Add this method to the controller
);
router.put(
  '/assign/:phanca_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  validate(schemas.phanCaNhanVien),
  CaLamViecController.editShiftAssignment
);

router.delete(
  '/assign/:phanca_id',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('Quan Ly'),
  CaLamViecController.deleteShiftAssignment
);
module.exports = router;