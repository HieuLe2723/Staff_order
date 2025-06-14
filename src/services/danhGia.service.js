// src/services/danhGia.service.js
const DanhGiaModel = require('../models/danhGia.model');
const NhanVienModel = require('../models/nhanVien.model'); // Giả sử model NhanVien đã được tạo
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model'); // Giả sử model ThongTinKhachHang
const PhienSuDungBanModel = require('../models/phienSuDungBan.model'); // Giả sử model PhienSuDungBan

class DanhGiaService {
  static async createDanhGia({ nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan }, user) {
    // Kiểm tra quyền (chỉ khách hàng được đánh giá)
    if (user.role !== 'KhachHang') {
      throw new Error('Chỉ khách hàng mới có thể tạo đánh giá');
    }

    return await DanhGiaModel.create({ nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan });
  }

  static async getDanhGiaById(danhgia_id) {
    return await DanhGiaModel.findById(danhgia_id);
  }

  static async deleteDanhGia(danhgia_id, user) {
    // Kiểm tra quyền (chỉ quản lý hoặc khách hàng tạo đánh giá được xóa)
    const danhGia = await DanhGiaModel.findById(danhgia_id);
    if (user.role !== 'QuanLy' && user.khachhang_id !== danhGia.khachhang_id) {
      throw new Error('Bạn không có quyền xóa đánh giá này');
    }

    return await DanhGiaModel.delete(danhgia_id);
  }
}

module.exports = DanhGiaService;