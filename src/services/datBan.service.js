// src/services/datBan.service.js
const DatBanModel = require('../models/datBan.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model'); // Giả sử model ThongTinKhachHang
const BanNhaHangModel = require('../models/banNhaHang.model');

class DatBanService {
  // Tạo đơn đặt bàn group (nhiều bàn)
  static async createDatBanGroup({ khachhang_id, ban_ids, so_khach, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    if (!['Khach Hang', 'Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ khách hàng, nhân viên hoặc quản lý mới có thể đặt bàn');
    }
    // Kiểm tra trạng thái từng bàn
    for (const ban_id of ban_ids) {
      const ban = await BanNhaHangModel.findById(ban_id);
      if (ban.trang_thai !== 'SanSang') {
        throw new Error(`Bàn ${ban_id} không khả dụng để đặt`);
      }
    }
    // Tạo 1 record DatBan (ban_id=null)
    const datBan = await DatBanModel.create({
      khachhang_id,
      ban_id: null,
      so_khach,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });
    // Thêm từng bàn vào DatBan_Ban và cập nhật trạng thái
    for (const ban_id of ban_ids) {
      await DatBanModel.addBanToDatBan(datBan.datban_id, ban_id);
      const ban = await BanNhaHangModel.findById(ban_id);
      await BanNhaHangModel.update(ban_id, {
        ten_ban: ban.ten_ban,
        khuvuc_id: ban.khuvuc_id,
        trang_thai: 'DaDat',
        qr_code_url: ban.qr_code_url
      });
    }
    datBan.ban_ids = ban_ids;
    return datBan;
  }

  static async createDatBan({ khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    // Kiểm tra quyền
    if (!['Khach Hang', 'Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ khách hàng, nhân viên hoặc quản lý mới có thể đặt bàn');
    }

    // Kiểm tra bàn trống
    const ban = await BanNhaHangModel.findById(ban_id);
    if (ban.trang_thai !== 'SanSang') {
      throw new Error('Bàn không khả dụng để đặt');
    }

    const datBan = await DatBanModel.create({
      khachhang_id,
      ban_id,
      so_khach,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });

    // Cập nhật trạng thái bàn thành 'DaDat'
    await BanNhaHangModel.update(ban_id, { 
      ten_ban: ban.ten_ban, 
      khuvuc_id: ban.khuvuc_id, 
      trang_thai: 'DaDat', 
      qr_code_url: ban.qr_code_url
    });

    return datBan;
  }

  static async getDatBanById(datban_id) {
    return await DatBanModel.findById(datban_id);
  }

  static async getAllDatBan({ khachhang_id, ban_id, trang_thai, search }) {
    if (search) {
      return await DatBanModel.findAllWithSearch({ khachhang_id, ban_id, trang_thai, search });
    }
    return await DatBanModel.findAll({ khachhang_id, ban_id, trang_thai });
  }

  static async updateDatBan(datban_id, { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể cập nhật đặt bàn');
    }

    return await DatBanModel.update(datban_id, {
      khachhang_id,
      ban_id,
      so_khach,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });
  }

  static async deleteDatBan(datban_id, user) {
    if (!['Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ quản lý mới có thể xóa đặt bàn');
    }

    return await DatBanModel.delete(datban_id);
  }

  static async ganKhachHang(datban_id, khachhang_id, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể gán khách hàng cho đặt bàn');
    }
    // Kiểm tra khách hàng tồn tại
    const [khachHang] = await ThongTinKhachHangModel.findById(khachhang_id);
    if (!khachHang) {
      throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    }
    // Cập nhật đặt bàn
    return await DatBanModel.update(datban_id, { khachhang_id });
  }
}

module.exports = DatBanService;