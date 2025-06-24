const MonAnService = require('../services/MonAnService');
const ResponseUtils = require('../utils/response');

class MonAnController {
  static async getMonAnByLoaiId(req, res) {
    const { loai_id } = req.query;
    if (!loai_id) {
      return res.status(400).json({ success: false, message: 'Thiếu loai_id' });
    }
    try {
      const ds = await MonAnService.getMonAnByLoaiId(Number(loai_id));
      return res.status(200).json({ success: true, data: ds });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
  static async createMonAn(req, res) {
    const monAn = await MonAnService.createMonAn(req.body);
    return res.status(201).json(ResponseUtils.success(monAn, 'Dish created successfully', 201));
  }

  static async getMonAnById(req, res) {
    const monAn = await MonAnService.getMonAnById(req.params.id);
    return res.status(200).json(ResponseUtils.success(monAn));
  }

  static async updateMonAn(req, res) {
    const monAn = await MonAnService.updateMonAn(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(monAn, 'Dish updated successfully'));
  }

  static async deleteMonAn(req, res) {
    await MonAnService.deleteMonAn(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Dish deleted successfully'));
  }
}

module.exports = MonAnController;