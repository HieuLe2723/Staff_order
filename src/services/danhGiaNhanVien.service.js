// src/services/danhGiaNhanVien.service.js
const DanhGiaNhanVienModel = require('../models/danhGiaNhanVien.model');
const NhanVienModel = require('../models/nhanVien.model'); // Giả sử model NhanVien đã được tạo

class DanhGiaNhanVienService {
  static async createDanhGiaNhanVien({ nhanvien_id, thang, nam, diem_so, binh_luan }, user) {
    if (user.role !== 'QuanLy') {
      throw new Error('Chỉ quản lý mới có thể tạo đánh giá nhân viên');
    }

    return await DanhGiaNhanVienModel.create({ nhanvien_id, thang, nam, diem_so, binh_luan });
  }

  static async getDanhGiaNhanVienById(danhgia_id) {
    return await DanhGiaNhanVienModel.findById(danhgia_id);
  }

  static async deleteDanhGiaNhanVien(danhgia_id, user) {
    if (user.role !== 'QuanLy') {
      throw new Error('Chỉ quản lý mới có thể xóa đánh giá nhân viên');
    }

    return await DanhGiaNhanVienModel.delete(danhgia_id);
  }
}

module.exports = DanhGiaNhanVienService;