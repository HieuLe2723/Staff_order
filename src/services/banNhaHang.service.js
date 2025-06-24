// src/services/banNhaHang.service.js
const BanNhaHangModel = require('../models/banNhaHang.model');
const KhuVucModel = require('../models/khuVuc.model'); 
const pool = require('../config/db.config'); // Assuming you have a db config file

class BanNhaHangService {
  static async createBan({ ten_ban, khuvuc_id, trang_thai, qr_code_url }) {
    // Kiểm tra khu vực tồn tại
    if (khuvuc_id) {
      const khuVuc = await KhuVucModel.findById(khuvuc_id);
      if (!khuVuc) {
        throw new Error('Khu vực không tồn tại');
      }
    }

    // Kiểm tra tên bàn không trùng trong cùng khu vực
    const existingBan = await BanNhaHangModel.findAll({ khuvuc_id, ten_ban });
    if (existingBan.some(ban => ban.ten_ban === ten_ban)) {
      throw new Error('Tên bàn đã tồn tại trong khu vực này');
    }

    return await BanNhaHangModel.create({ ten_ban, khuvuc_id, trang_thai, qr_code_url });
  }

  static async getBanById(ban_id) {
    return await BanNhaHangModel.findById(ban_id);
  }

  static async getAllBans({ khuvuc_id, trang_thai }) {
    return await BanNhaHangModel.findAll({ khuvuc_id, trang_thai });
  }

  static async updateBan(ban_id, { ten_ban, khuvuc_id, trang_thai, qr_code_url }) {
    // Kiểm tra khu vực tồn tại
    if (khuvuc_id) {
      const khuVuc = await KhuVucModel.findById(khuvuc_id);
      if (!khuVuc) {
        throw new Error('Khu vực không tồn tại');
      }
    }

    // Kiểm tra tên bàn không trùng
    const existingBan = await BanNhaHangModel.findAll({ khuvuc_id, ten_ban });
    if (existingBan.some(ban => ban.ten_ban === ten_ban && ban.ban_id !== ban_id)) {
      throw new Error('Tên bàn đã tồn tại trong khu vực này');
    }

    return await BanNhaHangModel.update(ban_id, { ten_ban, khuvuc_id, trang_thai, qr_code_url });
  }

  static async deleteBan(ban_id) {
    // Kiểm tra bàn có đang được sử dụng hoặc đặt trước
    const datBan = await DatBanModel.findAll({ ban_id, trang_thai: 'DaXacNhan' });
    if (datBan.length > 0) {
      throw new Error('Không thể xóa bàn đang có đặt trước');
    }
    const phien = await PhienSuDungBanModel.findAll({ ban_id });
    if (phien.length > 0) {
      throw new Error('Không thể xóa bàn đang được sử dụng');
    }

    return await BanNhaHangModel.delete(ban_id);
  }

  // Lấy danh sách bàn kèm thông tin phiên
  static async getActiveBans() {
    const query = `
      SELECT b.ban_id, b.ten_ban, b.trang_thai, p.phien_id, p.thoi_gian_bat_dau,
        TIMESTAMPDIFF(MINUTE, p.thoi_gian_bat_dau, NOW()) AS so_phut_su_dung
      FROM BanNhaHang b
      LEFT JOIN PhienSuDungBan p ON b.ban_id = p.ban_id
      WHERE b.trang_thai = 'DangSuDung'
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
}

module.exports = BanNhaHangService;