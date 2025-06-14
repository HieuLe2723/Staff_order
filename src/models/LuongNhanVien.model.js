// src/models/LuongNhanVien.model.js
const db = require('../config/db.config');

class LuongNhanVienModel {
  static async getSalaryByEmployee(nhanvien_id, thang, nam) {
    const query = `
      SELECT * FROM LuongNhanVien
      WHERE nhanvien_id = ? AND thang = ? AND nam = ?
    `;
    const [rows] = await db.query(query, [nhanvien_id, thang, nam]);
    return rows;
  }

  static async markSalaryPaid(luong_id) {
    const query = `
      UPDATE LuongNhanVien 
      SET trang_thai = 'DaThanhToan'
      WHERE luong_id = ?
    `;
    await db.query(query, [luong_id]);
    return { luong_id, trang_thai: 'DaThanhToan' };
  }
}

module.exports = LuongNhanVienModel;