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
      let { khachhang_id, ban_id, ban_ids, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai, ho_ten, so_dien_thoai } = req.body;

      // Nếu chưa có khachhang_id nhưng có số điện thoại hoặc tên thì kiểm tra trùng số điện thoại trước khi tạo mới
      if (!khachhang_id && (ho_ten || so_dien_thoai)) {
        const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model');
        let existingKhach = null;
        if (so_dien_thoai) {
          existingKhach = await ThongTinKhachHangModel.findByPhone(so_dien_thoai);
        }
        if (existingKhach) {
          khachhang_id = existingKhach.khachhang_id;
        } else {
          const newKhach = await ThongTinKhachHangModel.create({ ho_ten: ho_ten || '', so_dien_thoai: so_dien_thoai || '', email: null, quoc_tich: null, nhom_tuoi: null, loai_nhom: null });
          khachhang_id = newKhach.khachhang_id;
        }
      }
      if (Array.isArray(ban_ids) && ban_ids.length > 0) {
        // Đặt nhiều bàn: tạo 1 phiên sử dụng bàn cho nhiều bàn
        const sanitizedData = {
          khachhang_id,
          ban_ids,
          so_khach,
          so_tien_coc,
          thoi_gian_dat: DateUtils.formatDate(thoi_gian_dat),
          ghi_chu: HelperUtils.sanitizeString(ghi_chu),
          trang_thai,
        };
        const datBan = await DatBanService.createDatBanGroup(sanitizedData, req.user);
        // Tạo 1 phiên sử dụng bàn cho nhiều bàn
        const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
        const phienSuDungBan = await PhienSuDungBanModel.createFromDatBanMulti(datBan.datban_id, ban_ids, khachhang_id);
        // Lấy lại object đặt bàn đã có ban_ids và bổ sung phien_id
        const resultObj = {
          ...datBan,
          ban_ids: Array.isArray(datBan.ban_ids) ? datBan.ban_ids : [],
          phien_id: phienSuDungBan.phien_id
        };
        console.log('DEBUG trả về:', resultObj);
        return res.status(201).json(ResponseUtils.success(resultObj, 'Đặt nhiều bàn thành công', 201));
      } else {
        // Đặt 1 bàn (tương thích cũ)
        const sanitizedData = {
          khachhang_id,
          ban_id,
          so_khach,
          so_tien_coc,
          thoi_gian_dat: DateUtils.formatDate(thoi_gian_dat),
          ghi_chu: HelperUtils.sanitizeString(ghi_chu),
          trang_thai,
        };
        const datBan = await DatBanService.createDatBan(sanitizedData, req.user);
        // Always return a single object with all fields present
        const resultObj = {
          datban_id: datBan.datban_id ?? 0,
          khachhang_id: datBan.khachhang_id ?? null,
          ban_id: datBan.ban_id ?? null,
          ban_ids: Array.isArray(datBan.ban_ids) ? datBan.ban_ids : [],
          so_khach: datBan.so_khach ?? 0,
          thoi_gian_dat: datBan.thoi_gian_dat ?? '',
          ghi_chu: datBan.ghi_chu ?? '',
          trang_thai: datBan.trang_thai ?? '',
          ngay_tao: datBan.ngay_tao ? (typeof datBan.ngay_tao === 'string' ? datBan.ngay_tao : new Date(datBan.ngay_tao).toISOString()) : new Date().toISOString(),
        };
        // Tạo phiên sử dụng bàn sau khi đặt bàn thành công
        const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
        const phienSuDungBan = await PhienSuDungBanModel.createFromDatBan(datBan.datban_id, datBan.ban_id, datBan.khachhang_id);
        resultObj.phien_id = phienSuDungBan.phien_id;

        return res.status(201).json(ResponseUtils.success(resultObj, 'Đặt bàn thành công', 201));
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
      let datBans = await DatBanService.getAllDatBan(filters);
      // Đảm bảo mỗi object đều có phien_id (kể cả khi ban_id null)
      const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
      datBans = await Promise.all(datBans.map(async (item) => {
        // Tìm phiên sử dụng bàn theo datban_id
        const phien = await PhienSuDungBanModel.findByDatBanId(item.datban_id);
        return {
          ...item,
          phien_id: phien ? phien.phien_id : null
        };
      }));
      return res.json(ResponseUtils.success(datBans));
    } catch (err) {
      next(err);
    }
  }

  static async updateDatBan(req, res, next) {
    try {
      const { id } = req.params;
      const { khachhang_id, ban_id, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai } = req.body;
      const sanitizedData = {
        khachhang_id,
        ban_id,
        so_khach,
        so_tien_coc,
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

  static async datCoc(req, res, next) {
    try {
      const { datban_id, so_tien_coc } = req.body;
      const DatBanModel = require('../models/datBan.model');

      // Cập nhật số tiền đặt cọc và thời gian đặt cọc
      await DatBanModel.updateTienDatCoc(datban_id, so_tien_coc);
      await DatBanModel.updateThoiGianDatCoc(datban_id, new Date());

      res.json({ success: true, message: 'Đã đặt cọc thành công.' });
    } catch (err) {
      next(err);
    }
  }

  static async thanhToanDatCoc(req, res, next) {
    try {
      const { datban_id } = req.body;
      const DatBanModel = require('../models/datBan.model');

      // Cập nhật trạng thái thanh toán
      await DatBanModel.updateTrangThai(datban_id, 'DaThanhToan');

      res.json({ success: true, message: 'Thanh toán đặt cọc thành công.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DatBanController;