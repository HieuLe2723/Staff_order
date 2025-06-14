// src/services/baoCaoChiTietMonAn.service.js
const BaoCaoChiTietMonAnModel = require('../models/baoCaoChiTietMonAn.model');
const MonAnModel = require('../models/monAn.model'); // Giả sử model MonAn đã được tạo
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');

class BaoCaoChiTietMonAnService {
  static async createBaoCaoMonAn({ baocao_id, monan_id, so_luong, tong_doanh_thu_mon }) {
    // Kiểm tra khóa ngoại
    const baoCao = await BaoCaoDoanhThuModel.findById(baocao_id);
    if (!baoCao) {
      throw new Error('Báo cáo không tồn tại');
    }
    const monAn = await MonAnModel.findById(monan_id);
    if (!monAn) {
      throw new Error('Món ăn không tồn tại');
    }

    return await BaoCaoChiTietMonAnModel.create({
      baocao_id,
      monan_id,
      so_luong,
      tong_doanh_thu_mon,
    });
  }

  static async getBaoCaoMonAnById(baocao_monan_id) {
    return await BaoCaoChiTietMonAnModel.findById(baocao_monan_id);
  }

  static async updateBaoCaoMonAn(baocao_monan_id, { baocao_id, monan_id, so_luong, tong_doanh_thu_mon }) {
    // Kiểm tra khóa ngoại
    const baoCao = await BaoCaoDoanhThuModel.findById(baocao_id);
    if (!baoCao) {
      throw new Error('Báo cáo không tồn tại');
    }
    const monAn = await MonAnModel.findById(monan_id);
    if (!monAn) {
      throw new Error('Món ăn không tồn tại');
    }

    return await BaoCaoChiTietMonAnModel.update(baocao_monan_id, {
      baocao_id,
      monan_id,
      so_luong,
      tong_doanh_thu_mon,
    });
  }

  static async deleteBaoCaoMonAn(baocao_monan_id) {
    return await BaoCaoChiTietMonAnModel.delete(baocao_monan_id);
  }
}

module.exports = BaoCaoChiTietMonAnService;