// src/services/danhGia.service.js
const DanhGiaModel = require('../models/danhGia.model');
const NhanVienModel = require('../models/nhanVien.model'); // Giả sử model NhanVien đã được tạo
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model'); // Giả sử model ThongTinKhachHang
const PhienSuDungBanModel = require('../models/phienSuDungBan.model'); // Giả sử model PhienSuDungBan

class DanhGiaService {
  static async createDanhGia({ nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan }) {
    // Logic kiểm tra sự tồn tại của các ID liên quan đã được xử lý trong Model.
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

  static async getTotalDanhGia() {
    return await DanhGiaModel.countAll();
  }

  static async getTotalPoints() {
    return await DanhGiaModel.getTotalPoints();
  }

  static async getAverageRating() {
    const total = await DanhGiaModel.countAll();
    const totalPoints = await DanhGiaModel.getTotalPoints();
    return total > 0 ? (totalPoints / total).toFixed(1) : 0;
  }

  static async getTotalCustomers() {
    return await DanhGiaModel.countUniqueCustomers();
  }
}

module.exports = DanhGiaService;