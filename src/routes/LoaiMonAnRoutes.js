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
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.loaiMonAn), LoaiMonAnController.createLoaiMonAn);
router.get('/', LoaiMonAnController.getAllLoaiMonAn);
router.get('/:id', LoaiMonAnController.getLoaiMonAnById);
router.delete('/:id', LoaiMonAnController.deleteLoaiMonAn);

module.exports = router;