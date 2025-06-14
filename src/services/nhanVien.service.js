const NhanVienModel = require('../models/nhanVien.model');
const RoleModel = require('../models/role.model');

class NhanVienService {
  static async createNhanVien({ nhanvien_id, ho_ten, email, matkhau_hash, role_id }) {
    if (!nhanvien_id || !ho_ten || !email || !matkhau_hash || !role_id) {
      throw new Error('Missing required fields');
    }

    // Kiểm tra xem role_id có tồn tại
    const role = await RoleModel.findById(role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Kiểm tra email đã tồn tại
    const existingNhanVien = await NhanVienModel.findById(nhanvien_id);
    if (existingNhanVien) {
      throw new Error('Employee ID already exists');
    }

    return await NhanVienModel.create({ nhanvien_id, ho_ten, email, matkhau_hash, role_id });
  }

  static async getNhanVienById(nhanvien_id) {
    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }
    return nhanVien;
  }

  static async updateNhanVien(nhanvien_id, { ho_ten, email, matkhau_hash, role_id, hoat_dong }) {
    if (!ho_ten || !email || !matkhau_hash || !role_id) {
      throw new Error('Missing required fields');
    }

    // Kiểm tra xem role_id có tồn tại
    const role = await RoleModel.findById(role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }

    return await NhanVienModel.update(nhanvien_id, { ho_ten, email, matkhau_hash, role_id, hoat_dong });
  }

  static async deleteNhanVien(nhanvien_id) {
    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }

    return await NhanVienModel.delete(nhanvien_id);
  }
}

module.exports = NhanVienService;