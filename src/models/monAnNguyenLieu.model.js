// src/models/monAnNguyenLieu.model.js
const pool = require('../config/db.config');

class MonAnNguyenLieuModel {
  static async create({ monan_id, nguyenlieu_id, so_luong_can }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO MonAnNguyenLieu (monan_id, nguyenlieu_id, so_luong_can) VALUES (?, ?, ?)',
        [monan_id, nguyenlieu_id, so_luong_can]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create dish-material link');
      }
      return { monan_id, nguyenlieu_id, so_luong_can };
    } catch (error) {
      throw error;
    }
  }

  static async findByMonanId(monan_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM MonAnNguyenLieu WHERE monan_id = ?',
        [monan_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(monan_id, nguyenlieu_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM MonAnNguyenLieu WHERE monan_id = ? AND nguyenlieu_id = ?',
        [monan_id, nguyenlieu_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Dish-material link not found');
      }
      return { monan_id, nguyenlieu_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MonAnNguyenLieuModel;