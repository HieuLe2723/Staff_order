// src/models/baoCaoChiTietMonAn.model.js
const pool = require('../config/db.config');

class BaoCaoChiTietMonAnModel {
  static async create({ baocao_id, monan_id, so_luong, tong_doanh_thu_mon }) {
    const [baoCao] = await pool.query('SELECT 1 FROM BaoCaoDoanhThu WHERE baocao_id = ?', [baocao_id]);
    if (!baoCao[0]) throw new Error('Không tìm thấy báo cáo với baocao_id cung cấp');
    const [monAn] = await pool.query('SELECT 1 FROM MonAn WHERE monan_id = ?', [monan_id]);
    if (!monAn[0]) throw new Error('Không tìm thấy món ăn với monan_id cung cấp');

    const [result] = await pool.query(
      'INSERT INTO BaoCaoChiTietMonAn (baocao_id, monan_id, so_luong, tong_doanh_thu_mon) VALUES (?, ?, ?, ?)',
      [baocao_id, monan_id, so_luong, tong_doanh_thu_mon]
    );
    return { baocao_monan_id: result.insertId, baocao_id, monan_id, so_luong, tong_doanh_thu_mon };
  }

  static async findById(baocao_monan_id) {
    const [rows] = await pool.query(
      'SELECT * FROM BaoCaoChiTietMonAn WHERE baocao_monan_id = ?',
      [baocao_monan_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy chi tiết báo cáo với baocao_monan_id cung cấp');
    }
    return rows[0];
  }

  static async update(baocao_monan_id, { baocao_id, monan_id, so_luong, tong_doanh_thu_mon }) {
    const [baoCao] = await pool.query('SELECT 1 FROM BaoCaoDoanhThu WHERE baocao_id = ?', [baocao_id]);
    if (!baoCao[0]) throw new Error('Không tìm thấy báo cáo với baocao_id cung cấp');
    const [monAn] = await pool.query('SELECT 1 FROM MonAn WHERE monan_id = ?', [monan_id]);
    if (!monAn[0]) throw new Error('Không tìm thấy món ăn với monan_id cung cấp');

    const [result] = await pool.query(
      'UPDATE BaoCaoChiTietMonAn SET baocao_id = ?, monan_id = ?, so_luong = ?, tong_doanh_thu_mon = ? WHERE baocao_monan_id = ?',
      [baocao_id, monan_id, so_luong, tong_doanh_thu_mon, baocao_monan_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy chi tiết báo cáo với baocao_monan_id cung cấp');
    }
    return await this.findById(baocao_monan_id);
  }

  static async delete(baocao_monan_id) {
    const [result] = await pool.query(
      'DELETE FROM BaoCaoChiTietMonAn WHERE baocao_monan_id = ?',
      [baocao_monan_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy chi tiết báo cáo với baocao_monan_id cung cấp');
    }
    return { baocao_monan_id };
  }
}

module.exports = BaoCaoChiTietMonAnModel;