const express = require('express');
const router = express.Router();
const MonAnNguyenLieuController = require('../controllers/MonAnNguyenLieuController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.monAnNguyenLieu), MonAnNguyenLieuController.createMonAnNguyenLieu);
router.get('/monan/:monan_id', MonAnNguyenLieuController.getMonAnNguyenLieuByMonanId);
router.delete('/:monan_id/:nguyenlieu_id', MonAnNguyenLieuController.deleteMonAnNguyenLieu);

module.exports = router;