const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
const BanNhaHangModel = require('../models/banNhaHang.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model');
const NhanVienModel = require('../models/nhanVien.model');

class PhienSuDungBanService {
  static async createPhien({ ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac }) {
    if (!ban_id || !nhanvien_id || !so_khach_nguoi_lon) {
      throw new Error('Missing required fields');
    }

    // Kiểm tra ban_id
    const ban = await BanNhaHangModel.findById(ban_id);
    if (!ban) {
      throw new Error('Table not found');
    }
    if (ban.trang_thai !== 'SanSang') {
      throw new Error('Table is not available');
    }

    // Kiểm tra ban_id_goc nếu có
    if (ban_id_goc) {
      const banGoc = await BanNhaHangModel.findById(ban_id_goc);
      if (!banGoc) {
        throw new Error('Original table not found');
      }
    }

    // Kiểm tra khachhang_id nếu có
    if (khachhang_id) {
      const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
      if (!khachHang) {
        throw new Error('Customer not found');
      }
    }

    // Kiểm tra nhanvien_id
    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }

    // Kiểm tra loai_thao_tac
    if (loai_thao_tac && !['GopBan', 'TachBan', 'ChuyenBan'].includes(loai_thao_tac)) {
      throw new Error('Invalid loai_thao_tac value');
    }

    return await PhienSuDungBanModel.create({
      ban_id,
      ban_id_goc,
      khachhang_id,
      nhanvien_id,
      so_khach_nguoi_lon,
      so_khach_tre_em_co_phi,
      so_khach_tre_em_mien_phi,
      loai_khach,
      loai_thao_tac,
      thong_bao_thanh_toan: null
    });
  }

  static async getPhienById(phien_id) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }
    return phien;
  }

  static async updatePhien(phien_id, { ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc }) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }

    if (ban_id) {
      const ban = await BanNhaHangModel.findById(ban_id);
      if (!ban) {
        throw new Error('Table not found');
      }
    }

    if (ban_id_goc) {
      const banGoc = await BanNhaHangModel.findById(ban_id_goc);
      if (!banGoc) {
        throw new Error('Original table not found');
      }
    }

    if (khachhang_id) {
      const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
      if (!khachHang) {
        throw new Error('Customer not found');
      }
    }

    if (nhanvien_id) {
      const nhanVien = await NhanVienModel.findById(nhanvien_id);
      if (!nhanVien) {
        throw new Error('Employee not found');
      }
    }

    if (loai_thao_tac && !['GopBan', 'TachBan', 'ChuyenBan'].includes(loai_thao_tac)) {
      throw new Error('Invalid loai_thao_tac value');
    }

    return await PhienSuDungBanModel.update(phien_id, {
      ban_id,
      ban_id_goc,
      khachhang_id,
      nhanvien_id,
      so_khach_nguoi_lon,
      so_khach_tre_em_co_phi,
      so_khach_tre_em_mien_phi,
      loai_khach,
      loai_thao_tac,
      thong_bao_thanh_toan,
      thoi_gian_ket_thuc
    });
  }

  static async endPhien(phien_id) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }

    return await PhienSuDungBanModel.endSession(phien_id);
  }

  static async deletePhien(phien_id) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }

    return await PhienSuDungBanModel.delete(phien_id);
  }
}

module.exports = PhienSuDungBanService;