// src/services/datBan.service.js
const DatBanModel = require('../models/datBan.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model'); // Giả sử model ThongTinKhachHang
const BanNhaHangModel = require('../models/banNhaHang.model');
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');
const DateUtils = require('../utils/date');
const nodeSchedule = require('node-schedule');

class DatBanService {
  // Tạo đơn đặt bàn group (nhiều bàn)
  static async createDatBanGroup({ khachhang_id, ban_ids, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai }, user) {
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
      so_tien_coc,
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

  static async createDatBan({ khachhang_id, ban_id, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai }, user) {
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
      so_tien_coc,
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

  static async updateDatBan(datban_id, { khachhang_id, ban_id, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai }, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể cập nhật đặt bàn');
    }

    return await DatBanModel.update(datban_id, {
      khachhang_id,
      ban_id,
      so_khach,
      so_tien_coc,
      thoi_gian_dat,
      ghi_chu,
      trang_thai,
    });
  }

  static async deleteDatBan(datban_id, user) {
    // Không phân biệt quyền, ai cũng được phép xóa (theo yêu cầu mới)
    // Chỉ cập nhật trạng thái đặt bàn thành 'DaHuy', không xóa cứng
    const datBan = await DatBanModel.findById(datban_id);
    await DatBanModel.update(datban_id, { trang_thai: 'DaHuy' });
    // Cập nhật trạng thái các bàn liên quan về 'SanSang'
    const banIds = await DatBanModel.getBanIdsByDatBanId(datban_id);
    const BanNhaHangModel = require('../models/banNhaHang.model');
    for (const ban_id of banIds) {
      await BanNhaHangModel.update(ban_id, { trang_thai: 'SanSang' });
    }
    // Nếu có tiền cọc, cộng vào doanh thu ngày hôm đó
    if (datBan && datBan.so_tien_coc && datBan.so_tien_coc > 0) {
      const today = DateUtils.formatDate(new Date(), 'YYYY-MM-DD');
      // Tìm báo cáo doanh thu ngày, nếu chưa có thì tạo mới
      let [baoCao] = await BaoCaoDoanhThuModel.findAll({ loai_bao_cao: 'Ngay', ngay_bao_cao: today });
      if (!baoCao) {
        baoCao = await BaoCaoDoanhThuModel.create({
          ngay_bao_cao: today,
          loai_bao_cao: 'Ngay',
          tong_doanh_thu: datBan.so_tien_coc,
          tong_don_hang: 0
        });
      } else {
        await BaoCaoDoanhThuModel.update(baoCao.baocao_id, {
          tong_doanh_thu: (parseFloat(baoCao.tong_doanh_thu) || 0) + parseFloat(datBan.so_tien_coc)
        });
      }
    }
    return { datban_id, trang_thai: 'DaHuy' };
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

  static async checkAndUpdateDatCocStatus() {
    const allDatBan = await DatBanModel.findAll();
    const now = new Date();

    for (const datBan of allDatBan) {
      if (datBan.trang_thai === 'ChoXuLy' && datBan.thoi_gian_dat_coc) {
        const timeDiff = (now - new Date(datBan.thoi_gian_dat_coc)) / (1000 * 60); // Tính phút
        if (timeDiff > 10) {
          // Quá 10 phút, chuyển trạng thái bàn về 'SanSang'
          await DatBanModel.updateTrangThai(datBan.datban_id, 'SanSang');
          const banIds = await DatBanModel.getBanIdsByDatBanId(datBan.datban_id);
          for (const banId of banIds) {
            await BanNhaHangModel.update(banId, { trang_thai: 'SanSang' });
          }
        }
      }
    }
  }
}

// Lên lịch kiểm tra mỗi phút
nodeSchedule.scheduleJob('* * * * *', async () => {
  await DatBanService.checkAndUpdateDatCocStatus();
});

module.exports = DatBanService;