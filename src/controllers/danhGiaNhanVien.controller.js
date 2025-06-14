// src/controllers/danhGiaNhanVien.controller.js
const DanhGiaNhanVienService = require('../services/danhGiaNhanVien.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class DanhGiaNhanVienController {
  static async createDanhGiaNhanVien(req, res, next) {
    try {
      const { nhanvien_id, thang, nam, diem_so, binh_luan } = req.body;
      const sanitizedData = {
        nhanvien_id,
        thang,
        nam,
        diem_so,
        binh_luan: HelperUtils.sanitizeString(binh_luan),
      };
      const danhGia = await DanhGiaNhanVienService.createDanhGiaNhanVien(sanitizedData, req.user);
      return res.status(201).json(ResponseUtils.success(danhGia, 'Tạo đánh giá nhân viên thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getDanhGiaNhanVienById(req, res, next) {
    try {
      const { id } = req.params;
      const danhGia = await DanhGiaNhanVienService.getDanhGiaNhanVienById(id);
      return res.json(ResponseUtils.success(danhGia));
    } catch (err) {
      next(err);
    }
  }

  static async deleteDanhGiaNhanVien(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DanhGiaNhanVienService.deleteDanhGiaNhanVien(id, req.user);
      return res.json(ResponseUtils.success(result, 'Xóa đánh giá nhân viên thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DanhGiaNhanVienController;