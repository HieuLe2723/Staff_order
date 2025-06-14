// src/models/thongTinKhachHang.model.js
const pool = require('../config/db.config');

class ThongTinKhachHangModel {
  static async create({ ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom }) {
    const [result] = await pool.query(
      'INSERT INTO ThongTinKhachHang (ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom) VALUES (?, ?, ?, ?, ?, ?)',
      [ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create customer');
    }
    return { khachhang_id: result.insertId, ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom };
  }

  static async findById(khachhang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ThongTinKhachHang WHERE khachhang_id = ?',
      [khachhang_id]
    );
    return rows[0] || null;
  }

  static async update(khachhang_id, { ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom }) {
    const [result] = await pool.query(
      'UPDATE ThongTinKhachHang SET ho_ten = ?, so_dien_thoai = ?, email = ?, quoc_tich = ?, nhom_tuoi = ?, loai_nhom = ?, ngay_cap_nhat = NOW() WHERE khachhang_id = ?',
      [ho_ten, so_dien_thoai, email, quoc_tich, nhom_tuoi, loai_nhom, khachhang_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Customer not found');
    }
    return await this.findById(khachhang_id);
  }

  static async delete(khachhang_id) {
    const [result] = await pool.query(
      'DELETE FROM ThongTinKhachHang WHERE khachhang_id = ?',
      [khachhang_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Customer not found');
    }
    return { khachhang_id };
  }
}

module.exports = ThongTinKhachHangModel;