// src/models/danhGiaNhanVien.model.js
const pool = require('../config/db.config');

class DanhGiaNhanVienModel {
  static async create({ nhanvien_id, thang, nam, diem_so, binh_luan }) {
    if (thang < 1 || thang > 12) {
      throw new Error('Tháng phải từ 1 đến 12');
    }
    if (nam < 1900 || nam > new Date().getFullYear()) {
      throw new Error('Năm không hợp lệ');
    }
    const [nhanVien] = await pool.query('SELECT 1 FROM NhanVien WHERE nhanvien_id = ?', [nhanvien_id]);
    if (!nhanVien[0]) throw new Error('Không tìm thấy nhân viên với nhanvien_id cung cấp');

    const [result] = await pool.query(
      'INSERT INTO DanhGiaNhanVien (nhanvien_id, thang, nam, diem_so, binh_luan) VALUES (?, ?, ?, ?, ?)',
      [nhanvien_id, thang, nam, diem_so, binh_luan]
    );
    return { danhgia_id: result.insertId, nhanvien_id, thang, nam, diem_so, binh_luan, ngay_tao: new Date() };
  }

  static async findById(danhgia_id) {
    const [rows] = await pool.query(
      'SELECT * FROM DanhGiaNhanVien WHERE danhgia_id = ?',
      [danhgia_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy đánh giá nhân viên với danhgia_id cung cấp');
    }
    return rows[0];
  }

  static async delete(danhgia_id) {
    const [result] = await pool.query(
      'DELETE FROM DanhGiaNhanVien WHERE danhgia_id = ?',
      [danhgia_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đánh giá nhân viên với danhgia_id cung cấp');
    }
    return { danhgia_id };
  }
}

module.exports = DanhGiaNhanVienModel;