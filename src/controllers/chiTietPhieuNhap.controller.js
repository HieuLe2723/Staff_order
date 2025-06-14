const ChiTietPhieuNhapService = require('../services/chiTietPhieuNhap.service');
const ResponseUtils = require('../utils/response');

class ChiTietPhieuNhapController {
  static async createChiTietPhieuNhap(req, res, next) {
    try {
      const chiTietPhieuNhap = await ChiTietPhieuNhapService.createChiTietPhieuNhap(req.body);
      return res.status(201).json(
        ResponseUtils.success(chiTietPhieuNhap, 'Inventory receipt detail created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getChiTietPhieuNhapById(req, res, next) {
    try {
      const { id } = req.params;
      const chiTietPhieuNhap = await ChiTietPhieuNhapService.getChiTietPhieuNhapById(id);
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuNhap, 'Inventory receipt detail retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllChiTietPhieuNhap(req, res, next) {
    try {
      const chiTietPhieuNhapList = await ChiTietPhieuNhapService.getAllChiTietPhieuNhap();
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuNhapList, 'All inventory receipt details retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateChiTietPhieuNhap(req, res, next) {
    try {
      const { id } = req.params;
      const chiTietPhieuNhap = await ChiTietPhieuNhapService.updateChiTietPhieuNhap(id, req.body);
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuNhap, 'Inventory receipt detail updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteChiTietPhieuNhap(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ChiTietPhieuNhapService.deleteChiTietPhieuNhap(id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Inventory receipt detail deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChiTietPhieuNhapController;