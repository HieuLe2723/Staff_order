// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate');

router.post('/login', validate(schemas.login, false), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;