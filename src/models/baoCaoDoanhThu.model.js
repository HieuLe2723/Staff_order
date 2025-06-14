// src/models/baoCaoDoanhThu.model.js
const pool = require('../config/db.config');

class BaoCaoDoanhThuModel {
  static async create({ ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang }) {
    const validTypes = ['Ngay', 'Tuan', 'Thang', 'Quy', 'Nam'];
    if (!validTypes.includes(loai_bao_cao)) {
      throw new Error('Giá trị loai_bao_cao không hợp lệ. Chỉ chấp nhận: Ngay, Tuan, Thang, Quy, Nam');
    }
    if ((loai_bao_cao === 'Ngay' && !ngay_bao_cao) || (loai_bao_cao === 'Thang' && !thang) || (loai_bao_cao === 'Quy' && !quy) || (loai_bao_cao === 'Nam' && !nam)) {
      throw new Error('Thiếu thông tin bắt buộc cho loại báo cáo');
    }
    const [result] = await pool.query(
      'INSERT INTO BaoCaoDoanhThu (ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ngay_bao_cao || null, loai_bao_cao, thang || null, quy || null, nam || null, tong_doanh_thu, tong_don_hang]
    );
    return { baocao_id: result.insertId, ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang, ngay_tao: new Date() };
  }

  static async findById(baocao_id) {
    const [rows] = await pool.query(
      'SELECT * FROM BaoCaoDoanhThu WHERE baocao_id = ?',
      [baocao_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy báo cáo với baocao_id cung cấp');
    }
    return rows[0];
  }

  static async findAll({ loai_bao_cao, thang, quy, nam, ngay_bao_cao } = {}) {
    let query = 'SELECT * FROM BaoCaoDoanhThu';
    const params = [];
    if (loai_bao_cao || thang || quy || nam || ngay_bao_cao) {
      query += ' WHERE';
      let conditions = [];
      if (loai_bao_cao) {
        conditions.push('loai_bao_cao = ?');
        params.push(loai_bao_cao);
      }
      if (ngay_bao_cao) {
        conditions.push('ngay_bao_cao = ?');
        params.push(ngay_bao_cao);
      }
      if (thang) {
        conditions.push('thang = ?');
        params.push(thang);
      }
      if (quy) {
        conditions.push('quy = ?');
        params.push(quy);
      }
      if (nam) {
        conditions.push('nam = ?');
        params.push(nam);
      }
      query += ' ' + conditions.join(' AND ');
    }
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async delete(baocao_id) {
    const [result] = await pool.query(
      'DELETE FROM BaoCaoDoanhThu WHERE baocao_id = ?',
      [baocao_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy báo cáo với baocao_id cung cấp');
    }
    return { baocao_id };
  }
  static async getRecentRevenue(days = 7) {
  const [rows] = await pool.query(
    `
    SELECT ngay_bao_cao, tong_doanh_thu
    FROM BaoCaoDoanhThu
    WHERE loai_bao_cao = 'Ngay' AND ngay_bao_cao >= CURDATE() - INTERVAL ? DAY
    ORDER BY ngay_bao_cao ASC
    `,
    [days]
  );
  return rows;
}
}

module.exports = BaoCaoDoanhThuModel;