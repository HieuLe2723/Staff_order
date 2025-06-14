const LichSuDongBoService = require('../services/LichSuDongBoService');
const ResponseUtils = require('../utils/response');

class LichSuDongBoController {
  static async createLichSuDongBo(req, res) {
    const lichSu = await LichSuDongBoService.createLichSuDongBo(req.body);
    return res.status(201).json(ResponseUtils.success(lichSu, 'Sync record created successfully', 201));
  }

  static async getLichSuDongBoById(req, res) {
    const lichSu = await LichSuDongBoService.getLichSuDongBoById(req.params.id);
    return res.status(200).json(ResponseUtils.success(lichSu));
  }

  static async updateLichSuDongBo(req, res) {
    const lichSu = await LichSuDongBoService.updateLichSuDongBo(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(lichSu, 'Sync record updated successfully'));
  }

  static async deleteLichSuDongBo(req, res) {
    await LichSuDongBoService.deleteLichSuDongBo(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Sync record deleted successfully'));
  }
}

module.exports = LichSuDongBoController;