// src/controllers/donHang.controller.js
const DonHangService = require('../services/donHang.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class DonHangController {
  // Thống kê thời gian ra món cho từng món trong order
  static async getOrderItemsServingStats(req, res, next) {
    try {
      const { id } = req.params;
      const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
      const items = await ChiTietDonHangModel.findAll({ donhang_id: id });
      // Giả định có trường thoi_gian_tao và thoi_gian_phuc_vu
      const result = items.map(item => {
        let wait_seconds = null;
        if (item.thoi_gian_tao && item.thoi_gian_phuc_vu) {
          wait_seconds = Math.floor((new Date(item.thoi_gian_phuc_vu) - new Date(item.thoi_gian_tao)) / 1000);
        }
        return {
          ...item,
          thoi_gian_goi_mon: item.thoi_gian_tao,
          thoi_gian_ra_mon: item.thoi_gian_phuc_vu,
          thoi_gian_cho_phuc_vu: wait_seconds
        };
      });
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
  // Cập nhật ghi chú cho món ăn trong order
  static async updateItemNote(req, res, next) {
    try {
      const { chitiet_id } = req.params;
      const { ghi_chu } = req.body;
      if (typeof ghi_chu !== 'string') {
        return res.status(400).json({ success: false, message: 'Ghi chú phải là chuỗi' });
      }
      const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
      const updated = await ChiTietDonHangModel.update(chitiet_id, { ghi_chu });
      return res.json({ success: true, data: updated, message: 'Cập nhật ghi chú thành công' });
    } catch (err) {
      next(err);
    }
  }
  // Kiểm tra order rỗng
  static async isOrderEmpty(req, res, next) {
    try {
      const { id } = req.params;
      const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
      const items = await ChiTietDonHangModel.findAll({ donhang_id: id });
      return res.json({ isEmpty: items.length === 0 });
    } catch (err) {
      next(err);
    }
  }
  static async createDonHang(req, res, next) {
    try {
      const {
        phien_id,
        loai_id,
        khuyenmai_id,
        hanh_dong,
        mo_ta_hanh_dong,
        gia_tri_giam = 0,
        tong_tien = 0,
        trang_thai = 'ChoXuLy',
        items
      } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Trường "items" là bắt buộc và phải là một mảng.' });
      }

      // Chuẩn hóa dữ liệu
      const sanitizedData = {
        phien_id: Number(phien_id),
        loai_id: loai_id ? Number(loai_id) : null, // THÊM LẠI: Đảm bảo loai_id được gửi đến service
        khuyenmai_id: khuyenmai_id ? Number(khuyenmai_id) : null,
        hanh_dong: hanh_dong ? HelperUtils.sanitizeString(hanh_dong) : null,
        mo_ta_hanh_dong: mo_ta_hanh_dong ? HelperUtils.sanitizeString(mo_ta_hanh_dong) : null,
        gia_tri_giam: Number(gia_tri_giam),
        tong_tien: Number(tong_tien),
        trang_thai: trang_thai,
        items: items.map(item => ({
          monan_id: Number(item.monan_id),
          so_luong: Number(item.so_luong),
          ghi_chu: item.ghi_chu ? HelperUtils.sanitizeString(item.ghi_chu) : null
        }))
      };

      const donHang = await DonHangService.createDonHang(sanitizedData, req.user);
      return res.status(201).json(ResponseUtils.success(donHang, 'Tạo đơn hàng thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  static async getDonHangById(req, res, next) {
    try {
      const { id } = req.params;
      const donHang = await DonHangService.getDonHangById(id);
      return res.json(ResponseUtils.success(donHang));
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ success: false, message: err.message });
      }
      next(err);
    }
  }

  static async getDonHangsByPhienId(req, res, next) {
    try {
      const { phien_id } = req.params;
      const orders = await DonHangService.getDonHangsByPhienId(Number(phien_id));

      if (!orders || orders.length === 0) {
        return res.json(ResponseUtils.success(null, 'Không tìm thấy đơn hàng nào cho phiên này.'));
      }
      
      return res.json(ResponseUtils.success(orders, 'Lấy danh sách đơn hàng theo phiên thành công.'));
    } catch (err) {
      next(err);
    }
  }

  static async updateDonHang(req, res, next) {
    try {
      const { id } = req.params;
      const {
        phien_id,
        loai_id,
        khuyenmai_id,
        hanh_dong,
        mo_ta_hanh_dong,
        gia_tri_giam,
        tong_tien,
        trang_thai
      } = req.body;

      // Validate bắt buộc
      if (phien_id !== undefined && !Number.isInteger(Number(phien_id))) {
        return res.status(400).json({ success: false, message: 'phien_id phải là số nguyên nếu truyền' });
      }
      if (loai_id !== undefined && !Number.isInteger(Number(loai_id))) {
        return res.status(400).json({ success: false, message: 'loai_id phải là số nguyên nếu truyền' });
      }
      if (khuyenmai_id !== undefined && khuyenmai_id !== null && !Number.isInteger(Number(khuyenmai_id))) {
        return res.status(400).json({ success: false, message: 'khuyenmai_id phải là số nguyên nếu truyền' });
      }
      if (hanh_dong !== undefined && hanh_dong !== null && typeof hanh_dong !== 'string') {
        return res.status(400).json({ success: false, message: 'hanh_dong phải là chuỗi nếu truyền' });
      }
      if (mo_ta_hanh_dong !== undefined && mo_ta_hanh_dong !== null && typeof mo_ta_hanh_dong !== 'string') {
        return res.status(400).json({ success: false, message: 'mo_ta_hanh_dong phải là chuỗi nếu truyền' });
      }
      if (gia_tri_giam !== undefined && isNaN(Number(gia_tri_giam))) {
        return res.status(400).json({ success: false, message: 'gia_tri_giam phải là số nếu truyền' });
      }
      if (tong_tien !== undefined && isNaN(Number(tong_tien))) {
        return res.status(400).json({ success: false, message: 'tong_tien phải là số nếu truyền' });
      }
      if (trang_thai !== undefined && typeof trang_thai !== 'string') {
        return res.status(400).json({ success: false, message: 'trang_thai phải là chuỗi nếu truyền' });
      }

      // Chuẩn hóa dữ liệu
      const sanitizedData = {};
      if (phien_id !== undefined) sanitizedData.phien_id = Number(phien_id);
      if (loai_id !== undefined) sanitizedData.loai_id = Number(loai_id);
      if (khuyenmai_id !== undefined) sanitizedData.khuyenmai_id = khuyenmai_id !== null ? Number(khuyenmai_id) : null;
      if (hanh_dong !== undefined) sanitizedData.hanh_dong = hanh_dong ? HelperUtils.sanitizeString(hanh_dong) : null;
      if (mo_ta_hanh_dong !== undefined) sanitizedData.mo_ta_hanh_dong = mo_ta_hanh_dong ? HelperUtils.sanitizeString(mo_ta_hanh_dong) : null;
      if (gia_tri_giam !== undefined) sanitizedData.gia_tri_giam = Number(gia_tri_giam);
      if (tong_tien !== undefined) sanitizedData.tong_tien = Number(tong_tien);
      if (trang_thai !== undefined) sanitizedData.trang_thai = trang_thai;

      const updatedDonHang = await DonHangService.updateDonHang(id, sanitizedData, req.user);
      return res.json(ResponseUtils.success(updatedDonHang, 'Cập nhật đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async deleteDonHang(req, res, next) {
    try {
      const { id } = req.params;
      const ifEmpty = req.query.ifEmpty === 'true' || req.query.ifEmpty === true;
      await DonHangService.deleteDonHang(id, req.user, { ifEmpty });
      return res.json(ResponseUtils.success(null, 'Xóa đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async getAlerts(req, res, next) {
    try {
      const alerts = await DonHangService.getAlerts();
      // Kết hợp tất cả các loại cảnh báo thành một mảng duy nhất
      const allAlerts = [
        ...alerts.pendingOrders,
        ...alerts.delayedDeliveries,
        ...alerts.highValueOrders
      ];
      // Sắp xếp theo thời gian từ mới đến cũ
      allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return res.json(ResponseUtils.success({
        alerts: allAlerts,
        counts: {
          pending: alerts.pendingOrders.length,
          delayed: alerts.delayedDeliveries.length,
          highValue: alerts.highValueOrders.length
        }
      }, 'Lấy danh sách cảnh báo thành công'));
    } catch (err) {
      next(err);
    }
  }

  // Lấy danh sách món của 1 order
  static async getOrderItems(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const items = await DonHangService.getOrderItems(id, status);
      // Đảm bảo trả về ghi_chu cho từng món
      const result = items.map(item => ({ ...item, ghi_chu: item.ghi_chu || '' }));
      return res.json(ResponseUtils.success(result, 'Lấy danh sách món của đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }

  // Thêm nhanh món vào đơn hàng
  static async addItemsToOrder(req, res, next) {
    try {
      const { id } = req.params; // donhang_id
      const { items } = req.body; // [{monan_id, so_luong, ghi_chu}]
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách món không hợp lệ' });
      }
      const result = await DonHangService.addItemsToOrder(id, items, req.user);
      return res.status(201).json(ResponseUtils.success(result, 'Thêm món vào đơn hàng thành công', 201));
    } catch (err) {
      next(err);
    }
  }

  // Hủy món khỏi đơn hàng
  static async cancelOrderItem(req, res, next) {
    try {
      const { chitiet_id } = req.params;
      const result = await DonHangService.cancelOrderItem(chitiet_id, req.user);
      return res.json(ResponseUtils.success(result, 'Hủy món khỏi đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }

  // Ra món (phục vụ)
  static async serveOrderItem(req, res, next) {
    try {
      const { chitiet_id } = req.params;
      const result = await require('../services/chiTietDonHang.service').serveDish(chitiet_id);
      return res.json(ResponseUtils.success(result, 'Món đã được phục vụ thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DonHangController;