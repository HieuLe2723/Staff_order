// src/services/lichSuDonHang.service.js
const LichSuDonHangModel = require('../models/lichSuDonHang.model');

class LichSuDonHangService {
  /**
   * Thêm log vào lịch sử
   */
  static async addLog({ donhang_id, hanh_dong, mo_ta, nhanvien_id }) {
    return await LichSuDonHangModel.create({ donhang_id, hanh_dong, mo_ta, nhanvien_id });
  }

  /**
   * Lấy danh sách lịch sử theo đơn hàng
   */
  static async getLogs(donhang_id) {
    return await LichSuDonHangModel.findByDonHangId(donhang_id);
  }
}

module.exports = LichSuDonHangService;
