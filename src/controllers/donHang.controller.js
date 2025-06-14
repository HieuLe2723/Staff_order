// src/controllers/donHang.controller.js
const DonHangService = require('../services/donHang.service');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

class DonHangController {
  static async createDonHang(req, res, next) {
    try {
      const { phien_id, khuyenmai_id, loai_menu, hanh_dong, mo_ta_hanh_dong } = req.body;
      const sanitizedData = {
        phien_id,
        khuyenmai_id,
        loai_menu: HelperUtils.sanitizeString(loai_menu),
        hanh_dong: HelperUtils.sanitizeString(hanh_dong),
        mo_ta_hanh_dong: HelperUtils.sanitizeString(mo_ta_hanh_dong),
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
      next(err);
    }
  }

  static async updateDonHang(req, res, next) {
    try {
      const { id } = req.params;
      const { phien_id, loai_menu, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong } = req.body;
      const sanitizedData = {
        phien_id,
        loai_menu: HelperUtils.sanitizeString(loai_menu),
        khuyenmai_id,
        gia_tri_giam,
        tong_tien,
        trang_thai,
        hanh_dong: HelperUtils.sanitizeString(hanh_dong),
        mo_ta_hanh_dong: HelperUtils.sanitizeString(mo_ta_hanh_dong),
      };
      const updatedDonHang = await DonHangService.updateDonHang(id, sanitizedData, req.user);
      return res.json(ResponseUtils.success(updatedDonHang, 'Cập nhật đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }

  static async deleteDonHang(req, res, next) {
    try {
      const { id } = req.params;
      const result = await DonHangService.deleteDonHang(id, req.user);
      return res.json(ResponseUtils.success(result, 'Xóa đơn hàng thành công'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DonHangController;