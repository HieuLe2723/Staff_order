const ThongTinKhachHangService = require('../services/thongTinKhachHang.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class ThongTinKhachHangController {
  static async createKhachHang(req, res, next) {
    try {
      const khachHang = await ThongTinKhachHangService.createKhachHang(req.body);
      return res.status(201).json(
        ResponseUtils.success(khachHang, 'Customer created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getKhachHang(req, res, next) {
    try {
      const khachHang = await ThongTinKhachHangService.getKhachHangById(req.params.khachhang_id);
      return res.status(200).json(
        ResponseUtils.success(khachHang, 'Customer retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateKhachHang(req, res, next) {
    try {
      const khachHang = await ThongTinKhachHangService.updateKhachHang(req.params.khachhang_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(khachHang, 'Customer updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteKhachHang(req, res, next) {
    try {
      await ThongTinKhachHangService.deleteKhachHang(req.params.khachhang_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Customer deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getTotalKhachHang(req, res, next) {
    try {
      const total = await ThongTinKhachHangService.getTotalKhachHang();
      return res.status(200).json({ total });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThongTinKhachHangController;