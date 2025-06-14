// src/models/CaLamViec.model.js
const db = require('../config/db.config');

class CaLamViecModel {
  static async createShift(data) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, mo_ta } = data;
    const query = `
      INSERT INTO CaLamViec (ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, mo_ta)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, mo_ta]);
    return { calamviec_id: result.insertId, ...data };
  }

  static async getShiftById(calamviec_id) {
    const query = `SELECT * FROM CaLamViec WHERE calamviec_id = ?`;
    const [rows] = await db.query(query, [calamviec_id]);
    return rows[0];
  }

  static async getAllShifts() {
    const query = `SELECT * FROM CaLamViec`;
    const [rows] = await db.query(query);
    return rows;
  }

  static async updateShift(calamviec_id, data) {
    const { ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, mo_ta } = data;
    const query = `
      UPDATE CaLamViec 
      SET ten_ca = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ?, mo_ta = ?
      WHERE calamviec_id = ?
    `;
    const [result] = await db.query(query, [ten_ca, thoi_gian_bat_dau, thoi_gian_ket_thuc, mo_ta, calamviec_id]);
    if (result.affectedRows === 0) {
      throw new Error('Ca làm việc không tồn tại hoặc không có thay đổi');
    }
    return { calamviec_id, ...data };
  }

  static async deleteShift(calamviec_id) {
    // Kiểm tra xem ca làm việc có đang được phân trong PhanCaNhanVien hay không
    const checkQuery = `SELECT COUNT(*) as count FROM PhanCaNhanVien WHERE calamviec_id = ?`;
    const [[{ count }]] = await db.query(checkQuery, [calamviec_id]);
    if (count > 0) {
      throw new Error('Không thể xóa ca làm việc vì đã được phân cho nhân viên');
    }

    const query = `DELETE FROM CaLamViec WHERE calamviec_id = ?`;
    const [result] = await db.query(query, [calamviec_id]);
    if (result.affectedRows === 0) {
      throw new Error('Ca làm việc không tồn tại');
    }
    return { message: 'Xóa ca làm việc thành công' };
  }

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
      SELECT pc.*, cl.ten_ca, cl.thoi_gian_bat_dau, cl.thoi_gian_ket_thuc, nv.ho_ten
      FROM PhanCaNhanVien pc
      JOIN CaLamViec cl ON pc.calamviec_id = cl.calamviec_id
      JOIN NhanVien nv ON pc.nhanvien_id = nv.nhanvien_id
      WHERE pc.nhanvien_id = ? AND pc.ngay_lam BETWEEN ? AND ?
    `;
    const [rows] = await db.query(query, [nhanvien_id, startDate, endDate]);
    return rows;
  }
  static async updateShiftAssignment(phanca_id, data) {
  const query = `
    UPDATE PhanCaNhanVien 
    SET nhanvien_id = ?, calamviec_id = ?, ngay_lam = ?, ghi_chu = ?
    WHERE phanca_id = ?
  `;
  const { nhanvien_id, calamviec_id, ngay_lam, ghi_chu } = data;
  const [result] = await db.query(query, [nhanvien_id, calamviec_id, ngay_lam, ghi_chu, phanca_id]);
  if (result.affectedRows === 0) throw new Error('Phân ca không tồn tại');
  return { phanca_id, ...data };
}

static async deleteShiftAssignment(phanca_id) {
  const query = `DELETE FROM PhanCaNhanVien WHERE phanca_id = ?`;
  const [result] = await db.query(query, [phanca_id]);
  if (result.affectedRows === 0) throw new Error('Phân ca không tồn tại');
  return { message: 'Xóa phân ca thành công' };
}

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

module.exports = CaLamViecModel;