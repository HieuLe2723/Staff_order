// src/controllers/baoCaoDoanhThu.controller.js
const BaoCaoDoanhThuService = require('../services/baoCaoDoanhThu.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');
const DateUtils = require('../utils/date');

class BaoCaoDoanhThuController {
  static async createBaoCao(req, res, next) {
    try {
      const { ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang } = req.body;
      const sanitizedData = {
        ngay_bao_cao: ngay_bao_cao ? DateUtils.formatDate(ngay_bao_cao, 'YYYY-MM-DD') : null,
        loai_bao_cao: HelperUtils.sanitizeString(loai_bao_cao),
        thang,
        quy,
        nam,
        tong_doanh_thu,
        tong_don_hang,
      };
      const baoCao = await BaoCaoDoanhThuService.createBaoCao(sanitizedData);
      return res.status(201).json(ResponseUtils.success(baoCao, 'Tạo báo cáo thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getBaoCaoById(req, res, next) {
    try {
      const { id } = req.params;
      const baoCao = await BaoCaoDoanhThuService.getBaoCaoById(id);
      return res.json(ResponseUtils.success(baoCao));
    } catch (err) {
      next(err);
    }
  }

  static async getAllBaoCao(req, res, next) {
    try {
      const { loai_bao_cao, thang, quy, nam, ngay_bao_cao } = req.query;
      const filters = {
        loai_bao_cao: HelperUtils.sanitizeString(loai_bao_cao),
        thang,
        quy,
        nam,
        ngay_bao_cao: ngay_bao_cao ? DateUtils.formatDate(ngay_bao_cao, 'YYYY-MM-DD') : null,
      };
      const baoCaos = await BaoCaoDoanhThuService.getAllBaoCao(filters);
      return res.json(ResponseUtils.success(baoCaos));
    } catch (err) {
      next(err);
    }
  }

  static async deleteBaoCao(req, res, next) {
    try {
      const { id } = req.params;
      const result = await BaoCaoDoanhThuService.deleteBaoCao(id);
      return res.json(ResponseUtils.success(result, 'Xóa báo cáo thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BaoCaoDoanhThuController;