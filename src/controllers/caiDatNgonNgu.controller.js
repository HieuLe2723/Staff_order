// src/controllers/caiDatNgonNgu.controller.js
const CaiDatNgonNguService = require('../services/caiDatNgonNgu.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class CaiDatNgonNguController {
  static async createNgonNgu(req, res, next) {
    try {
      const { ma_ngon_ngu, ten_ngon_ngu } = req.body;
      const sanitizedData = {
        ma_ngon_ngu: HelperUtils.sanitizeString(ma_ngon_ngu),
        ten_ngon_ngu: HelperUtils.sanitizeString(ten_ngon_ngu),
      };
      const ngonNgu = await CaiDatNgonNguService.createNgonNgu(sanitizedData);
      return res.status(201).json(ResponseUtils.success(ngonNgu, 'Tạo ngôn ngữ thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getNgonNguById(req, res, next) {
    try {
      const { id } = req.params;
      const ngonNgu = await CaiDatNgonNguService.getNgonNguById(id);
      return res.json(ResponseUtils.success(ngonNgu));
    } catch (err) {
      next(err);
    }
  }

  static async updateNgonNgu(req, res, next) {
    try {
      const { id } = req.params;
      const { ten_ngon_ngu } = req.body;
      const updatedNgonNgu = await CaiDatNgonNguService.updateNgonNgu(id, {
        ten_ngon_ngu: HelperUtils.sanitizeString(ten_ngon_ngu),
      });
      return res.json(ResponseUtils.success(updatedNgonNgu, 'Cập nhật ngôn ngữ thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async deleteNgonNgu(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CaiDatNgonNguService.deleteNgonNgu(id);
      return res.json(ResponseUtils.success(result, 'Xóa ngôn ngữ thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CaiDatNgonNguController;