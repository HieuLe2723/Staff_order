const LoaiMonAnModel = require('../models/loaiMonAn.model');

class LoaiMonAnService {
  static async createLoaiMonAn({ ten_loai, loai_menu }) {
    if (!ten_loai || typeof ten_loai !== 'string' || ten_loai.length > 100) {
      throw new Error('ten_loai is required and must be a string with max length 100');
    }
    if (!loai_menu || typeof loai_menu !== 'string' || loai_menu.length > 50) {
      throw new Error('loai_menu is required and must be a string with max length 50');
    }
    return await LoaiMonAnModel.create({ ten_loai, loai_menu });
  }

  static async getAllLoaiMonAn() {
    return await LoaiMonAnModel.findAll();
  }

  static async getLoaiMonAnByMenu(loai_menu) {
    if (!loai_menu || typeof loai_menu !== 'string' || loai_menu.length > 50) {
      throw new Error('loai_menu is required and must be a string with max length 50');
    }
    return await LoaiMonAnModel.findByMenu(loai_menu);
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

  static async getUniqueMenuTypes() {
    return await LoaiMonAnModel.findUniqueMenuTypes();
  }
}

module.exports = LoaiMonAnService;