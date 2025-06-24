// src/controllers/banNhaHang.controller.js
const BanNhaHangService = require('../services/banNhaHang.service');
const ResponseUtils = require('../utils/response');
const DateUtils = require('../utils/date');
const { schemas } = require('../middlewares/validate');

class BanNhaHangController {
  // Danh sách bàn theo khu vực, kèm trạng_thai_ban và time_open_seconds
  static async getBansByKhuVuc(req, res, next) {
    try {
      const khuvuc_id = parseInt(req.params.id);
      if (isNaN(khuvuc_id)) {
        return res.status(400).json({ success: false, message: 'khuvuc_id không hợp lệ' });
      }
      // Lấy danh sách bàn trong khu vực
      const BanNhaHangModel = require('../models/banNhaHang.model');
      const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
      const bans = await BanNhaHangModel.findAll({ khuvuc_id });
      // Lấy các phiên đang mở cho các bàn này
      const banIds = bans.map(b => b.ban_id);
      let phienMap = {};
      if (banIds.length > 0) {
        const pool = require('../config/db.config');
        const [phienRows] = await pool.query(
          'SELECT ban_id, phien_id, thoi_gian_bat_dau FROM PhienSuDungBan WHERE ban_id IN (?) AND thoi_gian_ket_thuc IS NULL',
          [banIds]
        );
        phienMap = Object.fromEntries(phienRows.map(p => [p.ban_id, p]));
      }
      const now = new Date();
      const result = bans.map(ban => {
        const phien = phienMap[ban.ban_id];
        let time_open_seconds = null;
        if (phien && phien.thoi_gian_bat_dau) {
          const start = new Date(phien.thoi_gian_bat_dau);
          time_open_seconds = Math.floor((now - start) / 1000);
        }
        // Trạng thái của bàn được lấy trực tiếp từ database (ban.trang_thai)
        // để đảm bảo luôn chính xác (e.g., 'SanSang', 'DangSuDung', 'DaGoiMon').
        let trang_thai_ban = ban.trang_thai;
        let color = '#cccccc';
        let icon = 'table';
        if (trang_thai_ban === 'DangSuDung') {
          color = '#ff9800'; icon = 'table-occupied';
        } else if (trang_thai_ban === 'SanSang') {
          color = '#4caf50'; icon = 'table-ready';
        } else if (trang_thai_ban === 'DaDat') {
          color = '#2196f3'; icon = 'table-booked';
        }
        return {
          ...ban,
          trang_thai_ban,
          time_open_seconds,
          color,
          icon
        };
      });
      return res.json(require('../utils/response').success(result, 'Lấy danh sách bàn theo khu vực thành công'));
    } catch (err) {
      next(err);
    }
  }
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

  // Lấy danh sách bàn kèm thông tin phiên
  static async getActiveBans(req, res, next) {
    try {
      const bans = await BanNhaHangService.getActiveBans();
      return res.json(ResponseUtils.success(bans, 'Lấy danh sách bàn đang hoạt động thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BanNhaHangController;