const ThietBiModel = require('../models/thietBi.model');

class ThietBiService {
  static async createThietBi({ ten, so_luong = 1, trang_thai = 'HoatDong' }) {
    if (!ten) {
      throw new Error('Missing required field: ten');
    }

    if (so_luong < 1) {
      throw new Error('so_luong must be at least 1');
    }

    if (!['HoatDong', 'DangSuaChua', 'HuHong'].includes(trang_thai)) {
      throw new Error('Invalid trang_thai value');
    }

    return await ThietBiModel.create({ ten, so_luong, trang_thai });
  }

  static async getThietBiById(thietbi_id) {
    const thietBi = await ThietBiModel.findById(thietbi_id);
    if (!thietBi) {
      throw new Error('Equipment not found');
    }
    return thietBi;
  }

  static async updateThietBi(thietbi_id, { ten, so_luong, trang_thai }) {
    const thietBi = await ThietBiModel.findById(thietbi_id);
    if (!thietBi) {
      throw new Error('Equipment not found');
    }

    if (so_luong < 1) {
      throw new Error('so_luong must be at least 1');
    }

    if (trang_thai && !['HoatDong', 'DangSuaChua', 'HuHong'].includes(trang_thai)) {
      throw new Error('Invalid trang_thai value');
    }

    return await ThietBiModel.update(thietbi_id, { ten, so_luong, trang_thai });
  }

  static async deleteThietBi(thietbi_id) {
    const thietBi = await ThietBiModel.findById(thietbi_id);
    if (!thietBi) {
      throw new Error('Equipment not found');
    }

    return await ThietBiModel.delete(thietbi_id);
  }
}

module.exports = ThietBiService;