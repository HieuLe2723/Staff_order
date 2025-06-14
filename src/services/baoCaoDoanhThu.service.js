// src/services/baoCaoDoanhThu.service.js
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');

class BaoCaoDoanhThuService {
  static async createBaoCao({ ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang }) {
    // Kiểm tra logic báo cáo
    if (loai_bao_cao === 'Ngay' && !ngay_bao_cao) {
      throw new Error('Báo cáo ngày yêu cầu ngày báo cáo');
    }
    if (loai_bao_cao === 'Thang' && (!thang || !nam)) {
      throw new Error('Báo cáo tháng yêu cầu tháng và năm');
    }
    if (loai_bao_cao === 'Quy' && (!quy || !nam)) {
      throw new Error('Báo cáo quý yêu cầu quý và năm');
    }
    if (loai_bao_cao === 'Nam' && !nam) {
      throw new Error('Báo cáo năm yêu cầu năm');
    }

    return await BaoCaoDoanhThuModel.create({
      ngay_bao_cao,
      loai_bao_cao,
      thang,
      quy,
      nam,
      tong_doanh_thu,
      tong_don_hang,
    });
  }

  static async getBaoCaoById(baocao_id) {
    return await BaoCaoDoanhThuModel.findById(baocao_id);
  }

  static async getAllBaoCao({ loai_bao_cao, thang, quy, nam, ngay_bao_cao }) {
    return await BaoCaoDoanhThuModel.findAll({ loai_bao_cao, thang, quy, nam, ngay_bao_cao });
  }

  static async deleteBaoCao(baocao_id) {
    // Kiểm tra xem báo cáo có chi tiết món ăn không
    const chiTiet = await BaoCaoChiTietMonAnModel.findAll({ baocao_id });
    if (chiTiet.length > 0) {
      throw new Error('Không thể xóa báo cáo có chi tiết món ăn liên quan');
    }
    return await BaoCaoDoanhThuModel.delete(baocao_id);
  }
}

module.exports = BaoCaoDoanhThuService;