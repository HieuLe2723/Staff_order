const express = require('express');
const router = express.Router();
const LichSuBaoTriController = require('../controllers/LichSuBaoTriController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.lichSuBaoTri), LichSuBaoTriController.createLichSuBaoTri);
router.get('/:id', LichSuBaoTriController.getLichSuBaoTriById);
router.put('/:id', validate(schemas.lichSuBaoTri), LichSuBaoTriController.updateLichSuBaoTri);
router.delete('/:id', LichSuBaoTriController.deleteLichSuBaoTri);

module.exports = router;