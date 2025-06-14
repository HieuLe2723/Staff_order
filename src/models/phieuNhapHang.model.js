// src/models/phieuNhapHang.model.js
const pool = require('../config/db.config');

class PhieuNhapHangModel {
  static async create({ nhanvien_id, tong_so_luong, ghi_chu, trang_thai = 'ChoXacNhan' }) {
    const [result] = await pool.query(
      'INSERT INTO PhieuNhapHang (nhanvien_id, tong_so_luong, ghi_chu, trang_thai) VALUES (?, ?, ?, ?)',
      [nhanvien_id, tong_so_luong, ghi_chu, trang_thai]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create inventory receipt');
    }
    return { phieunhap_id: result.insertId, nhanvien_id, tong_so_luong, ghi_chu, trang_thai, ngay_nhap: new Date() };
  }

  static async findById(phieunhap_id) {
    const [rows] = await pool.query(
      'SELECT * FROM PhieuNhapHang WHERE phieunhap_id = ?',
      [phieunhap_id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM PhieuNhapHang');
    return rows;
  }

  static async update(phieunhap_id, { nhanvien_id, tong_so_luong, ghi_chu, trang_thai }) {
    const [result] = await pool.query(
      'UPDATE PhieuNhapHang SET nhanvien_id = ?, tong_so_luong = ?, ghi_chu = ?, trang_thai = ?, ngay_cap_nhat = NOW() WHERE phieunhap_id = ?',
      [nhanvien_id, tong_so_luong, ghi_chu, trang_thai, phieunhap_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory receipt not found');
    }
    return await this.findById(phieunhap_id);
  }

  static async delete(phieunhap_id) {
    const [result] = await pool.query(
      'DELETE FROM PhieuNhapHang WHERE phieunhap_id = ?',
      [phieunhap_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory receipt not found');
    }
    return { phieunhap_id };
  }
}

module.exports = PhieuNhapHangModel;