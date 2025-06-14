const KhachHangThanThietModel = require('../models/khachHangThanThiet.model');

class KhachHangThanThietService {
  static async createKhachHangThanThiet({ khachhang_id, diem_so, cap_bac }) {
    if (!Number.isInteger(Number(khachhang_id))) {
      throw new Error('khachhang_id must be an integer');
    }
    if (!Number.isInteger(diem_so) || diem_so < 0) {
      throw new Error('diem_so must be a non-negative integer');
    }
    if (!['Bac', 'Vang', 'BachKim'].includes(cap_bac)) {
      throw new Error('cap_bac must be one of: Bac, Vang, BachKim');
    }
    return await KhachHangThanThietModel.create({ khachhang_id, diem_so, cap_bac });
  }

  static async getKhachHangThanThietById(thanthiet_id) {
    if (!Number.isInteger(Number(thanthiet_id))) {
      throw new Error('thanthiet_id must be an integer');
    }
    const khachHang = await KhachHangThanThietModel.findById(thanthiet_id);
    if (!khachHang) {
      throw new Error('Loyal customer not found');
    }
    return khachHang;
  }

  static async getKhachHangThanThietByKhachhangId(khachhang_id) {
    if (!Number.isInteger(Number(khachhang_id))) {
      throw new Error('khachhang_id must be an integer');
    }
    const khachHang = await KhachHangThanThietModel.findByKhachhangId(khachhang_id);
    if (!khachHang) {
      throw new Error('Loyal customer not found');
    }
    return khachHang;
  }

  static async updateKhachHangThanThiet(thanthiet_id, { khachhang_id, diem_so, cap_bac }) {
    if (!Number.isInteger(Number(thanthiet_id))) {
      throw new Error('thanthiet_id must be an integer');
    }
    if (!Number.isInteger(Number(khachhang_id))) {
      throw new Error('khachhang_id must be an integer');
    }
    if (!Number.isInteger(diem_so) || diem_so < 0) {
      throw new Error('diem_so must be a non-negative integer');
    }
    if (!['Bac', 'Vang', 'BachKim'].includes(cap_bac)) {
      throw new Error('cap_bac must be one of: Bac, Vang, BachKim');
    }
    return await KhachHangThanThietModel.update(thanthiet_id, { khachhang_id, diem_so, cap_bac });
  }

  static async deleteKhachHangThanThiet(thanthiet_id) {
    if (!Number.isInteger(Number(thanthiet_id))) {
      throw new Error('thanthiet_id must be an integer');
    }
    return await KhachHangThanThietModel.delete(thanthiet_id);
  }
}

module.exports = KhachHangThanThietService;