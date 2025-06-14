// src/models/PhanCaNhanVien.model.js
const db = require('../config/db.config');

class PhanCaNhanVienModel {
  static async assignShift(data) {
    const { nhanvien_id, calamviec_id, ngay_lam, ghi_chu } = data;
    const query = `
      INSERT INTO PhanCaNhanVien (nhanvien_id, calamviec_id, ngay_lam, ghi_chu)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [nhanvien_id, calamviec_id, ngay_lam, ghi_chu]);
    return { phanca_id: result.insertId, ...data };
  }

  static async checkIn(phanca_id, thoi_gian_check_in) {
    const query = `
      UPDATE PhanCaNhanVien 
      SET thoi_gian_check_in = ?, trang_thai = 'DaCheckIn'
      WHERE phanca_id = ?
    `;
    await db.query(query, [thoi_gian_check_in, phanca_id]);
    return { phanca_id, thoi_gian_check_in, trang_thai: 'DaCheckIn' };
  }

  static async checkOut(phanca_id, thoi_gian_check_out) {
    const query = `
      UPDATE PhanCaNhanVien 
      SET thoi_gian_check_out = ?, trang_thai = 'DaCheckOut'
      WHERE phanca_id = ?
    `;
    await db.query(query, [thoi_gian_check_out, phanca_id]);
    return { phanca_id, thoi_gian_check_out, trang_thai: 'DaCheckOut' };
  }

  static async getEmployeeShifts(nhanvien_id, startDate, endDate) {
    const query = `
      SELECT pc.*, cl.ten_ca, cl.thoi_gian_bat_dau, cl.thoi_gian_ket_thuc
      FROM PhanCaNhanVien pc
      JOIN CaLamViec cl ON pc.calamviec_id = cl.calamviec_id
      WHERE pc.nhanvien_id = ? AND pc.ngay_lam BETWEEN ? AND ?
    `;
    const [rows] = await db.query(query, [nhanvien_id, startDate, endDate]);
    return rows;
  }
}

module.exports = PhanCaNhanVienModel;