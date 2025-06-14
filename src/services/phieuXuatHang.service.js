const PhieuXuatHangModel = require('../models/phieuXuatHang.model');
const NhanVienModel = require('../models/nhanVien.model');

class PhieuXuatHangService {
  static async createPhieuXuatHang(data) {
    const { nhanvien_id, tong_so_luong, ghi_chu, trang_thai = 'ChoXacNhan' } = data;

    // Validate input
    if (!nhanvien_id || !tong_so_luong || tong_so_luong < 0) {
      throw new Error('nhanvien_id and tong_so_luong (non-negative) are required');
    }
    if (!['ChoXacNhan', 'DaXacNhan', 'DaHuy'].includes(trang_thai)) {
      throw new Error('Invalid trang_thai. Must be ChoXacNhan, DaXacNhan, or DaHuy');
    }

    // Check if nhanvien_id exists
    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }

    // Create new PhieuXuatHang
    return await PhieuXuatHangModel.create({
      nhanvien_id,
      tong_so_luong,
      ghi_chu,
      trang_thai,
    });
  }

  static async getPhieuXuatHangById(phieuxuat_id) {
    const phieuXuat = await PhieuXuatHangModel.findById(phieuxuat_id);
    if (!phieuXuat) {
      throw new Error('Inventory issue not found');
    }
    return phieuXuat;
  }

  static async getAllPhieuXuatHang() {
    return await PhieuXuatHangModel.findAll();
  }

  static async updatePhieuXuatHang(phieuxuat_id, data) {
    const { nhanvien_id, tong_so_luong, ghi_chu, trang_thai } = data;

    // Validate input
    if (tong_so_luong && tong_so_luong < 0) {
      throw new Error('tong_so_luong must be non-negative');
    }
    if (trang_thai && !['ChoXacNhan', 'DaXacNhan', 'DaHuy'].includes(trang_thai)) {
      throw new Error('Invalid trang_thai. Must be ChoXacNhan, DaXacNhan, or DaHuy');
    }

    // Check if phieuxuat_id exists
    const phieuXuat = await PhieuXuatHangModel.findById(phieuxuat_id);
    if (!phieuXuat) {
      throw new Error('Inventory issue not found');
    }

    // Check if nhanvien_id exists (if provided)
    if (nhanvien_id) {
      const nhanVien = await NhanVienModel.findById(nhanvien_id);
      if (!nhanVien) {
        throw new Error('Employee not found');
      }
    }

    // Update PhieuXuatHang
    return await PhieuXuatHangModel.update(phieuxuat_id, {
      nhanvien_id: nhanvien_id || phieuXuat.nhanvien_id,
      tong_so_luong: tong_so_luong || phieuXuat.tong_so_luong,
      ghi_chu: ghi_chu || phieuXuat.ghi_chu,
      trang_thai: trang_thai || phieuXuat.trang_thai,
    });
  }

  static async deletePhieuXuatHang(phieuxuat_id) {
    // Check if phieuxuat_id exists
    const phieuXuat = await PhieuXuatHangModel.findById(phieuxuat_id);
    if (!phieuXuat) {
      throw new Error('Inventory issue not found');
    }

    return await PhieuXuatHangModel.delete(phieuxuat_id);
  }
}

module.exports = PhieuXuatHangService;