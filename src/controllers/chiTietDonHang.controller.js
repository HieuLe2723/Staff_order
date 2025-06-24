// src/controllers/chiTietDonHang.controller.js
const ChiTietDonHangService = require('../services/chiTietDonHang.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class ChiTietDonHangController {
  static async createChiTietDonHang(req, res, next) {
    try {
      const { donhang_id, monan_id, so_luong, ghi_chu } = req.body;
      const sanitizedData = {
        donhang_id,
        monan_id,
        so_luong,
        ghi_chu: HelperUtils.sanitizeString(ghi_chu),
      };
      const chiTiet = await ChiTietDonHangService.createChiTietDonHang(sanitizedData);
      return res.status(201).json(ResponseUtils.success(chiTiet, 'Tạo chi tiết đơn hàng thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getChiTietDonHangById(req, res, next) {
    try {
      const { id } = req.params;
      const chiTiet = await ChiTietDonHangService.getChiTietDonHangById(id);
      return res.json(ResponseUtils.success(chiTiet));
    } catch (err) {
      next(err);
    }
  }

  static async getChiTietDonHangBySessionId(req, res, next) {
    try {
      const { sessionId } = req.params;
      const chiTiet = await ChiTietDonHangService.getChiTietDonHangBySessionId(sessionId);
      return res.json(ResponseUtils.success(chiTiet));
    } catch (err) {
      next(err);
    }
  }

  static async updateChiTietDonHang(req, res, next) {
    try {
      const { id } = req.params;
      const { donhang_id, monan_id, so_luong, ghi_chu, thoi_gian_phuc_vu, trang_thai_phuc_vu } = req.body;
      const sanitizedData = {
        donhang_id,
        monan_id,
        so_luong,
        ghi_chu: HelperUtils.sanitizeString(ghi_chu),
        thoi_gian_phuc_vu,
        trang_thai_phuc_vu,
      };
      const updatedChiTiet = await ChiTietDonHangService.updateChiTietDonHang(id, sanitizedData);
      return res.json(ResponseUtils.success(updatedChiTiet, 'Cập nhật chi tiết đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }



  // Ra món hàng loạt
  static async serveDishesBulk(req, res, next) {
    try {
      const { item_ids } = req.body;
      const result = await ChiTietDonHangService.serveDishesBulk(item_ids);
      return res.json(ResponseUtils.success(result, 'Các món đã được cập nhật trạng thái phục vụ thành công'));
    } catch (err) {
      next(err);
    }
  }

  // Ra món
  static async serveDish(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ChiTietDonHangService.serveDish(id);
      return res.json(ResponseUtils.success(result, 'Món đã được phục vụ thành công'));
    } catch (err) {
      next(err);
    }
  }

  // Cập nhật số lượng đã ra món
  static async updateSoLuongDaRa(req, res, next) {
    try {
      const { items } = req.body; // items is an array of { chi_tiet_id, so_luong_ra }
      const result = await ChiTietDonHangService.updateSoLuongDaRa(items);
      return res.status(200).json(ResponseUtils.success(result, 'Successfully updated served quantities.'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChiTietDonHangController;