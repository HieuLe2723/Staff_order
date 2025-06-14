// src/services/CaLamViec.service.js
const CaLamViecModel = require('../models/CaLamViec.model');
const NhanVienModel = require('../models/nhanVien.model');
const DateUtils = require('../utils/date');

class CaLamViecService {
  static async createShift(data) {
    return await CaLamViecModel.createShift(data);
  }

  static async getShiftById(calamviec_id) {
    const shift = await CaLamViecModel.getShiftById(calamviec_id);
    if (!shift) throw new Error('Ca làm việc không tồn tại');
    return shift;
  }

  static async getAllShifts() {
    return await CaLamViecModel.getAllShifts();
  }

  static async updateShift(calamviec_id, data) {
    const shift = await CaLamViecModel.getShiftById(calamviec_id);
    if (!shift) throw new Error('Ca làm việc không tồn tại');
    return await CaLamViecModel.updateShift(calamviec_id, data);
  }

  static async deleteShift(calamviec_id) {
    const shift = await CaLamViecModel.getShiftById(calamviec_id);
    if (!shift) throw new Error('Ca làm việc không tồn tại');
    return await CaLamViecModel.deleteShift(calamviec_id);
  }

  static async assignShift(data) {
    const { nhanvien_id, calamviec_id, ngay_lam } = data;
    const employee = await NhanVienModel.findById(nhanvien_id);
    if (!employee) throw new Error('Nhân viên không tồn tại');
    const shift = await CaLamViecModel.getShiftById(calamviec_id);
    if (!shift) throw new Error('Ca làm việc không tồn tại');
    if (!DateUtils.isDateInFuture(ngay_lam)) throw new Error('Ngày làm phải là ngày tương lai');
    return await CaLamViecModel.assignShift(data);
  }

  static async checkIn(phanca_id) {
    const shiftAssignment = await CaLamViecModel.getShiftById(phanca_id);
    if (!shiftAssignment) throw new Error('Phân ca không tồn tại');
    if (shiftAssignment.trang_thai !== 'ChuaCheckIn') throw new Error('Đã check-in hoặc trạng thái không hợp lệ');
    const thoi_gian_check_in = DateUtils.getCurrentDateTime();
    return await CaLamViecModel.checkIn(phanca_id, thoi_gian_check_in);
  }

  static async checkOut(phanca_id) {
    const shiftAssignment = await CaLamViecModel.getShiftById(phanca_id);
    if (!shiftAssignment) throw new Error('Phân ca không tồn tại');
    if (shiftAssignment.trang_thai !== 'DaCheckIn') throw new Error('Chưa check-in hoặc trạng thái không hợp lệ');
    const thoi_gian_check_out = DateUtils.getCurrentDateTime();
    return await CaLamViecModel.checkOut(phanca_id, thoi_gian_check_out);
  }

  static async getEmployeeShifts(nhanvien_id, startDate, endDate) {
    const employee = await NhanVienModel.findById(nhanvien_id);
    if (!employee) throw new Error('Nhân viên không tồn tại');
    return await CaLamViecModel.getEmployeeShifts(nhanvien_id, startDate, endDate);
  }

  static async getSalaryByEmployee(nhanvien_id, thang, nam) {
    const employee = await NhanVienModel.findById(nhanvien_id);
    if (!employee) throw new Error('Nhân viên không tồn tại');
    return await CaLamViecModel.getSalaryByEmployee(nhanvien_id, thang, nam);
  }

  static async markSalaryPaid(luong_id) {
    const salary = await CaLamViecModel.getSalaryByEmployee(luong_id);
    if (!salary) throw new Error('Lương không tồn tại');
    if (salary.trang_thai === 'DaThanhToan') throw new Error('Lương đã được thanh toán');
    return await CaLamViecModel.markSalaryPaid(luong_id);
  }

  static async getAllEmployees() {
  const employees = await NhanVienModel.findAll(); // Implement this in nhanVien.model.js
  if (!employees || employees.length === 0) throw new Error('Không có nhân viên nào');
  return employees;
}
static async getAllEmployees() {
  const employees = await NhanVienModel.findAll();
  if (!employees || employees.length === 0) throw new Error('Không có nhân viên nào');
  return employees;
}
}

module.exports = CaLamViecService;