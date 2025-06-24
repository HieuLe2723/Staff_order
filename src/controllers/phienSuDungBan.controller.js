const PhienSuDungBanService = require('../services/phienSuDungBan.service');
const ResponseUtils = require('../utils/response');
const { validate, schemas } = require('../middlewares/validate');

class PhienSuDungBanController {
  // API trả về danh sách loại khách
  static async getLoaiKhach(req, res, next) {
    try {
      const ds = [
        { value: 'KhachLe', label: 'Khách lẻ' },
        { value: 'KhachDoan', label: 'Khách đoàn' },
        { value: 'KhachDatTruoc', label: 'Khách đặt trước' }
      ];
      return res.json({ success: true, data: ds });
    } catch (err) {
      next(err);
    }
  }

  // API trả về danh sách loại menu
  static async getLoaiMenu(req, res, next) {
    try {
      const ds = [
        { value: 'ALaCarte', label: 'ALaCarte' },
        { value: 'Buffet', label: 'Buffet' },
        { value: 'SetMenu', label: 'Set Menu' }
      ];
      return res.json({ success: true, data: ds });
    } catch (err) {
      next(err);
    }
  }

  static async applyPromotion(req, res, next) {
    try {
      const { phien_id } = req.params;
      const { ma_code } = req.body;
      if (!ma_code) {
        return res.status(400).json(ResponseUtils.error('`ma_code` is required.'));
      }
      const result = await PhienSuDungBanService.applyPromotion(phien_id, ma_code);
      return res.json(ResponseUtils.success(result, 'Áp dụng mã khuyến mãi thành công.'));
    } catch (err) {
      next(err);
    }
  }

  // API tự động kiểm tra và hủy phiên nếu tất cả order đều rỗng
  static async autoCancelIfEmpty(req, res, next) {
    try {
      const { phien_id } = req.params;
      const DonHangModel = require('../models/donHang.model');
      const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
      const PhienSuDungBanService = require('../services/phienSuDungBan.service');
      const orders = await DonHangModel.findAll({ phien_id });
      let allEmpty = true;
      for (const order of orders) {
        const items = await ChiTietDonHangModel.findAll({ donhang_id: order.donhang_id });
        if (items.length > 0) {
          allEmpty = false;
          break;
        }
      }
      if (allEmpty) {
        await PhienSuDungBanService.deletePhien(phien_id);
        return res.json({ success: true, message: 'Đã hủy phiên vì tất cả order đều rỗng' });
      } else {
        return res.status(400).json({ success: false, message: 'Không thể hủy phiên: vẫn còn order có món' });
      }
    } catch (err) {
      next(err);
    }
  }
  static async createPhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.createPhien(req.body);
      return res.status(201).json(
        ResponseUtils.success(phien, 'Table session created successfully', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getActivePhienByBanId(req, res, next) {
    try {
      const { ban_id } = req.params;
      const phien = await PhienSuDungBanService.getActivePhienByBanId(ban_id);
      if (!phien) {
        return res.status(404).json(ResponseUtils.error('Không tìm thấy phiên hoạt động cho bàn này.'));
      }
      return res.json(ResponseUtils.success(phien));
    } catch (err) {
      next(err);
    }
  }

  static async getPhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.getPhienById(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(phien, 'Table session retrieved successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updatePhien(req, res, next) {
    try {
      const phien = await PhienSuDungBanService.updatePhien(req.params.phien_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(phien, 'Table session updated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllItemsInPhien(req, res, next) {
    try {
      const { phien_id } = req.params;
      const items = await PhienSuDungBanService.getAllItemsInPhien(phien_id);
      return res.json(ResponseUtils.success(items));
    } catch (err) {
      next(err);
    }
  }

  static async calculateBill(req, res, next) {
    try {
      const bill = await PhienSuDungBanService.calculateBill(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(bill, 'Bill calculated successfully')
      );
    } catch (err) {
      next(err);
    }
  }

  static async cancelEmptyPhien(req, res, next) {
    try {
      await PhienSuDungBanService.cancelEmptyPhien(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Phiên rỗng đã được hủy thành công.')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deletePhien(req, res, next) {
    try {
      await PhienSuDungBanService.deletePhien(req.params.phien_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Table session deleted successfully')
      );
    } catch (err) {
      if (err.message && err.message.includes('order chưa rỗng')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
}

module.exports = PhienSuDungBanController;