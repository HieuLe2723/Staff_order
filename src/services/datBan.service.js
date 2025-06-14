// src/services/datBan.service.js
const DatBanModel = require('../models/datBan.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model'); // Giả sử model ThongTinKhachHang
const BanNhaHangModel = require('../models/banNhaHang.model');

class DatBanService {
  static async createDatBan({ khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    // Kiểm tra quyền
    if (!['KhachHang', 'NhanVien', 'QuanLy'].includes(user.role)) {
      throw new Error('Chỉ khách hàng, nhân viên hoặc quản lý mới có thể đặt bàn');
    }

    // Kiểm tra bàn trống
    const ban = await BanNhaHangModel.findById(ban_id);
    if (ban.trang_thai !== 'SanSang') {
      throw new Error('Bàn không khả dụng để đặt');
    }

    return await DatBanModel.create({
      khachhang_id,
      ban_id,
      so_khach,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });
  }

  static async getDatBanById(datban_id) {
    return await DatBanModel.findById(datban_id);
  }

  static async getAllDatBan({ khachhang_id, ban_id, trang_thai }) {
    return await DatBanModel.findAll({ khachhang_id, ban_id, trang_thai });
  }

  static async updateDatBan(datban_id, { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    if (!['NhanVien', 'QuanLy'].includes(user.role)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể cập nhật đặt bàn');
    }

    return await DatBanModel.update(datban_id, {
      khachhang_id,
      ban_id,
      so_khach,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });
  }

  static async deleteDatBan(datban_id, user) {
    if (!['QuanLy'].includes(user.role)) {
      throw new Error('Chỉ quản lý mới có thể xóa đặt bàn');
    }

    return await DatBanModel.delete(datban_id);
  }
}

module.exports = DatBanService;