const KhuyenMaiService = require('../services/KhuyenMaiService');
const ResponseUtils = require('../utils/response');

class KhuyenMaiController {
  static async createKhuyenMai(req, res) {
    const khuyenMai = await KhuyenMaiService.createKhuyenMai(req.body);
    return res.status(201).json(ResponseUtils.success(khuyenMai, 'Promotion created successfully', 201));
  }

  static async getKhuyenMaiByCode(req, res) {
    const khuyenMai = await KhuyenMaiService.getKhuyenMaiByCode(req.params.code);
    return res.status(200).json(ResponseUtils.success(khuyenMai));
  }

  static async getAllKhuyenMai(req, res) {
    const { activeOnly } = req.query;
    const khuyenMaiList = await KhuyenMaiService.getAllKhuyenMai({ activeOnly: activeOnly === 'true' });
    return res.status(200).json(ResponseUtils.success(khuyenMaiList));
  }

  static async updateKhuyenMai(req, res) {
    const khuyenMai = await KhuyenMaiService.updateKhuyenMai(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(khuyenMai, 'Promotion updated successfully'));
  }

  static async deleteKhuyenMai(req, res) {
    await KhuyenMaiService.deleteKhuyenMai(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Promotion deleted successfully'));
  }
}

module.exports = KhuyenMaiController;