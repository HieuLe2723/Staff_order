const express = require('express');
const router = express.Router();
const KhuVucController = require('../controllers/khuVuc.controller');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(roleMiddleware(['Quan Ly','Nhan Vien']));

router.post('/', validate(schemas.khuVuc), KhuVucController.createKhuVuc);
router.get('/', KhuVucController.getAllKhuVuc);
router.get('/:id', KhuVucController.getKhuVucById);
router.put('/:id', validate(schemas.khuVuc), KhuVucController.updateKhuVuc);
router.delete('/:id', KhuVucController.deleteKhuVuc);

module.exports = router;