// src/models/phieuXuatHang.model.js
const pool = require('../config/db.config');

class PhieuXuatHangModel {
  static async create({ nhanvien_id, tong_so_luong, ghi_chu, trang_thai = 'ChoXacNhan' }) {
    const [result] = await pool.query(
      'INSERT INTO PhieuXuatHang (nhanvien_id, tong_so_luong, ghi_chu, trang_thai) VALUES (?, ?, ?, ?)',
      [nhanvien_id, tong_so_luong, ghi_chu, trang_thai]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create inventory issue');
    }
    return { phieuxuat_id: result.insertId, nhanvien_id, tong_so_luong, ghi_chu, trang_thai };
  }

  static async findById(phieuxuat_id) {
    const [rows] = await pool.query(
      'SELECT * FROM PhieuXuatHang WHERE phieuxuat_id = ?',
      [phieuxuat_id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM PhieuXuatHang');
    return rows;
  }

  static async update(phieuxuat_id, { nhanvien_id, tong_so_luong, ghi_chu, trang_thai }) {
    const [result] = await pool.query(
      'UPDATE PhieuXuatHang SET nhanvien_id = ?, tong_so_luong = ?, ghi_chu = ?, trang_thai = ?, ngay_cap_nhat = NOW() WHERE phieuxuat_id = ?',
      [nhanvien_id, tong_so_luong, ghi_chu, trang_thai, phieuxuat_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory issue not found');
    }
    return await this.findById(phieuxuat_id);
  }

  static async delete(phieuxuat_id) {
    const [result] = await pool.query(
      'DELETE FROM PhieuXuatHang WHERE phieuxuat_id = ?',
      [phieuxuat_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory issue not found');
    }
    return { phieuxuat_id };
  }
}

module.exports = PhieuXuatHangModel;