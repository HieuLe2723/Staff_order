const KhuyenMaiModel = require('../models/khuyenMai.model');

class KhuyenMaiService {
  static async createKhuyenMai({ ma_code, mo_ta, phan_tram_giam, ngay_het_han }) {
    if (!ma_code || typeof ma_code !== 'string' || ma_code.length > 50) {
      throw new Error('ma_code is required and must be a string with max length 50');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    if (!Number.isInteger(phan_tram_giam) || phan_tram_giam < 0 || phan_tram_giam > 100) {
      throw new Error('phan_tram_giam must be an integer between 0 and 100');
    }
    if (!ngay_het_han || isNaN(Date.parse(ngay_het_han))) {
      throw new Error('ngay_het_han must be a valid date');
    }
    return await KhuyenMaiModel.create({ ma_code, mo_ta, phan_tram_giam, ngay_het_han });
  }

  static async getKhuyenMaiByCode(ma_code) {
    if (!ma_code || typeof ma_code !== 'string') {
      throw new Error('ma_code must be a string');
    }
    const khuyenMai = await KhuyenMaiModel.findByCode(ma_code);
    if (!khuyenMai) {
      throw new Error('Promotion not found or expired');
    }
    return khuyenMai;
  }

  static async getAllKhuyenMai({ activeOnly = false } = {}) {
    if (typeof activeOnly !== 'boolean') {
      throw new Error('activeOnly must be a boolean');
    }
    return await KhuyenMaiModel.findAll({ activeOnly });
  }

  static async updateKhuyenMai(khuyenmai_id, { ma_code, mo_ta, phan_tram_giam, ngay_het_han }) {
    if (!Number.isInteger(Number(khuyenmai_id))) {
      throw new Error('khuyenmai_id must be an integer');
    }
    if (!ma_code || typeof ma_code !== 'string' || ma_code.length > 50) {
      throw new Error('ma_code is required and must be a string with max length 50');
    }
    if (mo_ta && (typeof mo_ta !== 'string' || mo_ta.length > 255)) {
      throw new Error('mo_ta must be a string with max length 255');
    }
    if (!Number.isInteger(phan_tram_giam) || phan_tram_giam < 0 || phan_tram_giam > 100) {
      throw new Error('phan_tram_giam must be an integer between 0 and 100');
    }
    if (!ngay_het_han || isNaN(Date.parse(ngay_het_han))) {
      throw new Error('ngay_het_han must be a valid date');
    }
    return await KhuyenMaiModel.update(khuyenmai_id, { ma_code, mo_ta, phan_tram_giam, ngay_het_han });
  }

  static async deleteKhuyenMai(khuyenmai_id) {
    if (!Number.isInteger(Number(khuyenmai_id))) {
      throw new Error('khuyenmai_id must be an integer');
    }
    return await KhuyenMaiModel.delete(khuyenmai_id);
  }
}

module.exports = KhuyenMaiService;