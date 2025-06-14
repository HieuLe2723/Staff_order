// src/controllers/danhGia.controller.js
const DanhGiaService = require('../services/danhGia.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class DanhGiaController {
  static async createDanhGia(req, res, next) {
    try {
      const { nhanvien_id, khachhang_id, phien_id, diem_so, binh_luan } = req.body;
      const sanitizedData = {
        nhanvien_id,
        khachhang_id,
        phien_id,
        diem_so,
        binh_luan: HelperUtils.sanitizeString(binh_luan),
      };
      const danhGia = await DanhGiaService.createDanhGia(sanitizedData, req.user);
      return res.status(201).json(ResponseUtils.success(danhGia, 'Tạo đánh giá thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getDanhGiaById(req, res, next) {
    try {
      const { id } = req.params;
      const danhGia = await DanhGiaService.getDanhGiaById(id);
      return res.json(ResponseUtils.success(danhGia));
    } catch (err) {
      next(err);
    }
  }

  static async deleteDanhGia(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DanhGiaService.deleteDanhGia(id, req.user);
      return res.json(ResponseUtils.success(result, 'Xóa đánh giá thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DanhGiaController;