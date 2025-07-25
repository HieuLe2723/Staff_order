// src/models/banNhaHang.model.js
const pool = require('../config/db.config');

class BanNhaHangModel {
  static async create({ ten_ban, khuvuc_id, trang_thai = 'SanSang', qr_code_url }) {
    const validStatuses = ['SanSang', 'DangSuDung', 'DaDat'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: SanSang, DangSuDung, DaDat');
    }
    const [result] = await pool.query( // Sử dụng pool.query trực tiếp
      'INSERT INTO BanNhaHang (ten_ban, khuvuc_id, trang_thai, qr_code_url) VALUES (?, ?, ?, ?)',
      [ten_ban, khuvuc_id, trang_thai, qr_code_url]
    );
    return { ban_id: result.insertId, ten_ban, khuvuc_id, trang_thai, qr_code_url };
  }

  static async findById(ban_id) {
    const [rows] = await pool.query(
      'SELECT * FROM BanNhaHang WHERE ban_id = ?',
      [ban_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }
    return rows[0];
  }

  static async findAll({ khuvuc_id, trang_thai } = {}) {
    let query = 'SELECT * FROM BanNhaHang';
    const params = [];
    if (khuvuc_id || trang_thai) {
      query += ' WHERE';
      if (khuvuc_id) {
        query += ' khuvuc_id = ?';
        params.push(khuvuc_id);
      }
      if (trang_thai) {
        query += khuvuc_id ? ' AND trang_thai = ?' : ' trang_thai = ?';
        params.push(trang_thai);
      }
    }
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(ban_id, { ten_ban, khuvuc_id, trang_thai, qr_code_url }) {
    const validStatuses = ['SanSang', 'DangSuDung', 'DaDat'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: SanSang, DangSuDung, DaDat');
    }
    const [result] = await pool.query(
      'UPDATE BanNhaHang SET ten_ban = ?, khuvuc_id = ?, trang_thai = ?, qr_code_url = ? WHERE ban_id = ?',
      [ten_ban, khuvuc_id, trang_thai, qr_code_url, ban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }
    return await this.findById(ban_id);
  }

  static async delete(ban_id) {
    const [result] = await pool.query(
      'DELETE FROM BanNhaHang WHERE ban_id = ?',
      [ban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }
    return { ban_id };
  }
}

module.exports = BanNhaHangModel;