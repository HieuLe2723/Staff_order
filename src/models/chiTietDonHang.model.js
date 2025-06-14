// src/models/chiTietDonHang.model.js
const pool = require('../config/db.config');

class ChiTietDonHangModel {
  static async create({ donhang_id, monan_id, so_luong, ghi_chu }) {
    const validStatuses = ['ChoNau', 'DangNau', 'DaPhucVu'];
    const [donHang] = await pool.query('SELECT 1 FROM DonHang WHERE donhang_id = ?', [donhang_id]);
    if (!donHang[0]) throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
    const [monAn] = await pool.query('SELECT 1 FROM MonAn WHERE monan_id = ?', [monan_id]);
    if (!monAn[0]) throw new Error('Không tìm thấy món ăn với monan_id cung cấp');

    const [result] = await pool.query(
      'INSERT INTO ChiTietDonHang (donhang_id, monan_id, so_luong, ghi_chu, trang_thai_phuc_vu) VALUES (?, ?, ?, ?, ?)',
      [donhang_id, monan_id, so_luong, ghi_chu, 'ChoNau']
    );
    return { chitiet_id: result.insertId, donhang_id, monan_id, so_luong, ghi_chu, trang_thai_phuc_vu: 'ChoNau', thoi_gian_phuc_vu: null };
  }

  static async findById(chitiet_id) {
    const [rows] = await pool.query(
      'SELECT * FROM ChiTietDonHang WHERE chitiet_id = ?',
      [chitiet_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy chi tiết đơn hàng với chitiet_id cung cấp');
    }
    return rows[0];
  }

  static async update(chitiet_id, { donhang_id, monan_id, so_luong, ghi_chu, thoi_gian_phuc_vu, trang_thai_phuc_vu }) {
    const validStatuses = ['ChoNau', 'DangNau', 'DaPhucVu'];
    if (trang_thai_phuc_vu && !validStatuses.includes(trang_thai_phuc_vu)) {
      throw new Error('Giá trị trang_thai_phuc_vu không hợp lệ. Chỉ chấp nhận: ChoNau, DangNau, DaPhucVu');
    }
    if (donhang_id) {
      const [donHang] = await pool.query('SELECT 1 FROM DonHang WHERE donhang_id = ?', [donhang_id]);
      if (!donHang[0]) throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
    }
    if (monan_id) {
      const [monAn] = await pool.query('SELECT 1 FROM MonAn WHERE monan_id = ?', [monan_id]);
      if (!monAn[0]) throw new Error('Không tìm thấy món ăn với monan_id cung cấp');
    }

    const [result] = await pool.query(
      'UPDATE ChiTietDonHang SET donhang_id = ?, monan_id = ?, so_luong = ?, ghi_chu = ?, thoi_gian_phuc_vu = ?, trang_thai_phuc_vu = ? WHERE chitiet_id = ?',
      [donhang_id, monan_id, so_luong, ghi_chu, thoi_gian_phuc_vu, trang_thai_phuc_vu, chitiet_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy chi tiết đơn hàng với chitiet_id cung cấp');
    }
    return await this.findById(chitiet_id);
  }

  static async delete(chitiet_id) {
    const [result] = await pool.query(
      'DELETE FROM ChiTietDonHang WHERE chitiet_id = ?',
      [chitiet_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy chi tiết đơn hàng với chitiet_id cung cấp');
    }
    return { chitiet_id };
  }
}

module.exports = ChiTietDonHangModel;