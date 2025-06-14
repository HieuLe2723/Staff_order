const express = require('express');
const router = express.Router();
const KhuyenMaiController = require('../controllers/KhuyenMaiController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);

// Routes accessible to Quan Ly only
router.post('/', roleMiddleware(['Quan Ly']), validate(schemas.promotion), KhuyenMaiController.createKhuyenMai);
router.put('/:id', roleMiddleware(['Quan Ly']), validate(schemas.promotion), KhuyenMaiController.updateKhuyenMai);
router.delete('/:id', roleMiddleware(['Quan Ly']), KhuyenMaiController.deleteKhuyenMai);

// Routes accessible to Quan Ly and Nhan Vien
router.get('/', roleMiddleware(['Quan Ly', 'Nhan Vien']), KhuyenMaiController.getAllKhuyenMai);
router.get('/:code', roleMiddleware(['Quan Ly', 'Nhan Vien']), KhuyenMaiController.getKhuyenMaiByCode);

module.exports = router;