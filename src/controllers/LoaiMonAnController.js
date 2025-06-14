const LoaiMonAnService = require('../services/LoaiMonAnService');
const ResponseUtils = require('../utils/response');

class LoaiMonAnController {
  static async createLoaiMonAn(req, res) {
    const loaiMonAn = await LoaiMonAnService.createLoaiMonAn(req.body);
    return res.status(201).json(ResponseUtils.success(loaiMonAn, 'Dish category created successfully', 201));
  }

  static async getAllLoaiMonAn(req, res) {
    const loaiMonAnList = await LoaiMonAnService.getAllLoaiMonAn();
    return res.status(200).json(ResponseUtils.success(loaiMonAnList));
  }

  static async getLoaiMonAnById(req, res) {
    const loaiMonAn = await LoaiMonAnService.getLoaiMonAnById(req.params.id);
    return res.status(200).json(ResponseUtils.success(loaiMonAn));
  }

  static async deleteLoaiMonAn(req, res) {
    await LoaiMonAnService.deleteLoaiMonAn(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Dish category deleted successfully'));
  }
}

module.exports = LoaiMonAnController;