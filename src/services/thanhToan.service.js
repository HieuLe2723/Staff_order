const ThanhToanModel = require('../models/thanhToan.model');
const DonHangModel = require('../models/donHang.model');
const KhuyenMaiModel = require('../models/khuyenMai.model');

class ThanhToanService {
  static async createThanhToan({ donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai = 'ChoXuLy' }) {
    if (!donhang_id || !so_tien || !phuong_thuc) {
      throw new Error('Missing required fields');
    }

    // Kiểm tra donhang_id
    const donHang = await DonHangModel.findById(donhang_id);
    if (!donHang) {
      throw new Error('Order not found');
    }

    // Kiểm tra khuyenmai_id nếu có
    if (khuyenmai_id) {
      const khuyenMai = await KhuyenMaiModel.findById(khuyenmai_id);
      if (!khuyenMai) {
        throw new Error('Promotion not found');
      }
      if (khuyenMai.ngay_het_han < new Date()) {
        throw new Error('Promotion has expired');
      }
    }

    // Kiểm tra phuong_thuc
    if (!['TienMat', 'VNPay', 'Momo', 'ZaloPay'].includes(phuong_thuc)) {
      throw new Error('Invalid phuong_thuc value');
    }

    return await ThanhToanModel.create({ donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai });
  }

  static async getThanhToanById(thanhtoan_id) {
    const thanhToan = await ThanhToanModel.findById(thanhtoan_id);
    if (!thanhToan) {
      throw new Error('Payment not found');
    }
    return thanhToan;
  }

  static async updateThanhToan(thanhtoan_id, { donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai }) {
    const thanhToan = await ThanhToanModel.findById(thanhtoan_id);
    if (!thanhToan) {
      throw new Error('Payment not found');
    }

    if (donhang_id) {
      const donHang = await DonHangModel.findById(donhang_id);
      if (!donHang) {
        throw new Error('Order not found');
      }
    }

    if (khuyenmai_id) {
      const khuyenMai = await KhuyenMaiModel.findById(khuyenmai_id);
      if (!khuyenMai) {
        throw new Error('Promotion not found');
      }
      if (khuyenMai.ngay_het_han < new Date()) {
        throw new Error('Promotion has expired');
      }
    }

    if (phuong_thuc && !['TienMat', 'VNPay', 'Momo', 'ZaloPay'].includes(phuong_thuc)) {
      throw new Error('Invalid phuong_thuc value');
    }

    return await ThanhToanModel.update(thanhtoan_id, { donhang_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai });
  }

  static async updateThanhToanStatus(thanhtoan_id, trang_thai) {
    if (!['ChoXuLy', 'HoanTat', 'ThatBai'].includes(trang_thai)) {
      throw new Error('Invalid trang_thai value');
    }

    const thanhToan = await ThanhToanModel.findById(thanhtoan_id);
    if (!thanhToan) {
      throw new Error('Payment not found');
    }

    return await ThanhToanModel.updateStatus(thanhtoan_id, trang_thai);
  }

  static async deleteThanhToan(thanhtoan_id) {
    const thanhToan = await ThanhToanModel.findById(thanhtoan_id);
    if (!thanhToan) {
      throw new Error('Payment not found');
    }

    return await ThanhToanModel.delete(thanhtoan_id);
  }
}

module.exports = ThanhToanService;