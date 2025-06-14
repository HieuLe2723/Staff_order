const express = require('express');
const router = express.Router();
const KhachHangThanThietController = require('../controllers/KhachHangThanThietController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.khachHangThanThiet), KhachHangThanThietController.createKhachHangThanThiet);
router.get('/:id', KhachHangThanThietController.getKhachHangThanThietById);
router.get('/khachhang/:khachhang_id', KhachHangThanThietController.getKhachHangThanThietByKhachhangId);
router.put('/:id', validate(schemas.khachHangThanThiet), KhachHangThanThietController.updateKhachHangThanThiet);
router.delete('/:id', KhachHangThanThietController.deleteKhachHangThanThiet);

module.exports = router;