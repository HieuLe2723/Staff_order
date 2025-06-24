// src/controllers/baoCaoChiTietMonAn.controller.js
const BaoCaoChiTietMonAnService = require('../services/baoCaoChiTietMonAn.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class BaoCaoChiTietMonAnController {
  static async createBaoCaoMonAn(req, res, next) {
    try {
      const { baocao_id, monan_id, so_luong, tong_doanh_thu_mon } = req.body;
      const baoCaoMonAn = await BaoCaoChiTietMonAnService.createBaoCaoMonAn({
        baocao_id,
        monan_id,
        so_luong,
        tong_doanh_thu_mon,
      });
      return res.status(201).json(ResponseUtils.success(baoCaoMonAn, 'Tạo chi tiết báo cáo thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getBaoCaoMonAnById(req, res, next) {
    try {
      const { id } = req.params;
      const baoCaoMonAn = await BaoCaoChiTietMonAnService.getBaoCaoMonAnById(id);
      return res.json(ResponseUtils.success(baoCaoMonAn));
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  static async updateBaoCaoMonAn(req, res, next) {
    try {
      const { id } = req.params;
      const { baocao_id, monan_id, so_luong, tong_doanh_thu_mon } = req.body;
      const updatedBaoCaoMonAn = await BaoCaoChiTietMonAnService.updateBaoCaoMonAn(id, {
        baocao_id,
        monan_id,
        so_luong,
        tong_doanh_thu_mon,
      });
      return res.json(ResponseUtils.success(updatedBaoCaoMonAn, 'Cập nhật chi tiết báo cáo thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async deleteBaoCaoMonAn(req, res, next) {
    try {
      const { id } = req.params;
      await BaoCaoChiTietMonAnService.deleteBaoCaoMonAn(id);
      return res.json(ResponseUtils.success(null, 'Xóa chi tiết báo cáo thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async getBestSellers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const bestSellers = await BaoCaoChiTietMonAnService.getBestSellers(limit);
      return res.json(ResponseUtils.success(bestSellers));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BaoCaoChiTietMonAnController;