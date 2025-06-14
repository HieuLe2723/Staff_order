const PhieuXuatHangService = require('../services/phieuXuatHang.service');
const ResponseUtils = require('../utils/response');

class PhieuXuatHangController {
  static async createPhieuXuatHang(req, res, next) {
    try {
      const phieuXuatHang = await PhieuXuatHangService.createPhieuXuatHang(req.body);
      return res.status(201).json(
        ResponseUtils.success(phieuXuatHang, 'Inventory issue created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getPhieuXuatHangById(req, res, next) {
    try {
      const { id } = req.params;
      const phieuXuatHang = await PhieuXuatHangService.getPhieuXuatHangById(id);
      return res.status(200).json(
        ResponseUtils.success(phieuXuatHang, 'Inventory issue retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllPhieuXuatHang(req, res, next) {
    try {
      const phieuXuatHangList = await PhieuXuatHangService.getAllPhieuXuatHang();
      return res.status(200).json(
        ResponseUtils.success(phieuXuatHangList, 'All inventory issues retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updatePhieuXuatHang(req, res, next) {
    try {
      const { id } = req.params;
      const phieuXuatHang = await PhieuXuatHangService.updatePhieuXuatHang(id, req.body);
      return res.status(200).json(
        ResponseUtils.success(phieuXuatHang, 'Inventory issue updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deletePhieuXuatHang(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PhieuXuatHangService.deletePhieuXuatHang(id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Inventory issue deleted successfully')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PhieuXuatHangController;