// src/models/lichSuDonHang.model.js
const pool = require('../config/db.config');

/**
 * Model: LichSuDonHang
 * Lưu vết tất cả hành động trên một đơn hàng (tạo, cập nhật, thêm món, huỷ, v.v.)
 * Columns (tham chiếu trong DB):
 *  - lichsu_id (PK)
 *  - donhang_id (FK -> DonHang)
 *  - hanh_dong (varchar)
 *  - mo_ta (text)
 *  - nhanvien_id (FK -> NhanVien)
 *  - thoi_gian (datetime)
 */
class LichSuDonHangModel {
  /**
   * Thêm một bản ghi lịch sử
   * @param {Object} param0
   */
  static async create({ donhang_id, hanh_dong, mo_ta, nhanvien_id }) {
    const [result] = await pool.query(
      'INSERT INTO LichSuDonHang (donhang_id, hanh_dong, mo_ta, nhanvien_id) VALUES (?, ?, ?, ?)',
      [donhang_id, hanh_dong, mo_ta, nhanvien_id]
    );
    return {
      lichsu_id: result.insertId,
      donhang_id,
      hanh_dong,
      mo_ta,
      nhanvien_id,
      thoi_gian: new Date()
    };
  }

  /**
   * Lấy toàn bộ lịch sử theo đơn hàng
   */
  static async findByDonHangId(donhang_id) {
    const [rows] = await pool.query(
      'SELECT * FROM LichSuDonHang WHERE donhang_id = ? ORDER BY thoi_gian DESC',
      [donhang_id]
    );
    return rows;
  }

  /**
   * Xoá lịch sử của một đơn hàng (dùng khi cần xoá đơn)
   */
  static async deleteByDonHangId(donhang_id) {
    await pool.query('DELETE FROM LichSuDonHang WHERE donhang_id = ?', [donhang_id]);
  }
}

module.exports = LichSuDonHangModel;
