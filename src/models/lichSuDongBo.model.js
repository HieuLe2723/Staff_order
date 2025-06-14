// src/models/lichSuDongBo.model.js
const pool = require('../config/db.config');

class LichSuDongBoModel {
  static async create({ loai_du_lieu, trang_thai, mo_ta }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO LichSuDongBo (loai_du_lieu, trang_thai, mo_ta) VALUES (?, ?, ?)',
        [loai_du_lieu, trang_thai, mo_ta]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create sync record');
      }
      return { dongbo_id: result.insertId, loai_du_lieu, trang_thai, mo_ta };
    } catch (error) {
      throw error;
    }
  }

  static async findById(dongbo_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM LichSuDongBo WHERE dongbo_id = ?',
        [dongbo_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(dongbo_id, { loai_du_lieu, trang_thai, mo_ta }) {
    try {
      const [result] = await pool.query(
        'UPDATE LichSuDongBo SET loai_du_lieu = ?, trang_thai = ?, mo_ta = ? WHERE dongbo_id = ?',
        [loai_du_lieu, trang_thai, mo_ta, dongbo_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Sync record not found');
      }
      return await this.findById(dongbo_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(dongbo_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM LichSuDongBo WHERE dongbo_id = ?',
        [dongbo_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Sync record not found');
      }
      return { dongbo_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LichSuDongBoModel;