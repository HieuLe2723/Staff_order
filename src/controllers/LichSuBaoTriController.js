const LichSuBaoTriService = require('../services/LichSuBaoTriService');
const ResponseUtils = require('../utils/response');

class LichSuBaoTriController {
  static async createLichSuBaoTri(req, res) {
    const lichSu = await LichSuBaoTriService.createLichSuBaoTri(req.body);
    return res.status(201).json(ResponseUtils.success(lichSu, 'Maintenance record created successfully', 201));
  }

  static async getLichSuBaoTriById(req, res) {
    const lichSu = await LichSuBaoTriService.getLichSuBaoTriById(req.params.id);
    return res.status(200).json(ResponseUtils.success(lichSu));
  }

  static async updateLichSuBaoTri(req, res) {
    const lichSu = await LichSuBaoTriService.updateLichSuBaoTri(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(lichSu, 'Maintenance record updated successfully'));
  }

  static async deleteLichSuBaoTri(req, res) {
    await LichSuBaoTriService.deleteLichSuBaoTri(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Maintenance record deleted successfully'));
  }
}

module.exports = LichSuBaoTriController;