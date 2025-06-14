const ChiTietPhieuXuatModel = require('../models/chiTietPhieuXuat.model');
const PhieuXuatHangModel = require('../models/phieuXuatHang.model');
const NguyenLieuModel = require('../models/nguyenLieu.model');

class ChiTietPhieuXuatService {
  static async createChiTietPhieuXuat(data) {
    const { phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu } = data;

    // Validate input
    if (!phieuxuat_id || !nguyenlieu_id || !so_luong || so_luong <= 0) {
      throw new Error('phieuxuat_id, nguyenlieu_id, and so_luong (positive) are required');
    }

    // Check if phieuxuat_id exists
    const phieuXuat = await PhieuXuatHangModel.findById(phieuxuat_id);
    if (!phieuXuat) {
      throw new Error('Inventory issue not found');
    }

    // Check if nguyenlieu_id exists and has enough quantity
    const nguyenLieu = await NguyenLieuModel.findById(nguyenlieu_id);
    if (!nguyenLieu) {
      throw new Error('Raw material not found');
    }
    if (nguyenLieu.so_luong_con_lai < so_luong) {
      throw new Error('Insufficient raw material quantity');
    }

    // Create new ChiTietPhieuXuat
    return await ChiTietPhieuXuatModel.create({
      phieuxuat_id,
      nguyenlieu_id,
      so_luong,
      don_vi: don_vi || nguyenLieu.don_vi, // Use NguyenLieu's don_vi if not provided
      ghi_chu,
    });
  }

  static async getChiTietPhieuXuatById(chitiet_phieuxuat_id) {
    const chiTiet = await ChiTietPhieuXuatModel.findById(chitiet_phieuxuat_id);
    if (!chiTiet) {
      throw new Error('Inventory issue detail not found');
    }
    return chiTiet;
  }

  static async getAllChiTietPhieuXuat() {
    return await ChiTietPhieuXuatModel.findAll();
  }

  static async updateChiTietPhieuXuat(chitiet_phieuxuat_id, data) {
    const { phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu } = data;

    // Validate input
    if (so_luong && so_luong <= 0) {
      throw new Error('so_luong must be positive');
    }

    // Check if chitiet_phieuxuat_id exists
    const chiTiet = await ChiTietPhieuXuatModel.findById(chitiet_phieuxuat_id);
    if (!chiTiet) {
      throw new Error('Inventory issue detail not found');
    }

    // Check if phieuxuat_id exists (if provided)
    if (phieuxuat_id) {
      const phieuXuat = await PhieuXuatHangModel.findById(phieuxuat_id);
      if (!phieuXuat) {
        throw new Error('Inventory issue not found');
      }
    }

    // Check if nguyenlieu_id exists and has enough quantity (if provided)
    if (nguyenlieu_id || so_luong) {
      const nguyenLieu = await NguyenLieuModel.findById(nguyenlieu_id || chiTiet.nguyenlieu_id);
      if (!nguyenLieu) {
        throw new Error('Raw material not found');
      }
      if (so_luong && nguyenLieu.so_luong_con_lai < so_luong) {
        throw new Error('Insufficient raw material quantity');
      }
    }

    // Update ChiTietPhieuXuat
    return await ChiTietPhieuXuatModel.update(chitiet_phieuxuat_id, {
      phieuxuat_id: phieuxuat_id || chiTiet.phieuxuat_id,
      nguyenlieu_id: nguyenlieu_id || chiTiet.nguyenlieu_id,
      so_luong: so_luong || chiTiet.so_luong,
      don_vi: don_vi || chiTiet.don_vi,
      ghi_chu: ghi_chu || chiTiet.ghi_chu,
    });
  }

  static async deleteChiTietPhieuXuat(chitiet_phieuxuat_id) {
    // Check if chitiet_phieuxuat_id exists
    const chiTiet = await ChiTietPhieuXuatModel.findById(chitiet_phieuxuat_id);
    if (!chiTiet) {
      throw new Error('Inventory issue detail not found');
    }

    return await ChiTietPhieuXuatModel.delete(chitiet_phieuxuat_id);
  }
}

module.exports = ChiTietPhieuXuatService;