const MonAnNguyenLieuService = require('../services/MonAnNguyenLieuService');
const ResponseUtils = require('../utils/response');

class MonAnNguyenLieuController {
  static async createMonAnNguyenLieu(req, res) {
    const link = await MonAnNguyenLieuService.createMonAnNguyenLieu(req.body);
    return res.status(201).json(ResponseUtils.success(link, 'Dish-material link created successfully', 201));
  }

  static async getMonAnNguyenLieuByMonanId(req, res) {
    const links = await MonAnNguyenLieuService.getMonAnNguyenLieuByMonanId(req.params.monan_id);
    return res.status(200).json(ResponseUtils.success(links));
  }

  static async deleteMonAnNguyenLieu(req, res) {
    await MonAnNguyenLieuService.deleteMonAnNguyenLieu(req.params.monan_id, req.params.nguyenlieu_id);
    return res.status(200).json(ResponseUtils.success(null, 'Dish-material link deleted successfully'));
  }
}

module.exports = MonAnNguyenLieuController;