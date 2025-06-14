const LichSuBaoTriModel = require('../models/lichSuBaoTri.model');

class LichSuBaoTriService {
  static async createLichSuBaoTri({ thietbi_id, mo_ta, ngay_bao_tri, trang_thai }) {
    if (!Number.isInteger(Number(thietbi_id))) {
      throw new Error('thietbi_id must be an integer');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    if (!ngay_bao_tri || isNaN(Date.parse(ngay_bao_tri))) {
      throw new Error('ngay_bao_tri must be a valid date');
    }
    if (!['DaSua', 'DangXuLy', 'KhongSuaDuoc'].includes(trang_thai)) {
      throw new Error('trang_thai must be one of: DaSua, DangXuLy, KhongSuaDuoc');
    }
    return await LichSuBaoTriModel.create({ thietbi_id, mo_ta, ngay_bao_tri, trang_thai });
  }

  static async getLichSuBaoTriById(lichsu_id) {
    if (!Number.isInteger(Number(lichsu_id))) {
      throw new Error('lichsu_id must be an integer');
    }
    const lichSu = await LichSuBaoTriModel.findById(lichsu_id);
    if (!lichSu) {
      throw new Error('Maintenance record not found');
    }
    return lichSu;
  }

  static async updateLichSuBaoTri(lichsu_id, { thietbi_id, mo_ta, ngay_bao_tri, trang_thai }) {
    if (!Number.isInteger(Number(lichsu_id))) {
      throw new Error('lichsu_id must be an integer');
    }
    if (!Number.isInteger(Number(thietbi_id))) {
      throw new Error('thietbi_id must be an integer');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    if (!ngay_bao_tri || isNaN(Date.parse(ngay_bao_tri))) {
      throw new Error('ngay_bao_tri must be a valid date');
    }
    if (!['DaSua', 'DangXuLy', 'KhongSuaDuoc'].includes(trang_thai)) {
      throw new Error('trang_thai must be one of: DaSua, DangXuLy, KhongSuaDuoc');
    }
    return await LichSuBaoTriModel.update(lichsu_id, { thietbi_id, mo_ta, ngay_bao_tri, trang_thai });
  }

  static async deleteLichSuBaoTri(lichsu_id) {
    if (!Number.isInteger(Number(lichsu_id))) {
      throw new Error('lichsu_id must be an integer');
    }
    return await LichSuBaoTriModel.delete(lichsu_id);
  }
}

module.exports = LichSuBaoTriService;