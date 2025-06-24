const express = require('express');
const router = express.Router();
const LoaiMonAnController = require('../controllers/LoaiMonAnController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);

router.post('/', roleMiddleware(['Quan Ly']), validate(schemas.loaiMonAn), LoaiMonAnController.createLoaiMonAn);
router.get('/', roleMiddleware(['Quan Ly', 'Nhan Vien']), LoaiMonAnController.getAllLoaiMonAn);
router.get('/loai-menu', roleMiddleware(['Quan Ly', 'Nhan Vien']), LoaiMonAnController.getUniqueMenuTypes);
router.get('/:id', roleMiddleware(['Quan Ly', 'Nhan Vien']), LoaiMonAnController.getLoaiMonAnById);
router.delete('/:id', roleMiddleware(['Quan Ly']), LoaiMonAnController.deleteLoaiMonAn);

module.exports = router;