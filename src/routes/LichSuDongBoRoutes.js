const express = require('express');
const router = express.Router();
const LichSuDongBoController = require('../controllers/LichSuDongBoController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.lichSuDongBo), LichSuDongBoController.createLichSuDongBo);
router.get('/:id', LichSuDongBoController.getLichSuDongBoById);
router.put('/:id', validate(schemas.lichSuDongBo), LichSuDongBoController.updateLichSuDongBo);
router.delete('/:id', LichSuDongBoController.deleteLichSuDongBo);

module.exports = router;