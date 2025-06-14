// src/models/monAn.model.js
const pool = require('../config/db.config');

class MonAnModel {
  static async create({ ten_mon, loai_id, gia, hinh_anh }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO MonAn (ten_mon, loai_id, gia, hinh_anh) VALUES (?, ?, ?, ?)',
        [ten_mon, loai_id, gia, hinh_anh]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create dish');
      }
      return { monan_id: result.insertId, ten_mon, loai_id, gia, khoa: 0, hinh_anh, ngay_khoa: null };
    } catch (error) {
      throw error;
    }
  }

  static async findById(monan_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM MonAn WHERE monan_id = ?',
        [monan_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(monan_id, { ten_mon, loai_id, gia, khoa, hinh_anh, ngay_khoa }) {
    try {
      const [result] = await pool.query(
        'UPDATE MonAn SET ten_mon = ?, loai_id = ?, gia = ?, khoa = ?, hinh_anh = ?, ngay_khoa = ? WHERE monan_id = ?',
        [ten_mon, loai_id, gia, khoa, hinh_anh, ngay_khoa, monan_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Dish not found');
      }
      return await this.findById(monan_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(monan_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM MonAn WHERE monan_id = ?',
        [monan_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Dish not found');
      }
      return { monan_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MonAnModel;