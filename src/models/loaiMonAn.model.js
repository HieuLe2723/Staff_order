// src/models/loaiMonAn.model.js
const pool = require('../config/db.config');

class LoaiMonAnModel {
  static async findByMenu(loai_menu) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM LoaiMonAn WHERE loai_menu = ?',
        [loai_menu]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
  static async create({ ten_loai, loai_menu }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO LoaiMonAn (ten_loai, loai_menu) VALUES (?, ?)',
        [ten_loai, loai_menu]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create dish category');
      }
      return { loai_id: result.insertId, ten_loai, loai_menu };
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM LoaiMonAn'); // đã bao gồm trường loai_menu
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
      ); // đã bao gồm trường loai_menu
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

  static async findUniqueMenuTypes() {
    try {
      const [rows] = await pool.query('SELECT DISTINCT loai_menu FROM LoaiMonAn WHERE loai_menu IS NOT NULL AND loai_menu != ""');
      return rows.map(row => row.loai_menu);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoaiMonAnModel;