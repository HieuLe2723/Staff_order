// src/models/khachHangThanThiet.model.js
const pool = require('../config/db.config');

class KhachHangThanThietModel {
  static async create({ khachhang_id, diem_so, cap_bac }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO KhachHangThanThiet (khachhang_id, diem_so, cap_bac) VALUES (?, ?, ?)',
        [khachhang_id, diem_so, cap_bac]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create loyal customer');
      }
      return { thanthiet_id: result.insertId, khachhang_id, diem_so, cap_bac };
    } catch (error) {
      throw error;
    }
  }

  static async findByKhachhangId(khachhang_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM KhachHangThanThiet WHERE khachhang_id = ?',
        [khachhang_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(thanthiet_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM KhachHangThanThiet WHERE thanthiet_id = ?',
        [thanthiet_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(thanthiet_id, { khachhang_id, diem_so, cap_bac }) {
    try {
      const [result] = await pool.query(
        'UPDATE KhachHangThanThiet SET khachhang_id = ?, diem_so = ?, cap_bac = ?, ngay_cap_nhat = NOW() WHERE thanthiet_id = ?',
        [khachhang_id, diem_so, cap_bac, thanthiet_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Loyal customer not found');
      }
      return await this.findById(thanthiet_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(thanthiet_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM KhachHangThanThiet WHERE thanthiet_id = ?',
        [thanthiet_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Loyal customer not found');
      }
      return { thanthiet_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = KhachHangThanThietModel;