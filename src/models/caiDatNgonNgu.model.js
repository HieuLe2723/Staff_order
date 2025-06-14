// src/models/caiDatNgonNgu.model.js
const pool = require('../config/db.config');

class CaiDatNgonNguModel {
  static async create({ ma_ngon_ngu, ten_ngon_ngu }) {
    if (ma_ngon_ngu.length > 10) {
      throw new Error('ma_ngon_ngu không được dài quá 10 ký tự');
    }
    const [result] = await pool.query(
      'INSERT INTO CaiDatNgonNgu (ma_ngon_ngu, ten_ngon_ngu) VALUES (?, ?)',
      [ma_ngon_ngu, ten_ngon_ngu]
    );
    return { ma_ngon_ngu, ten_ngon_ngu };
  }

  static async findById(ma_ngon_ngu) {
    const [rows] = await pool.query(
      'SELECT * FROM CaiDatNgonNgu WHERE ma_ngon_ngu = ?',
      [ma_ngon_ngu]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy ngôn ngữ với ma_ngon_ngu cung cấp');
    }
    return rows[0];
  }

  static async update(ma_ngon_ngu, { ten_ngon_ngu }) {
    if (ma_ngon_ngu.length > 10) {
      throw new Error('ma_ngon_ngu không được dài quá 10 ký tự');
    }
    const [result] = await pool.query(
      'UPDATE CaiDatNgonNgu SET ten_ngon_ngu = ? WHERE ma_ngon_ngu = ?',
      [ten_ngon_ngu, ma_ngon_ngu]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy ngôn ngữ với ma_ngon_ngu cung cấp');
    }
    return await this.findById(ma_ngon_ngu);
  }

  static async delete(ma_ngon_ngu) {
    const [result] = await pool.query(
      'DELETE FROM CaiDatNgonNgu WHERE ma_ngon_ngu = ?',
      [ma_ngon_ngu]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy ngôn ngữ với ma_ngon_ngu cung cấp');
    }
    return { ma_ngon_ngu };
  }
}

module.exports = CaiDatNgonNguModel;