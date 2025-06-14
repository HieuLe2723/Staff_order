// src/models/thanhToan.model.js
const pool = require('../config/db.config');

class ThanhToanModel {
  static async create({ donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai = 'ChoXuLy' }) {
    const [result] = await pool.query(
      'INSERT INTO ThanhToan (donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create payment');
    }
    return { thanhtoan_id: result.insertId, donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai };
  }

  static async findById(thanhtoan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ThanhToan WHERE thanhtoan_id = ?',
      [thanhtoan_id]
    );
    return rows[0] || null;
  }

  static async update(thanhtoan_id, { donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai }) {
    const [result] = await pool.query(
      'UPDATE ThanhToan SET donhang_id = ?, so_tien = ?, khuyenmai_id = ?, phuong_thuc = ?, ma_giao_dich = ?, ma_phan_hoi = ?, trang_thai = ?, ngay_cap_nhat = NOW() WHERE thanhtoan_id = ?',
      [donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai, thanhtoan_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Payment not found');
    }
    return await this.findById(thanhtoan_id);
  }

  static async updateStatus(thanhtoan_id, trang_thai) {
    const [result] = await pool.query(
      'UPDATE ThanhToan SET trang_thai = ?, ngay_cap_nhat = NOW() WHERE thanhtoan_id = ?',
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