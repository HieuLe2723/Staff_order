const KhuVucModel = require('../models/khuVuc.model');

class KhuVucService {
  static async createKhuVuc({ ten_khuvuc, so_ban }) {
    if (!ten_khuvuc || typeof ten_khuvuc !== 'string' || ten_khuvuc.length > 100) {
      throw new Error('ten_khuvuc is required and must be a string with max length 100');
    }
    if (!Number.isInteger(so_ban) || so_ban < 0) {
      throw new Error('soban must be a non-negative integer');
    }
    return await KhuVucModel.create({ ten_khuvuc, so_ban });
  }

  static async getKhuVucById(khuvuc_id) {
    if (!Number.isInteger(Number(khuvuc_id))) {
      throw new Error('khuvuc_id must be an integer');
    }
    const khuVuc = await KhuVucModel.findById(khuvuc_id);
    if (!khuVuc) {
      throw new Error('Zone not found');
    }
    return khuVuc;
  }

  static async getAllKhuVuc() {
    return await KhuVucModel.findAll();
  }

  static async updateKhuVuc(khuvuc_id, { ten_khuvuc, so_ban }) {
    if (!Number.isInteger(Number(khuvuc_id))) {
      throw new Error('khuvuc_id must be an integer');
    }
    if (!ten_khuvuc || typeof ten_khuvuc !== 'string' || ten_khuvuc.length > 100) {
      throw new Error('ten_khuvuc is required and must be a string with max length 100');
    }
    if (!Number.isInteger(so_ban) || so_ban < 0) {
      throw new Error('soban must be a non-negative integer');
    }
    return await KhuVucModel.update(khuvuc_id, { ten_khuvuc, so_ban });
  }

  static async deleteKhuVuc(khuvuc_id) {
    if (!Number.isInteger(Number(khuvuc_id))) {
      throw new Error('khuvuc_id must be an integer');
    }
    return await KhuVucModel.delete(khuvuc_id);
  }
}

module.exports = KhuVucService;