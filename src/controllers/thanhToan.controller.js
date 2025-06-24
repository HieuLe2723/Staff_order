const ThanhToanService = require('../services/thanhToan.service');
const PhienSuDungBanService = require('../services/phienSuDungBan.service');
const ResponseUtils = require('../utils/response');
const IpUtils = require('../utils/ip');
const { validate, schemas } = require('../middlewares/validate');

class ThanhToanController {
  static async checkout(req, res, next) {
    try {
      const { phien_id, ...paymentInfo } = req.body;
      if (!phien_id) {
        return res.status(400).json(ResponseUtils.error('phien_id is required'));
      }

      // 1. Calculate the total bill for the session
      const bill = await PhienSuDungBanService.calculateBill(phien_id);

      // 2. Create the payment record with the calculated amount and default method
      const paymentData = {
        ...paymentInfo,
        phien_id,
        so_tien: bill.total_amount,
        phuong_thuc: 'TienMat', // Default payment method
      };
      
      const thanhToan = await ThanhToanService.createThanhToan(paymentData);

      return res.status(201).json(
        ResponseUtils.success({
          bill,
          payment: thanhToan
        }, 'Checkout process initiated successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async createThanhToan(req, res, next) {
    try {
      const thanhToan = await ThanhToanService.createThanhToan(req.body);
      return res.status(201).json(
        ResponseUtils.success(thanhToan, 'Payment created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getThanhToan(req, res, next) {
    try {
      const thanhToan = await ThanhToanService.getThanhToanById(req.params.thanhtoan_id);
      return res.status(200).json(
        ResponseUtils.success(thanhToan, 'Payment retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateThanhToan(req, res, next) {
    try {
      const thanhToan = await ThanhToanService.updateThanhToan(req.params.thanhtoan_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(thanhToan, 'Payment updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateThanhToanStatus(req, res, next) {
    try {
      const { status, phuong_thuc } = req.body; 
      const thanhToan = await ThanhToanService.updateThanhToanStatus(
        req.params.thanhtoan_id,
        status, 
        phuong_thuc 
      );
      return res.status(200).json(
        ResponseUtils.success(thanhToan, 'Payment status updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteThanhToan(req, res, next) {
    try {
      await ThanhToanService.deleteThanhToan(req.params.thanhtoan_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Payment deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async createVnPayUrl(req, res, next) {
    try {
      const { phien_id } = req.params;
      const ipAddr = IpUtils.getClientIp(req);

      const result = await ThanhToanService.createVnPayUrlForSession(phien_id, ipAddr);
      return res.json(ResponseUtils.success(result, 'Tạo URL thanh toán VNPay thành công.'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThanhToanController;