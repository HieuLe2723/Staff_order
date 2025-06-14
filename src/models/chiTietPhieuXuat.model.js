// src/models/chiTietPhieuXuat.model.js
const pool = require('../config/db.config');

class ChiTietPhieuXuatModel {
  static async create({ phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu }) {
    const [result] = await pool.query(
      'INSERT INTO ChiTietPhieuXuat (phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu) VALUES (?, ?, ?, ?, ?)',
      [phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create inventory issue detail');
    }
    return { chitiet_phieuxuat_id: result.insertId, phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu };
  }

  static async findById(chitiet_phieuxuat_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ChiTietPhieuXuat WHERE chitiet_phieuxuat_id = ?',
      [chitiet_phieuxuat_id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM ChiTietPhieuXuat');
    return rows;
  }

  static async update(chitiet_phieuxuat_id, { phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu }) {
    const [result] = await pool.query(
      'UPDATE ChiTietPhieuXuat SET phieuxuat_id = ?, nguyenlieu_id = ?, so_luong = ?, don_vi = ?, ghi_chu = ? WHERE chitiet_phieuxuat_id = ?',
      [phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu, chitiet_phieuxuat_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory issue detail not found');
    }
    return await this.findById(chitiet_phieuxuat_id);
  }

  static async delete(chitiet_phieuxuat_id) {
    const [result] = await pool.query(
      'DELETE FROM ChiTietPhieuXuat WHERE chitiet_phieuxuat_id = ?',
      [chitiet_phieuxuat_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory issue detail not found');
    }
    return { chitiet_phieuxuat_id };
  }
}

module.exports = ChiTietPhieuXuatModel;