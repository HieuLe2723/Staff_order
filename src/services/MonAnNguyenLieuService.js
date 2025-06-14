const MonAnNguyenLieuModel = require('../models/monAnNguyenLieu.model');

class MonAnNguyenLieuService {
  static async createMonAnNguyenLieu({ monan_id, nguyenlieu_id, so_luong_can }) {
    if (!Number.isInteger(Number(monan_id))) {
      throw new Error('monan_id must be an integer');
    }
    if (!Number.isInteger(Number(nguyenlieu_id))) {
      throw new Error('nguyenlieu_id must be an integer');
    }
    if (!Number.isFinite(so_luong_can) || so_luong_can <= 0) {
      throw new Error('so_luong_can must be a positive number');
    }
    return await MonAnNguyenLieuModel.create({ monan_id, nguyenlieu_id, so_luong_can });
  }

  static async getMonAnNguyenLieuByMonanId(monan_id) {
    if (!Number.isInteger(Number(monan_id))) {
      throw new Error('monan_id must be an integer');
    }
    return await MonAnNguyenLieuModel.findByMonanId(monan_id);
  }

  static async deleteMonAnNguyenLieu(monan_id, nguyenlieu_id) {
    if (!Number.isInteger(Number(monan_id))) {
      throw new Error('monan_id must be an integer');
    }
    if (!Number.isInteger(Number(nguyenlieu_id))) {
      throw new Error('nguyenlieu_id must be an integer');
    }
    return await MonAnNguyenLieuModel.delete(monan_id, nguyenlieu_id);
  }
}

module.exports = MonAnNguyenLieuService;