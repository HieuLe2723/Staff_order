// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const JWTUtils = require('../utils/jwt');
const NhanVienModel = require('../models/nhanVien.model');
const RoleModel = require('../models/role.model');

class AuthService {
  static async login(nhanvien_id, password) {
    console.log(`Attempting login for nhanvien_id: ${nhanvien_id}`);
    const employee = await NhanVienModel.findById(nhanvien_id);
    
    if (!employee || !employee.hoat_dong) {
      console.log(`Employee ${nhanvien_id} not found or inactive`);
      return {
        success: false,
        message: 'Mã nhân viên không tồn tại hoặc không hoạt động'
      };
    }

    const isMatch = await bcrypt.compare(password, employee.matkhau_hash);
    if (!isMatch) {
      console.log(`Password mismatch for nhanvien_id: ${nhanvien_id}`);
      return {
        success: false,
        message: 'Mật khẩu không đúng'
      };
    }

    const role = await RoleModel.findById(employee.role_id);
    if (!role) {
      return {
        success: false,
        message: 'Role không tồn tại'
      };
    }

    const payload = {
      nhanvien_id: employee.nhanvien_id,
      role_id: employee.role_id,
      role_name: role.role_name
    };

    const token = JWTUtils.generateToken(payload);
    const refreshToken = JWTUtils.generateRefreshToken(payload);

    console.log(`Login successful for nhanvien_id: ${nhanvien_id}`);
    return {
      success: true,
      token,
      refreshToken,
      nhanvien_id: employee.nhanvien_id,
      ho_ten: employee.ho_ten,
      role_id: employee.role_id,
      role_name: role.role_name
    };
  }

  static async refreshToken(refreshToken) {
    try {
      console.log('Verifying refresh token');
      const decoded = JWTUtils.verifyToken(refreshToken);

      const employee = await NhanVienModel.findById(decoded.nhanvien_id);
      if (!employee || !employee.hoat_dong) {
        console.log(`Employee ${decoded.nhanvien_id} not found or inactive`);
        throw new Error('Employee not found or inactive');
      }

      const role = await RoleModel.findById(employee.role_id);
      if (!role) {
        throw new Error('Role not found');
      }

      const payload = {
        nhanvien_id: employee.nhanvien_id,
        role_id: employee.role_id,
        role_name: role.role_name
      };

      const newToken = JWTUtils.generateToken(payload);
      const newRefreshToken = JWTUtils.generateRefreshToken(payload);

      console.log(`Refresh token successful for nhanvien_id: ${employee.nhanvien_id}`);
      return {
        token: newToken,
        refreshToken: newRefreshToken,
        nhanvien_id: employee.nhanvien_id,
        ho_ten: employee.ho_ten,
        role_id: employee.role_id,
        role_name: role.role_name
      };
    } catch (err) {
      console.error('Refresh token error:', err.message);
      throw new Error('Invalid or expired refresh token');
    }
  }
}

module.exports = AuthService;