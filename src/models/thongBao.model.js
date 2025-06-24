// src/models/thongBao.model.js
const pool = require('../config/db.config');

class ThongBaoModel {
  /**
   * Tạo một thông báo mới
   */
  static async create({ nhanvien_id = null, tieu_de, noi_dung }) {
    const [result] = await pool.query(
      'INSERT INTO ThongBao (nhanvien_id, tieu_de, noi_dung) VALUES (?, ?, ?)',
      [nhanvien_id, tieu_de, noi_dung]
    );
    if (result.affectedRows === 0) {
      throw new Error('Tạo thông báo thất bại');
    }
    return { 
      thongbao_id: result.insertId, 
      nhanvien_id, 
      tieu_de, 
      noi_dung, 
      trang_thai: 'ChuaDoc' 
    };
  }

  /**
   * Tìm thông báo bằng ID
   */
  static async findById(thongbao_id) {
    const [rows] = await pool.query('SELECT * FROM ThongBao WHERE thongbao_id = ?', [thongbao_id]);
    return rows[0] || null;
  }

  /**
   * Lấy tất cả thông báo của một nhân viên
   */
  static async findByNhanVienId(nhanvien_id) {
    const [rows] = await pool.query('SELECT * FROM ThongBao WHERE nhanvien_id = ? ORDER BY thoi_gian_tao DESC', [nhanvien_id]);
    return rows;
  }
  
  /**
   * Lấy tất cả thông báo (cho quản lý)
   */
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM ThongBao ORDER BY thoi_gian_tao DESC');
    return rows;
  }

  /**
   * Cập nhật trạng thái thông báo (ví dụ: từ 'ChuaDoc' sang 'DaDoc')
   */
  static async updateStatus(thongbao_id, trang_thai) {
    const validStatuses = ['ChuaDoc', 'DaDoc'];
    if (!validStatuses.includes(trang_thai)) {
      throw new Error('Trạng thái không hợp lệ.');
    }
    const [result] = await pool.query(
      'UPDATE ThongBao SET trang_thai = ? WHERE thongbao_id = ?',
      [trang_thai, thongbao_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy thông báo để cập nhật');
    }
    return await this.findById(thongbao_id);
  }

  /**
   * Xóa một thông báo
   */
  static async delete(thongbao_id) {
    const [result] = await pool.query('DELETE FROM ThongBao WHERE thongbao_id = ?', [thongbao_id]);
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy thông báo để xóa');
    }
    return { success: true, message: 'Thông báo đã được xóa' };
  }
}

module.exports = ThongBaoModel;
