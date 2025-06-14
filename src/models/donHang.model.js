// src/models/donHang.model.js
const pool = require('../config/db.config');

class DonHangModel {
  static async create({ phien_id, khuyenmai_id, loai_menu, hanh_dong, mo_ta_hanh_dong }) {
    try {
      const validStatuses = ['ChoXuLy', 'DangNau', 'DaPhucVu', 'DaThanhToan', 'DaHuy'];
      const validActions = ['ThemMon', 'XoaMon', 'HuyMon', 'HoanTat', null];
      const [phien] = await pool.query('SELECT 1 FROM PhienSuDungBan WHERE phien_id = ?', [phien_id]);
      if (!phien[0]) throw new Error('Không tìm thấy phiên sử dụng bàn với phien_id cung cấp');
      if (khuyenmai_id) {
        const [khuyenMai] = await pool.query('SELECT 1 FROM KhuyenMai WHERE khuyenmai_id = ?', [khuyenmai_id]);
        if (!khuyenMai[0]) throw new Error('Không tìm thấy khuyến mãi với khuyenmai_id cung cấp');
      }
      if (hanh_dong && !validActions.includes(hanh_dong)) {
        throw new Error('Giá trị hanh_dong không hợp lệ. Chỉ chấp nhận: ThemMon, XoaMon, HuyMon, HoanTat');
      }

      const [result] = await pool.query(
        'INSERT INTO DonHang (phien_id, loai_menu, khuyenmai_id, hanh_dong, mo_ta_hanh_dong) VALUES (?, ?, ?, ?, ?)',
        [phien_id, loai_menu || null, khuyenmai_id || null, hanh_dong || null, mo_ta_hanh_dong || null]
      );
      return { donhang_id: result.insertId, phien_id, loai_menu, khuyenmai_id, gia_tri_giam: 0, tong_tien: 0, trang_thai: 'ChoXuLy', ngay_tao: new Date(), hanh_dong, mo_ta_hanh_dong };
    } catch (error) {
      throw error;
    }
  }

  static async findById(donhang_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM DonHang WHERE donhang_id = ?',
        [donhang_id]
      );
      if (!rows[0]) {
        throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(donhang_id, { phien_id, loai_menu, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong }) {
    try {
      const validStatuses = ['ChoXuLy', 'DangNau', 'DaPhucVu', 'DaThanhToan', 'DaHuy'];
      const validActions = ['ThemMon', 'XoaMon', 'HuyMon', 'HoanTat', null];
      if (trang_thai && !validStatuses.includes(trang_thai)) {
        throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: ChoXuLy, DangNau, DaPhucVu, DaThanhToan, DaHuy');
      }
      if (hanh_dong && !validActions.includes(hanh_dong)) {
        throw new Error('Giá trị hanh_dong không hợp lệ. Chỉ chấp nhận: ThemMon, XoaMon, HuyMon, HoanTat');
      }
      if (phien_id) {
        const [phien] = await pool.query('SELECT 1 FROM PhienSuDungBan WHERE phien_id = ?', [phien_id]);
        if (!phien[0]) throw new Error('Không tìm thấy phiên sử dụng bàn với phien_id cung cấp');
      }
      if (khuyenmai_id) {
        const [khuyenMai] = await pool.query('SELECT 1 FROM KhuyenMai WHERE khuyenmai_id = ?', [khuyenmai_id]);
        if (!khuyenMai[0]) throw new Error('Không tìm thấy khuyến mãi với khuyenmai_id cung cấp');
      }

      const [result] = await pool.query(
        'UPDATE DonHang SET phien_id = ?, loai_menu = ?, khuyenmai_id = ?, gia_tri_giam = ?, tong_tien = ?, trang_thai = ?, hanh_dong = ?, mo_ta_hanh_dong = ?, thoi_gian_hanh_dong = ? WHERE donhang_id = ?',
        [phien_id, loai_menu, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong, hanh_dong ? new Date() : null, donhang_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
      }
      return await this.findById(donhang_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(donhang_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM DonHang WHERE donhang_id = ?',
        [donhang_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
      }
      return { donhang_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DonHangModel;