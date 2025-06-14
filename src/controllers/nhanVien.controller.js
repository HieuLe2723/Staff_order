const NhanVienService = require('../services/nhanVien.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class NhanVienController {
  static async createNhanVien(req, res, next) {
    try {
      const nhanVien = await NhanVienService.createNhanVien(req.body);
      return res.status(201).json(
        ResponseUtils.success(nhanVien, 'Employee created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getNhanVien(req, res, next) {
    try {
      const nhanVien = await NhanVienService.getNhanVienById(req.params.nhanvien_id);
      return res.status(200).json(
        ResponseUtils.success(nhanVien, 'Employee retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateNhanVien(req, res, next) {
    try {
      const nhanVien = await NhanVienService.updateNhanVien(req.params.nhanvien_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(nhanVien, 'Employee updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteNhanVien(req, res, next) {
    try {
      await NhanVienService.deleteNhanVien(req.params.nhanvien_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Employee deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NhanVienController;