const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model');

class ThongTinKhachHangService {
  static async createKhachHang({ ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom }) {
    // Kiểm tra các trường hợp lệ
    if (!ho_ten && !so_dien_thoai && !email) {
      throw new Error('At least one of ho_ten, so_dien_thoai, or email is required');
    }

    // Kiểm tra định dạng email nếu có
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    return await ThongTinKhachHangModel.create({ ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom });
  }

  static async getKhachHangById(khachhang_id) {
    const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
    if (!khachHang) {
      throw new Error('Customer not found');
    }
    return khachHang;
  }

  static async updateKhachHang(khachhang_id, { ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom }) {
    const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
    if (!khachHang) {
      throw new Error('Customer not found');
    }

    // Kiểm tra định dạng email nếu có
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    return await ThongTinKhachHangModel.update(khachhang_id, { ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom });
  }

  static async deleteKhachHang(khachhang_id) {
    const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
    if (!khachHang) {
      throw new Error('Customer not found');
    }

    return await ThongTinKhachHangModel.delete(khachhang_id);
  }
}

module.exports = ThongTinKhachHangService;