const PhieuNhapHangService = require('../services/phieuNhapHang.service');
const ResponseUtils = require('../utils/response');

class PhieuNhapHangController {
  static async createPhieuNhapHang(req, res, next) {
    try {
      const phieuNhapHang = await PhieuNhapHangService.createPhieuNhapHang(req.body);
      return res.status(201).json(
        ResponseUtils.success(phieuNhapHang, 'Inventory receipt created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getPhieuNhapHangById(req, res, next) {
    try {
      const { id } = req.params;
      const phieuNhapHang = await PhieuNhapHangService.getPhieuNhapHangById(id);
      return res.status(200).json(
        ResponseUtils.success(phieuNhapHang, 'Inventory receipt retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllPhieuNhapHang(req, res, next) {
    try {
      const phieuNhapHangList = await PhieuNhapHangService.getAllPhieuNhapHang();
      return res.status(200).json(
        ResponseUtils.success(phieuNhapHangList, 'All inventory receipts retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updatePhieuNhapHang(req, res, next) {
    try {
      const { id } = req.params;
      const phieuNhapHang = await PhieuNhapHangService.updatePhieuNhapHang(id, req.body);
      return res.status(200).json(
        ResponseUtils.success(phieuNhapHang, 'Inventory receipt updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deletePhieuNhapHang(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PhieuNhapHangService.deletePhieuNhapHang(id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Inventory receipt deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhieuNhapHangController;