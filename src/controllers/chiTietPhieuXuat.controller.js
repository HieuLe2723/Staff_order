const ChiTietPhieuXuatService = require('../services/chiTietPhieuXuat.service');
const ResponseUtils = require('../utils/response');

class ChiTietPhieuXuatController {
  static async createChiTietPhieuXuat(req, res, next) {
    try {
      const chiTietPhieuXuat = await ChiTietPhieuXuatService.createChiTietPhieuXuat(req.body);
      return res.status(201).json(
        ResponseUtils.success(chiTietPhieuXuat, 'Inventory issue detail created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getChiTietPhieuXuatById(req, res, next) {
    try {
      const { id } = req.params;
      const chiTietPhieuXuat = await ChiTietPhieuXuatService.getChiTietPhieuXuatById(id);
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuXuat, 'Inventory issue detail retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllChiTietPhieuXuat(req, res, next) {
    try {
      const chiTietPhieuXuatList = await ChiTietPhieuXuatService.getAllChiTietPhieuXuat();
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuXuatList, 'All inventory issue details retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateChiTietPhieuXuat(req, res, next) {
    try {
      const { id } = req.params;
      const chiTietPhieuXuat = await ChiTietPhieuXuatService.updateChiTietPhieuXuat(id, req.body);
      return res.status(200).json(
        ResponseUtils.success(chiTietPhieuXuat, 'Inventory issue detail updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteChiTietPhieuXuat(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ChiTietPhieuXuatService.deleteChiTietPhieuXuat(id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Inventory issue detail deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChiTietPhieuXuatController;