const NguyenLieuService = require('../services/NguyenLieuService');
const ResponseUtils = require('../utils/response');

class NguyenLieuController {
  static async createNguyenLieu(req, res) {
    const nguyenLieu = await NguyenLieuService.createNguyenLieu(req.body);
    return res.status(201).json(ResponseUtils.success(nguyenLieu, 'Raw material created successfully', 201));
  }

  static async getNguyenLieuById(req, res) {
    const nguyenLieu = await NguyenLieuService.getNguyenLieuById(req.params.id);
    return res.status(200).json(ResponseUtils.success(nguyenLieu));
  }

  static async updateNguyenLieu(req, res) {
    const nguyenLieu = await NguyenLieuService.updateNguyenLieu(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(nguyenLieu, 'Raw material updated successfully'));
  }

  static async deleteNguyenLieu(req, res) {
    await NguyenLieuService.deleteNguyenLieu(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Raw material deleted successfully'));
  }
}

module.exports = NguyenLieuController;