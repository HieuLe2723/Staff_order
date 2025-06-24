const express = require('express');
const router = express.Router();
const MonAnController = require('../controllers/MonAnController');
const { authMiddleware } = require('../middlewares/auth'); 
const { roleMiddleware } = require('../middlewares/role'); 
const { validate, schemas } = require('../middlewares/validate');
const loggerMiddleware = require('../middlewares/logger');
const rateLimitMiddleware = require('../middlewares/rateLimit');

router.use(loggerMiddleware);
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.get('/', roleMiddleware(['Quan Ly', 'Nhan Vien']), MonAnController.getMonAnByLoaiId);
router.post('/', roleMiddleware(['Quan Ly']), validate(schemas.monAn), MonAnController.createMonAn);
router.get('/:id', roleMiddleware(['Quan Ly', 'Nhan Vien']), MonAnController.getMonAnById);
router.put('/:id', roleMiddleware(['Quan Ly']), validate(schemas.monAn), MonAnController.updateMonAn);
router.delete('/:id', roleMiddleware(['Quan Ly']), MonAnController.deleteMonAn);

module.exports = router;