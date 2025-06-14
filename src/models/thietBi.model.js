// src/models/thietBi.model.js
const pool = require('../config/db.config');

class ThietBiModel {
  static async create({ ten, so_luong = 1, trang_thai = 'HoatDong' }) {
    const [result] = await pool.query(
      'INSERT INTO ThietBi (ten, so_luong, trang_thai) VALUES (?, ?, ?)',
      [ten, so_luong, trang_thai]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create equipment');
    }
    return { thietbi_id: result.insertId, ten, so_luong, trang_thai };
  }

  static async findById(thietbi_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ThietBi WHERE thietbi_id = ?',
      [thietbi_id]
    );
    return rows[0] || null;
  }

  static async update(thietbi_id, { ten, so_luong, trang_thai }) {
    const [result] = await pool.query(
      'UPDATE ThietBi SET ten = ?, so_luong = ?, trang_thai = ?, ngay_cap_nhat = NOW() WHERE thietbi_id = ?',
      [ten, so_luong, trang_thai, thietbi_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Equipment not found');
    }
    return await this.findById(thietbi_id);
  }

  static async delete(thietbi_id) {
    const [result] = await pool.query(
      'DELETE FROM ThietBi WHERE thietbi_id = ?',
      [thietbi_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Equipment not found');
    }
    return { thietbi_id };
  }
}

module.exports = ThietBiModel;