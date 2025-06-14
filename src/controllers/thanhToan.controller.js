const ThanhToanService = require('../services/thanhToan.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class ThanhToanController {
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
      const { trang_thai } = req.body;
      const thanhToan = await ThanhToanService.updateThanhToanStatus(req.params.thanhtoan_id, trang_thai);
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
}

module.exports = ThanhToanController;