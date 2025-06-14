// src/models/nguyenLieu.model.js
const pool = require('../config/db.config');

class NguyenLieuModel {
  static async create({ ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO NguyenLieu (ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao) VALUES (?, ?, ?, ?)',
        [ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create raw material');
      }
      return { nguyenlieu_id: result.insertId, ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao, trang_thai_canh_bao: 0 };
    } catch (error) {
      throw error;
    }
  }

  static async findById(nguyenlieu_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM NguyenLieu WHERE nguyenlieu_id = ?',
        [nguyenlieu_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(nguyenlieu_id, { ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao }) {
    try {
      const [result] = await pool.query(
        'UPDATE NguyenLieu SET ten_nguyenlieu = ?, don_vi = ?, so_luong_con_lai = ?, nguong_canh_bao = ? WHERE nguyenlieu_id = ?',
        [ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao, nguyenlieu_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Raw material not found');
      }
      return await this.findById(nguyenlieu_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(nguyenlieu_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM NguyenLieu WHERE nguyenlieu_id = ?',
        [nguyenlieu_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Raw material not found');
      }
      return { nguyenlieu_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NguyenLieuModel;