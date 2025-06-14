// src/services/donHang.service.js
const DonHangModel = require('../models/donHang.model');
const PhienSuDungBanModel = require('../models/phienSuDungBan.model'); // Giả sử model PhienSuDungBan
const KhuyenMaiModel = require('../models/khuyenMai.model'); // Giả sử model KhuyenMai

class DonHangService {
  static async createDonHang({ phien_id, khuyenmai_id, loai_menu, hanh_dong, mo_ta_hanh_dong }, user) {
    // Kiểm tra quyền (chỉ nhân viên hoặc quản lý)
    if (!['NhanVien', 'QuanLy'].includes(user.role)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể tạo đơn hàng');
    }

    // Kiểm tra khuyến mãi hợp lệ
    if (khuyenmai_id) {
      const khuyenMai = await KhuyenMaiModel.findById(khuyenmai_id);
      if (khuyenMai.ngay_het_han < new Date()) {
        throw new Error('Khuyến mãi đã hết hạn');
      }
    }

    return await DonHangModel.create({ phien_id, khuyenmai_id, loai_menu, hanh_dong, mo_ta_hanh_dong });
  }

  static async getDonHangById(donhang_id) {
    return await DonHangModel.findById(donhang_id);
  }

  static async updateDonHang(donhang_id, { phien_id, loai_menu, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong }, user) {
    if (!['NhanVien', 'QuanLy'].includes(user.role)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể cập nhật đơn hàng');
    }

    return await DonHangModel.update(donhang_id, {
      phien_id,
      loai_menu,
      khuyenmai_id,
      gia_tri_giam,
      tong_tien,
      trang_thai,
      hanh_dong,
      mo_ta_hanh_dong,
    });
  }

  static async deleteDonHang(donhang_id, user) {
    if (!['QuanLy'].includes(user.role)) {
      throw new Error('Chỉ quản lý mới có thể xóa đơn hàng');
    }

    // Kiểm tra chi tiết đơn hàng
    const chiTiet = await ChiTietDonHangModel.findAll({ donhang_id });
    if (chiTiet.length > 0) {
      throw new Error('Không thể xóa đơn hàng có chi tiết liên quan');
    }

    return await DonHangModel.delete(donhang_id);
  }
}

module.exports = DonHangService;