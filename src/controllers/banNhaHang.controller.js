// src/controllers/banNhaHang.controller.js
const BanNhaHangService = require('../services/banNhaHang.service');
const ResponseUtils = require('../utils/response');
const DateUtils = require('../utils/date');
const { schemas } = require('../middlewares/validate');

class BanNhaHangController {
  static async createBan(req, res, next) {
    try {
      const { ten_ban, khuvuc_id, trang_thai, qr_code_url } = req.body;
      const ban = await BanNhaHangService.createBan({
        ten_ban,
        khuvuc_id,
        trang_thai,
        qr_code_url,
      });
      return res.status(201).json(
        ResponseUtils.success(ban, 'Tạo bàn thành công', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getBanById(req, res, next) {
    try {
      const { ban_id } = req.params;
      const ban = await BanNhaHangService.getBanById(ban_id);
      return res.status(200).json(
        ResponseUtils.success(ban, 'Lấy thông tin bàn thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllBans(req, res, next) {
    try {
      const { khuvuc_id, trang_thai } = req.query;
      const bans = await BanNhaHangService.getAllBans({
        khuvuc_id: khuvuc_id ? parseInt(khuvuc_id) : undefined,
        trang_thai,
      });
      return res.status(200).json(
        ResponseUtils.success(bans, 'Lấy danh sách bàn thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateBan(req, res, next) {
    try {
      const { ban_id } = req.params;
      const { ten_ban, khuvuc_id, trang_thai, qr_code_url } = req.body;
      const updatedBan = await BanNhaHangService.updateBan(ban_id, {
        ten_ban,
        khuvuc_id,
        trang_thai,
        qr_code_url,
      });
      return res.status(200).json(
        ResponseUtils.success(updatedBan, 'Cập nhật bàn thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteBan(req, res, next) {
    try {
      const { ban_id } = req.params;
      await BanNhaHangService.deleteBan(ban_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Xóa bàn thành công')
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BanNhaHangController;