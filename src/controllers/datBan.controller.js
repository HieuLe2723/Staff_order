// src/controllers/datBan.controller.js
const DatBanService = require('../services/datBan.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');
const DateUtils = require('../utils/date');

class DatBanController {
  static async createDatBan(req, res, next) {
    try {
      const { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai } = req.body;
      const sanitizedData = {
        khachhang_id,
        ban_id,
        so_khach,
        thoi_gian_dat: DateUtils.formatDate(thoi_gian_dat),
        ghi_chu: HelperUtils.sanitizeString(ghi_chu),
        trang_thai,
      };
      const datBan = await DatBanService.createDatBan(sanitizedData, req.user);
      return res.status(201).json(ResponseUtils.success(datBan, 'Đặt bàn thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getDatBanById(req, res, next) {
    try {
      const { id } = req.params;
      const datBan = await DatBanService.getDatBanById(id);
      return res.json(ResponseUtils.success(datBan));
    } catch (err) {
      next(err);
    }
  }

  static async getAllDatBan(req, res, next) {
    try {
      const { khachhang_id, ban_id, trang_thai } = req.query;
      const filters = {
        khachhang_id,
        ban_id,
        trang_thai: HelperUtils.sanitizeString(trang_thai),
      };
      const datBans = await DatBanService.getAllDatBan(filters);
      return res.json(ResponseUtils.success(datBans));
    } catch (err) {
      next(err);
    }
  }

  static async updateDatBan(req, res, next) {
    try {
      const { id } = req.params;
      const { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai } = req.body;
      const sanitizedData = {
        khachhang_id,
        ban_id,
        so_khach,
        thoi_gian_dat: DateUtils.formatDate(thoi_gian_dat),
        ghi_chu: HelperUtils.sanitizeString(ghi_chu),
        trang_thai,
      };
      const updatedDatBan = await DatBanService.updateDatBan(id, sanitizedData, req.user);
      return res.json(ResponseUtils.success(updatedDatBan, 'Cập nhật đặt bàn thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async deleteDatBan(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DatBanService.deleteDatBan(id, req.user);
      return res.json(ResponseUtils.success(result, 'Xóa đặt bàn thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DatBanController;