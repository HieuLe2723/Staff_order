const ChiTietPhieuNhapModel = require('../models/chiTietPhieuNhap.model');
const PhieuNhapHangModel = require('../models/phieuNhapHang.model');
const NguyenLieuModel = require('../models/nguyenLieu.model');

class ChiTietPhieuNhapService {
  static async createChiTietPhieuNhap(data) {
    const { phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu } = data;

    // Validate input
    if (!phieunhap_id || !nguyenlieu_id || !so_luong || so_luong <= 0) {
      throw new Error('phieunhap_id, nguyenlieu_id, and so_luong (positive) are required');
    }

    // Check if phieunhap_id exists
    const phieuNhap = await PhieuNhapHangModel.findById(phieunhap_id);
    if (!phieuNhap) {
      throw new Error('Inventory receipt not found');
    }

    // Check if nguyenlieu_id exists
    const nguyenLieu = await NguyenLieuModel.findById(nguyenlieu_id);
    if (!nguyenLieu) {
      throw new Error('Raw material not found');
    }

    // Create new ChiTietPhieuNhap
    return await ChiTietPhieuNhapModel.create({
      phieunhap_id,
      nguyenlieu_id,
      so_luong,
      don_vi: don_vi || nguyenLieu.don_vi, // Use NguyenLieu's don_vi if not provided
      ghi_chu,
    });
  }

  static async getChiTietPhieuNhapById(chitiet_phieunhap_id) {
    const chiTiet = await ChiTietPhieuNhapModel.findById(chitiet_phieunhap_id);
    if (!chiTiet) {
      throw new Error('Inventory receipt detail not found');
    }
    return chiTiet;
  }

  static async getAllChiTietPhieuNhap() {
    return await ChiTietPhieuNhapModel.findAll();
  }

  static async updateChiTietPhieuNhap(chitiet_phieunhap_id, data) {
    const { phieunhap_id, nguyenlieu_id, so_luong, don_vi, ghi_chu } = data;

    // Validate input
    if (so_luong && so_luong <= 0) {
      throw new Error('so_luong must be positive');
    }

    // Check if chitiet_phieunhap_id exists
    const chiTiet = await ChiTietPhieuNhapModel.findById(chitiet_phieunhap_id);
    if (!chiTiet) {
      throw new Error('Inventory receipt detail not found');
    }

    // Check if phieunhap_id exists (if provided)
    if (phieunhap_id) {
      const phieuNhap = await PhieuNhapHangModel.findById(phieunhap_id);
      if (!phieuNhap) {
        throw new Error('Inventory receipt not found');
      }
    }

    // Check if nguyenlieu_id exists (if provided)
    if (nguyenlieu_id) {
      const nguyenLieu = await NguyenLieuModel.findById(nguyenlieu_id);
      if (!nguyenLieu) {
        throw new Error('Raw material not found');
      }
    }

    // Update ChiTietPhieuNhap
    return await ChiTietPhieuNhapModel.update(chitiet_phieunhap_id, {
      phieunhap_id: phieunhap_id || chiTiet.phieunhap_id,
      nguyenlieu_id: nguyenlieu_id || chiTiet.nguyenlieu_id,
      so_luong: so_luong || chiTiet.so_luong,
      don_vi: don_vi || chiTiet.don_vi,
      ghi_chu: ghi_chu || chiTiet.ghi_chu,
    });
  }

  static async deleteChiTietPhieuNhap(chitiet_phieunhap_id) {
    // Check if chitiet_phieunhap_id exists
    const chiTiet = await ChiTietPhieuNhapModel.findById(chitiet_phieunhap_id);
    if (!chiTiet) {
      throw new Error('Inventory receipt detail not found');
    }

    return await ChiTietPhieuNhapModel.delete(chitiet_phieunhap_id);
  }
}

module.exports = ChiTietPhieuNhapService;