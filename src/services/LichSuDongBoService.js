const LichSuDongBoModel = require('../models/lichSuDongBo.model');

class LichSuDongBoService {
  static async createLichSuDongBo({ loai_du_lieu, trang_thai, mo_ta }) {
    if (!loai_du_lieu || typeof loai_du_lieu !== 'string' || loai_du_lieu.length > 50) {
      throw new Error('loai_du_lieu is required and must be a string with max length 50');
    }
    if (!['ThanhCong', 'ThatBai'].includes(trang_thai)) {
      throw new Error('trang_thai must be one of: ThanhCong, ThatBai');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    return await LichSuDongBoModel.create({ loai_du_lieu, trang_thai, mo_ta });
  }

  static async getLichSuDongBoById(dongbo_id) {
    if (!Number.isInteger(Number(dongbo_id))) {
      throw new Error('dongbo_id must be an integer');
    }
    const lichSu = await LichSuDongBoModel.findById(dongbo_id);
    if (!lichSu) {
      throw new Error('Sync record not found');
    }
    return lichSu;
  }

  static async updateLichSuDongBo(dongbo_id, { loai_du_lieu, trang_thai, mo_ta }) {
    if (!Number.isInteger(Number(dongbo_id))) {
      throw new Error('dongbo_id must be an integer');
    }
    if (!loai_du_lieu || typeof loai_du_lieu !== 'string' || loai_du_lieu.length > 50) {
      throw new Error('loai_du_lieu is required and must be a string with max length 50');
    }
    if (!['ThanhCong', 'ThatBai'].includes(trang_thai)) {
      throw new Error('trang_thai must be one of: ThanhCong, ThatBai');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    return await LichSuDongBoModel.update(dongbo_id, { loai_du_lieu, trang_thai, mo_ta });
  }

  static async deleteLichSuDongBo(dongbo_id) {
    if (!Number.isInteger(Number(dongbo_id))) {
      throw new Error('dongbo_id must be an integer');
    }
    return await LichSuDongBoModel.delete(dongbo_id);
  }
}

module.exports = LichSuDongBoService;