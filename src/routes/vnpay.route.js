const express = require('express');
const router = express.Router();
const VNPayController = require('../controllers/vnpay.controller');

router.post('/create-payment-url', VNPayController.createPaymentUrl);
router.get('/vnpay_return', VNPayController.vnpayReturn);

module.exports = router;
