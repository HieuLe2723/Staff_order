// src/models/datBan.model.js
const pool = require('../config/db.config');

class DatBanModel {
  static async create({ khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai = 'ChoXuLy' }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: ChoXuLy, DaXacNhan, DaHuy');
    }
    if (khachhang_id) {
      const [khachHang] = await pool.query('SELECT 1 FROM ThongTinKhachHang WHERE khachhang_id = ?', [khachhang_id]);
      if (!khachHang[0]) throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    }
    const [ban] = await pool.query('SELECT 1 FROM BanNhaHang WHERE ban_id = ?', [ban_id]);
    if (!ban[0]) throw new Error('Không tìm thấy bàn với ban_id cung cấp');

    const [result] = await pool.query(
      'INSERT INTO DatBan (khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai) VALUES (?, ?, ?, ?, ?, ?)',
      [khachhang_id || null, ban_id, so_khach, thoi_gian_dat, ghi_chu || null, trang_thai]
    );
    return { datban_id: result.insertId, khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai, ngay_tao: new Date() };
  }

  static async findById(datban_id) {
    const [rows] = await pool.query(
      'SELECT * FROM DatBan WHERE datban_id = ?',
      [datban_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    return rows[0];
  }

  static async findAll({ khachhang_id, ban_id, trang_thai } = {}) {
    let query = 'SELECT * FROM DatBan';
    const params = [];
    if (khachhang_id || ban_id || trang_thai) {
      query += ' WHERE';
      let conditions = [];
      if (khachhang_id) {
        conditions.push('khachhang_id = ?');
        params.push(khachhang_id);
      }
      if (ban_id) {
        conditions.push('ban_id = ?');
        params.push(ban_id);
      }
      if (trang_thai) {
        conditions.push('trang_thai = ?');
        params.push(trang_thai);
      }
      query += ' ' + conditions.join(' AND ');
    }
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(datban_id, { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: ChoXuLy, DaXacNhan, DaHuy');
    }
    if (khachhang_id) {
      const [khachHang] = await pool.query('SELECT 1 FROM ThongTinKhachHang WHERE khachhang_id = ?', [khachhang_id]);
      if (!khachHang[0]) throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    }
    if (ban_id) {
      const [ban] = await pool.query('SELECT 1 FROM BanNhaHang WHERE ban_id = ?', [ban_id]);
      if (!ban[0]) throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }

    const [result] = await pool.query(
      'UPDATE DatBan SET khachhang_id = ?, ban_id = ?, so_khach = ?, thoi_gian_dat = ?, ghi_chu = ?, trang_thai = ? WHERE datban_id = ?',
      [khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai, datban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    return await this.findById(datban_id);
  }

  static async delete(datban_id) {
    const [result] = await pool.query(
      'DELETE FROM DatBan WHERE datban_id = ?',
      [datban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    return { datban_id };
  }
}

module.exports = DatBanModel;