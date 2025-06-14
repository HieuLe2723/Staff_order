// src/models/chiTietPhieuNhap.model.js
const pool = require('../config/db.config');

class ChiTietPhieuNhapModel {
  static async create({ phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu }) {
    const [result] = await pool.query(
      'INSERT INTO ChiTietPhieuNhap (phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu) VALUES (?, ?, ?, ?, ?)',
      [phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create inventory receipt detail');
    }
    return { chitiet_phieunhap_id: result.insertId, phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu };
  }

  static async findById(chitiet_phieunhap_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ChiTietPhieuNhap WHERE chitiet_phieunhap_id = ?',
      [chitiet_phieunhap_id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM ChiTietPhieuNhap');
    return rows;
  }

  static async update(chitiet_phieunhap_id, { phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu }) {
    const [result] = await pool.query(
      'UPDATE ChiTietPhieuNhap SET phieunhap_id = ?, nguyenlieu_id = ?, so_luong = ?, don_vi = ?, ghi_chu = ? WHERE chitiet_phieunhap_id = ?',
      [phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu, chitiet_phieunhap_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory receipt detail not found');
    }
    return await this.findById(chitiet_phieunhap_id);
  }

  static async delete(chitiet_phieunhap_id) {
    const [result] = await pool.query(
      'DELETE FROM ChiTietPhieuNhap WHERE chitiet_phieunhap_id = ?',
      [chitiet_phieunhap_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Inventory receipt detail not found');
    }
    return { chitiet_phieunhap_id };
  }
}

module.exports = ChiTietPhieuNhapModel;