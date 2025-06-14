const KhachHangThanThietService = require('../services/KhachHangThanThietService');
const ResponseUtils = require('../utils/response');

class KhachHangThanThietController {
  static async createKhachHangThanThiet(req, res) {
    const khachHang = await KhachHangThanThietService.createKhachHangThanThiet(req.body);
    return res.status(201).json(ResponseUtils.success(khachHang, 'Loyal customer created successfully', 201));
  }

  static async getKhachHangThanThietById(req, res) {
    const khachHang = await KhachHangThanThietService.getKhachHangThanThietById(req.params.id);
    return res.status(200).json(ResponseUtils.success(khachHang));
  }

  static async getKhachHangThanThietByKhachhangId(req, res) {
    const khachHang = await KhachHangThanThietService.getKhachHangThanThietByKhachhangId(req.params.khachhang_id);
    return res.status(200).json(ResponseUtils.success(khachHang));
  }

  static async updateKhachHangThanThiet(req, res) {
    const khachHang = await KhachHangThanThietService.updateKhachHangThanThiet(req.params.id, req.body);
    return res.status(200).json(ResponseUtils.success(khachHang, 'Loyal customer updated successfully'));
  }

  static async deleteKhachHangThanThiet(req, res) {
    await KhachHangThanThietService.deleteKhachHangThanThiet(req.params.id);
    return res.status(200).json(ResponseUtils.success(null, 'Loyal customer deleted successfully'));
  }
}

module.exports = KhachHangThanThietController;