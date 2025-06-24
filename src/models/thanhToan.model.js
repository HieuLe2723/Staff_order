// src/models/thanhToan.model.js
const pool = require('../config/db.config');

class ThanhToanModel {
  static async create({ phien_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai = 'ChoXuLy', la_giao_dich_demo = 0 }) {
    const [result] = await pool.query(
      'INSERT INTO ThanhToan (phien_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai, la_giao_dich_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [phien_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai, la_giao_dich_demo]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create payment');
    }
    return { thanhtoan_id: result.insertId, phien_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai, la_giao_dich_demo };
  }

  static async findById(thanhtoan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ThanhToan WHERE thanhtoan_id = ?',
      [thanhtoan_id]
    );
    return rows[0] || null;
  }

  static async findByTxnRef(ma_giao_dich) {
    const [rows] = await pool.query(
      'SELECT * FROM ThanhToan WHERE ma_giao_dich = ?',
      [ma_giao_dich]
    );
    return rows[0] || null;
  }

    static async update(thanhtoan_id, dataToUpdate) {
    const fields = Object.keys(dataToUpdate);
    const values = Object.values(dataToUpdate);

    if (fields.length === 0) {
      return this.findById(thanhtoan_id); // Không có gì để cập nhật
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const [result] = await pool.query(
      `UPDATE ThanhToan SET ${setClause} WHERE thanhtoan_id = ?`,
      [...values, thanhtoan_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Payment not found or no changes were made');
    }
    return await this.findById(thanhtoan_id);
  }

  static async updateStatus(thanhtoan_id, trang_thai) {
    const [result] = await pool.query(
      'UPDATE ThanhToan SET trang_thai = ? WHERE thanhtoan_id = ?',
      [trang_thai, thanhtoan_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Payment not found');
    }
    return await this.findById(thanhtoan_id);
  }

  static async delete(thanhtoan_id) {
    const [result] = await pool.query(
      'DELETE FROM ThanhToan WHERE thanhtoan_id = ?',
      [thanhtoan_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Payment not found');
    }
    return { thanhtoan_id };
  }
}

module.exports = ThanhToanModel;