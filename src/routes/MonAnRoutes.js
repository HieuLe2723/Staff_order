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
router.use(roleMiddleware(['Quan Ly']));

router.post('/', validate(schemas.monAn), MonAnController.createMonAn);
router.get('/:id', MonAnController.getMonAnById);
router.put('/:id', validate(schemas.monAn), MonAnController.updateMonAn);
router.delete('/:id', MonAnController.deleteMonAn);

module.exports = router;