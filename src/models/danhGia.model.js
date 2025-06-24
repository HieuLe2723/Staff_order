// src/models/danhGia.model.js
const pool = require('../config/db.config');

class DanhGiaModel {
  static async create({ nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan }) {
    if (diem_so < 1 || diem_so > 5) {
      throw new Error('Điểm số phải từ 1 đến 5');
    }
    const [nhanVien] = await pool.query('SELECT 1 FROM NhanVien WHERE nhanvien_id = ?', [nhanvien_id]);
    if (!nhanVien[0]) throw new Error('Không tìm thấy nhân viên với nhanvien_id cung cấp');
    const [khachHang] = await pool.query('SELECT 1 FROM ThongTinKhachHang WHERE khachhang_id = ?', [khachhang_id]);
    if (!khachHang[0]) throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    const [phien] = await pool.query('SELECT 1 FROM PhienSuDungBan WHERE phien_id = ?', [phien_id]);
    if (!phien[0]) throw new Error('Không tìm thấy phiên sử dụng bàn với phien_id cung cấp');

    const [result] = await pool.query(
      'INSERT INTO DanhGia (nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan) VALUES (?, ?, ?, ?, ?)',
      [nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan]
    );
    return { danhgia_id: result.insertId, nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan, ngay_tao: new Date() };
  }

  static async findById(danhgia_id) {
    const [rows] = await pool.query(
      'SELECT * FROM DanhGia WHERE danhgia_id = ?',
      [danhgia_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy đánh giá với danhgia_id cung cấp');
    }
    return rows[0];
  }

  static async delete(danhgia_id) {
    const [result] = await pool.query(
      'DELETE FROM DanhGia WHERE danhgia_id = ?',
      [danhgia_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đánh giá với danhgia_id cung cấp');
    }
    return { danhgia_id };
  }

  static async countAll() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM DanhGia');
    return rows[0].total;
  }

  static async getTotalPoints() {
    const [rows] = await pool.query('SELECT SUM(diem_so) as total_points FROM DanhGia');
    return rows[0].total_points;
  }

  static async countUniqueCustomers() {
    const [rows] = await pool.query('SELECT COUNT(DISTINCT khachhang_id) as total_customers FROM DanhGia');
    return rows[0].total_customers;
  }
}

module.exports = DanhGiaModel;