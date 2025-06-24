const crypto = require('crypto');
const config = require('../config/vnpay.config');
const DatBanModel = require('../models/datBan.model');
const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
const ThanhToanService = require('../services/thanhToan.service');

class VNPayController {
  static async createPaymentUrl(req, res) {
    try {
      const { datban_id } = req.body;

      const datBan = await DatBanModel.findById(datban_id);
      if (!datBan) return res.status(404).json({ message: 'Không tìm thấy đặt bàn.' });

      const phien = await PhienSuDungBanModel.findByDatBanId(datban_id);
      if (!phien) return res.status(404).json({ message: 'Không tìm thấy phiên sử dụng bàn.' });

      const phienId = phien.phien_id;
      const amount = datBan.so_tien_coc;

      let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
      if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') ipAddr = '127.0.0.1';
      else if (ipAddr.startsWith('::ffff:')) ipAddr = ipAddr.replace('::ffff:', '');

      const tmnCode = config.vnp_TmnCode;
      const secretKey = config.vnp_HashSecret;
      const vnpUrl = config.vnp_Url;
      const returnUrl = config.vnp_ReturnUrl;

      const date = new Date();
      const createDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;

      const txnRef = String(phienId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 100);
      const amountInt = parseInt(amount, 10);
      if (isNaN(amountInt) || amountInt <= 0) {
        return res.status(400).json({ message: 'Số tiền cọc không hợp lệ.' });
      }

      const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: `Thanh toan phien su dung ban ${phienId}`,
        vnp_OrderType: 'billpayment',
        vnp_Amount: (amountInt * 100).toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate
      };

      // Sắp xếp tham số để ký
      const sortedParams = {};
      Object.keys(vnp_Params).sort().forEach(key => {
        sortedParams[key] = vnp_Params[key];
      });

      const signData = Object.entries(sortedParams).map(([k, v]) => `${k}=${v}`).join('&');
      const hmac = crypto.createHmac('sha512', secretKey);
      const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();

      // Thêm chữ ký vào sortedParams (dùng để tạo URL)
      sortedParams.vnp_SecureHash = signature;

      // Tạo URL thanh toán
      const paymentUrl = `${vnpUrl}?${Object.entries(sortedParams)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&')}`;

      return res.json({
        paymentUrl,
        phien_id: phienId,
        ban_ids: phien.ban_ids
      });
    } catch (err) {
      console.error('Lỗi khi tạo paymentUrl:', err);
      return res.status(500).json({ message: 'Lỗi hệ thống khi tạo URL thanh toán.' });
    }
  }

  static async vnpayReturn(req, res) {
    try {
      const result = await ThanhToanService.handleVnPayReturn(req.query);

      // Trong thực tế, bạn sẽ muốn chuyển hướng đến một trang trên frontend
      // ví dụ: res.redirect(`https://your-frontend.com/payment-result?code=${result.code}`)
      if (result.code === '00') {
        res.status(200).send(`
          <html>
            <head><title>Thanh toán thành công</title></head>
            <body>
              <h1>Thanh toán thành công!</h1>
              <p>Mã giao dịch: ${req.query.vnp_TxnRef}</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <html>
            <head><title>Thanh toán thất bại</title></head>
            <body>
              <h1>Thanh toán thất bại!</h1>
              <p>Mã lỗi: ${result.code}</p>
              <p>Lý do: ${result.message}</p>
              <p>Vui lòng thử lại hoặc liên hệ nhân viên để được hỗ trợ.</p>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('Lỗi xử lý return từ VNPay:', err);
      res.status(500).send(`
        <html>
          <head><title>Lỗi hệ thống</title></head>
          <body>
            <h1>Lỗi xử lý thanh toán!</h1>
            <p>${err.message}</p>
          </body>
        </html>
      `);
    }
  }
}

module.exports = VNPayController;
