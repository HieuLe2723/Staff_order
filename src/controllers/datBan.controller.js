// src/controllers/datBan.controller.js
const DatBanService = require('../services/datBan.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');
const DateUtils = require('../utils/date');

class DatBanController {
  static async huyDatBan(req, res, next) {
    try {
      const { id } = req.params;
      // Lấy thông tin đặt bàn
      const datBan = await DatBanService.getDatBanById(id);
      if (!datBan) return res.status(404).json({ message: 'Không tìm thấy đặt bàn' });

      // Cập nhật trạng thái đặt bàn
      await DatBanService.updateDatBan(id, { trang_thai: 'DaHuy' }, req.user);

      // Lấy toàn bộ bàn thuộc đơn đặt này (group)
      const DatBanModel = require('../models/datBan.model');
      const banIds = await DatBanModel.getBanIdsByDatBanId(id);
      const BanNhaHangModel = require('../models/banNhaHang.model');
      for (const ban_id of banIds) {
        await BanNhaHangModel.update(ban_id, { trang_thai: 'SanSang' });
      }

      res.json({ success: true, message: 'Đã hủy đặt bàn và cập nhật trạng thái các bàn.' });
    } catch (err) {
      next(err);
    }
  }

  static async createDatBan(req, res, next) {
    try {
      const { khachhang_id, ban_id, ban_ids, so_khach, thoi_gian_dat, ghi_chu, trang_thai } = req.body;
      if (Array.isArray(ban_ids) && ban_ids.length > 0) {
        // Đặt nhiều bàn: chuẩn hóa, chỉ tạo 1 mã đặt bàn, lưu vào bảng phụ
        const sanitizedData = {
          khachhang_id,
          ban_ids,
          so_khach,
          thoi_gian_dat: DateUtils.formatDate(thoi_gian_dat),
          ghi_chu: HelperUtils.sanitizeString(ghi_chu),
          trang_thai,
        };
        const datBan = await DatBanService.createDatBanGroup(sanitizedData, req.user);
        return res.status(201).json(ResponseUtils.success(datBan, 'Đặt nhiều bàn thành công', 201));
      } else {
        // Đặt 1 bàn (tương thích cũ)
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
      }
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
      const { khachhang_id, ban_id, trang_thai, search } = req.query;
      const filters = { khachhang_id, ban_id, trang_thai, search };
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

  static async ganKhachHang(req, res, next) {
    try {
      const { id } = req.params;
      const { khachhang_id } = req.body;
      if (!khachhang_id) {
        return res.status(400).json({ success: false, message: 'Thiếu khachhang_id' });
      }
      const updatedDatBan = await DatBanService.ganKhachHang(id, khachhang_id, req.user);
      return res.json(ResponseUtils.success(updatedDatBan, 'Gán khách hàng cho đặt bàn thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DatBanController;