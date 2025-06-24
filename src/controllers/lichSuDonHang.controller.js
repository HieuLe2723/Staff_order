// src/controllers/lichSuDonHang.controller.js
const LichSuDonHangService = require('../services/lichSuDonHang.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class LichSuDonHangController {
  // POST /lich-su-don-hang
  static async createLog(req, res, next) {
    try {
      const { donhang_id, hanh_dong, mo_ta } = req.body;
      const nhanvien_id = req.user?.nhanvien_id || null;
      const log = await LichSuDonHangService.addLog({
        donhang_id,
        hanh_dong: HelperUtils.sanitizeString(hanh_dong),
        mo_ta: HelperUtils.sanitizeString(mo_ta),
        nhanvien_id,
      });
      return res.status(201).json(ResponseUtils.success(log, 'Tạo lịch sử đơn hàng thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  // GET /lich-su-don-hang/:donhang_id
  static async getLogsByDonHang(req, res, next) {
    try {
      const { donhang_id } = req.params;
      const logs = await LichSuDonHangService.getLogs(donhang_id);
      return res.json(ResponseUtils.success(logs));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LichSuDonHangController;
