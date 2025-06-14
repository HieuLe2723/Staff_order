const LoaiMonAnModel = require('../models/loaiMonAn.model');

class LoaiMonAnService {
  static async createLoaiMonAn({ ten_loai }) {
    if (!ten_loai || typeof ten_loai !== 'string' || ten_loai.length > 100) {
      throw new Error('ten_loai is required and must be a string with max length 100');
    }
    return await LoaiMonAnModel.create({ ten_loai });
  }

  static async getAllLoaiMonAn() {
    return await LoaiMonAnModel.findAll();
  }

  static async getLoaiMonAnById(loai_id) {
    if (!Number.isInteger(Number(loai_id))) {
      throw new Error('loai_id must be an integer');
    }
    const loaiMonAn = await LoaiMonAnModel.findById(loai_id);
    if (!loaiMonAn) {
      throw new Error('Dish category not found');
    }
    return loaiMonAn;
  }

  static async deleteLoaiMonAn(loai_id) {
    if (!Number.isInteger(Number(loai_id))) {
      throw new Error('loai_id must be an integer');
    }
    return await LoaiMonAnModel.delete(loai_id);
  }
}

module.exports = LoaiMonAnService;