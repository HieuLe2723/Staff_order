// src/services/chiTietDonHang.service.js
const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
const MonAnModel = require('../models/monAn.model'); // Giả sử model MonAn đã được tạo
const DonHangModel = require('../models/donHang.model');

class ChiTietDonHangService {
  static async createChiTietDonHang({ donhang_id, monan_id, so_luong, ghi_chu }) {
    // Kiểm tra món ăn có bị khóa không
    const monAn = await MonAnModel.findById(monan_id);
    if (monAn.khoa) {
      throw new Error('Món ăn này hiện đang bị khóa do thiếu nguyên liệu');
    }

    // Kiểm tra số lượng nguyên liệu đủ
    const nguyenLieu = await MonAnNguyenLieuModel.findByMonAnId(monan_id); // Giả sử model MonAnNguyenLieu
    for (const nl of nguyenLieu) {
      const nguyenLieuData = await NguyenLieuModel.findById(nl.nguyenlieu_id); // Giả sử model NguyenLieu
      if (nguyenLieuData.so_luong_con_lai < nl.so_luong_can * so_luong) {
        throw new Error(`Nguyên liệu ${nguyenLieuData.ten_nguyenlieu} không đủ`);
      }
    }

    return await ChiTietDonHangModel.create({ donhang_id, monan_id, so_luong, ghi_chu });
  }

  static async getChiTietDonHangById(chitiet_id) {
    return await ChiTietDonHangModel.findById(chitiet_id);
  }

  static async updateChiTietDonHang(chitiet_id, { donhang_id, monan_id, so_luong, ghi_chu, thoi_gian_phuc_vu, trang_thai_phuc_vu }) {
    return await ChiTietDonHangModel.update(chitiet_id, {
      donhang_id,
      monan_id,
      so_luong,
      ghi_chu,
      thoi_gian_phuc_vu,
      trang_thai_phuc_vu,
    });
  }

  static async deleteChiTietDonHang(chitiet_id) {
    return await ChiTietDonHangModel.delete(chitiet_id);
  }
}

module.exports = ChiTietDonHangService;