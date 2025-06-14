// src/models/khuyenMai.model.js
const pool = require('../config/db.config');

class KhuyenMaiModel {
  static async create({ ma_code, mo_ta, phan_tram_giam, ngay_het_han }) {
    try {
      if (phan_tram_giam < 0 || phan_tram_giam > 100) {
        throw new Error('phan_tram_giam must be between 0 and 100');
      }
      const [result] = await pool.query(
        'INSERT INTO KhuyenMai (ma_code, mo_ta, phan_tram_giam, ngay_het_han) VALUES (?, ?, ?, ?)',
        [ma_code, mo_ta, phan_tram_giam, ngay_het_han]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create promotion');
      }
      return { khuyenmai_id: result.insertId, ma_code, mo_ta, phan_tram_giam, ngay_het_han };
    } catch (error) {
      throw error;
    }
  }

  static async findByCode(ma_code) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM KhuyenMai WHERE ma_code = ? AND ngay_het_han >= CURDATE()',
        [ma_code]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ activeOnly = false } = {}) {
    try {
      const query = activeOnly
        ? 'SELECT * FROM KhuyenMai WHERE ngay_het_han >= CURDATE()'
        : 'SELECT * FROM KhuyenMai';
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(khuyenmai_id, { ma_code, mo_ta, phan_tram_giam, ngay_het_han }) {
    try {
      if (phan_tram_giam && (phan_tram_giam < 0 || phan_tram_giam > 100)) {
        throw new Error('phan_tram_giam must be between 0 and 100');
      }
      const [result] = await pool.query(
        'UPDATE KhuyenMai SET ma_code = ?, mo_ta = ?, phan_tram_giam = ?, ngay_het_han = ? WHERE khuyenmai_id = ?',
        [ma_code, mo_ta, phan_tram_giam, ngay_het_han, khuyenmai_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Promotion not found');
      }
      return { khuyenmai_id, ma_code, mo_ta, phan_tram_giam, ngay_het_han };
    } catch (error) {
      throw error;
    }
  }

  static async delete(khuyenmai_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM KhuyenMai WHERE khuyenmai_id = ?',
        [khuyenmai_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Promotion not found');
      }
      return { khuyenmai_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = KhuyenMaiModel;