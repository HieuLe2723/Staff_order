const KhuVucService = require('../services/KhuVucService');
const ResponseUtils = require('../utils/response');

class KhuVucController {
  static async createKhuVuc(req, res) {
    const khuVuc = await KhuVucService.createKhuVuc(req.body);
    return res.status(201).json(ResponseUtils.success(khuVuc, 'Zone created successfully', 201));
  }

  static async getKhuVucById(req, res) {
    const khuVuc = await KhuVucService.getKhuVucById(req.params.id);
    return res.status(200).json(ResponseUtils.success(khuVuc));
  }

  static async getAllKhuVuc(req, res) {
    const khuVucList = await KhuVucService.getAllKhuVuc();
    return res.status(200).json(ResponseUtils.success(khuVucList));
  }

  static async updateKhuVuc(req, res) {
    const khuVuc = await KhuVucService.updateKhuVuc(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(khuVuc, 'Zone updated successfully'));
  }

  static async deleteKhuVuc(req, res) {
    await KhuVucService.deleteKhuVuc(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Zone deleted successfully'));
  }
}

module.exports = KhuVucController;