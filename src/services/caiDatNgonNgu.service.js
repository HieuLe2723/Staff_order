// src/services/caiDatNgonNgu.service.js
const CaiDatNgonNguModel = require('../models/caiDatNgonNgu.model');

class CaiDatNgonNguService {
  static async createNgonNgu({ ma_ngon_ngu, ten_ngon_ngu }) {
    // Kiểm tra mã ngôn ngữ không trùng
    const existing = await CaiDatNgonNguModel.findById(ma_ngon_ngu);
    if (existing) {
      throw new Error('Mã ngôn ngữ đã tồn tại');
    }

    return await CaiDatNgonNguModel.create({ ma_ngon_ngu, ten_ngon_ngu });
  }

  static async getNgonNguById(ma_ngon_ngu) {
    return await CaiDatNgonNguModel.findById(ma_ngon_ngu);
  }

  static async updateNgonNgu(ma_ngon_ngu, { ten_ngon_ngu }) {
    return await CaiDatNgonNguModel.update(ma_ngon_ngu, { ten_ngon_ngu });
  }

  static async deleteNgonNgu(ma_ngon_ngu) {
    return await CaiDatNgonNguModel.delete(ma_ngon_ngu);
  }
}

module.exports = CaiDatNgonNguService;