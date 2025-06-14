// src/models/loaiMonAn.model.js
const pool = require('../config/db.config');

class LoaiMonAnModel {
  static async create({ ten_loai }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO LoaiMonAn (ten_loai) VALUES (?)',
        [ten_loai]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create dish category');
      }
      return { loai_id: result.insertId, ten_loai };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM LoaiMonAn');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(loai_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM LoaiMonAn WHERE loai_id = ?',
        [loai_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async delete(loai_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM LoaiMonAn WHERE loai_id = ?',
        [loai_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Dish category not found');
      }
      return { loai_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoaiMonAnModel;