// src/models/lichSuBaoTri.model.js
const pool = require('../config/db.config');

class LichSuBaoTriModel {
  static async create({ thietbi_id, mo_ta, ngay_bao_tri, trang_thai }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO LichSuBaoTri (thietbi_id, mo_ta, ngay_bao_tri, trang_thai) VALUES (?, ?, ?, ?)',
        [thietbi_id, mo_ta, ngay_bao_tri, trang_thai]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create maintenance record');
      }
      return { lichsu_id: result.insertId, thietbi_id, mo_ta, ngay_bao_tri, trang_thai };
    } catch (error) {
      throw error;
    }
  }

  static async findById(lichsu_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM LichSuBaoTri WHERE lichsu_id = ?',
        [lichsu_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(lichsu_id, { thietbi_id, mo_ta, ngay_bao_tri, trang_thai }) {
    try {
      const [result] = await pool.query(
        'UPDATE LichSuBaoTri SET thietbi_id = ?, mo_ta = ?, ngay_bao_tri = ?, trang_thai = ? WHERE lichsu_id = ?',
        [thietbi_id, mo_ta, ngay_bao_tri, trang_thai, lichsu_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Maintenance record not found');
      }
      return await this.findById(lichsu_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(lichsu_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM LichSuBaoTri WHERE lichsu_id = ?',
        [lichsu_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Maintenance record not found');
      }
      return { lichsu_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LichSuBaoTriModel;