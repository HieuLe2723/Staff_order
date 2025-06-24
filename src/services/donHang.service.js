// src/services/donHang.service.js
const { Op } = require('sequelize');
const DonHangModel = require('../models/donHang.model');
const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
const KhuyenMaiModel = require('../models/khuyenMai.model');
const LichSuDonHangModel = require('../models/lichSuDonHang.model');
const BanNhaHangModel = require('../models/banNhaHang.model');
const ChiTietDonHangService = require('./chiTietDonHang.service');
const LoaiMonAnModel = require('../models/loaiMonAn.model');
const MonAnModel = require('../models/monAn.model');

class DonHangService {
  static async createDonHang({ phien_id, loai_id, khuyenmai_id, hanh_dong, mo_ta_hanh_dong, gia_tri_giam = 0, tong_tien = 0, trang_thai = 'ChoXuLy', items = [] }, user) {
    // Kiểm tra quyền (chỉ nhân viên hoặc quản lý)
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể tạo đơn hàng');
    }

    // Kiểm tra khuyến mãi hợp lệ
    if (khuyenmai_id) {
      const khuyenMai = await KhuyenMaiModel.findById(khuyenmai_id);
      if (khuyenMai.ngay_het_han < new Date()) {
        throw new Error('Khuyến mãi đã hết hạn');
      }
    }

    // Chuyển đổi loai_id thành loai_menu
    const final_loai_id = loai_id || 1; // Mặc định là 1 nếu không có
    const loaiMonAn = await LoaiMonAnModel.findById(final_loai_id);
    if (!loaiMonAn) {
      throw new Error(`Không tìm thấy loại menu với ID: ${final_loai_id}`);
    }
    const loai_menu_value = loaiMonAn.loai_menu;

    // Kiểm tra nếu đây là đơn hàng đầu tiên của phiên -> sẽ dùng để cập nhật trạng thái bàn sau
    const existingOrders = await DonHangModel.findAll({ where: { phien_id } });

    const donHang = await DonHangModel.create({
      phien_id,
      khuyenmai_id,
      loai_menu: loai_menu_value, // Sửa ở đây: dùng loai_menu
      hanh_dong,
      mo_ta_hanh_dong,
      gia_tri_giam,
      tong_tien,
      trang_thai
    });

    // Nếu đây là đơn hàng đầu tiên của phiên -> cập nhật trạng thái bàn
    if (existingOrders.length === 0) {
      const phien = await PhienSuDungBanModel.findById(phien_id);
      if (phien && phien.ban_id) {
        await BanNhaHangModel.update(phien.ban_id, { trang_thai: 'DaGoiMon' });
      }
    }

    // Nếu kèm items thì thêm vào chi tiết
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const { monan_id, so_luong, ghi_chu } = item;
        await ChiTietDonHangModel.create({
          donhang_id: donHang.donhang_id,
          monan_id,
          so_luong,
          ghi_chu
        });
      }
    }

    // Ghi log lịch sử đơn hàng
    await LichSuDonHangModel.create({
      donhang_id: donHang.donhang_id,
      hanh_dong: hanh_dong || 'TaoDon',
      mo_ta: mo_ta_hanh_dong || 'Tạo đơn hàng',
      nhanvien_id: user.nhanvien_id
    });

    return donHang;
  }

  static async getDonHangById(donhang_id) {
    return await DonHangModel.findById(donhang_id);
  }

  static async updateDonHang(donhang_id, { phien_id, loai_id, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong }, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể cập nhật đơn hàng');
    }

    const dataToUpdate = {
      phien_id,
      khuyenmai_id,
      gia_tri_giam,
      tong_tien,
      trang_thai,
      hanh_dong,
      mo_ta_hanh_dong
    };

    if (loai_id) {
      const loaiMonAn = await LoaiMonAnModel.findById(loai_id);
      if (!loaiMonAn) {
        throw new Error(`Không tìm thấy loại menu với ID: ${loai_id}`);
      }
      dataToUpdate.loai_menu = loaiMonAn.loai_menu;
    }

    return await DonHangModel.update(donhang_id, dataToUpdate);
  }

  static async deleteDonHang(donhang_id, user, options = {}) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể xóa đơn hàng');
    }

    const chiTiet = await ChiTietDonHangModel.findAll({ where: { donhang_id } });

    // Đơn hàng chỉ có thể bị xóa nếu nó trống (không có chi tiết nào)
    if (chiTiet.length > 0) {
      throw new Error('Không thể xóa đơn hàng có chứa món ăn. Vui lòng hủy các món ăn trước.');
    }

    // Ghi log hành động xóa
    await LichSuDonHangModel.create({
      donhang_id,
      hanh_dong: 'XoaDon',
      mo_ta: `Xóa đơn hàng trống #${donhang_id}`,
      nhanvien_id: user.nhanvien_id
    });

    return await DonHangModel.delete(donhang_id);
  }

  static async getAlerts() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingOrders = await DonHangModel.findAll({
      where: {
        trang_thai: 'ChoXuLy',
        ngay_tao: { [Op.lt]: thirtyMinutesAgo }
      },
      order: [['ngay_tao', 'DESC']]
    });

    const delayedDeliveries = await DonHangModel.findAll({
      where: {
        trang_thai: 'DangGiaoHang',
        ngay_tao: { [Op.lt]: oneHourAgo }
      },
      order: [['ngay_tao', 'DESC']]
    });

    const highValueOrders = await DonHangModel.findAll({
      where: {
        tong_tien: { [Op.gt]: 1000000 },
        ngay_tao: { [Op.gt]: twentyFourHoursAgo }
      },
      order: [['ngay_tao', 'DESC']]
    });

    return {
      pendingOrders: pendingOrders.map(order => ({
        id: order.donhang_id,
        type: 'pending',
        message: `Đơn hàng #${order.donhang_id} đang chờ xử lý quá 30 phút`,
        timestamp: order.ngay_tao
      })),
      delayedDeliveries: delayedDeliveries.map(order => ({
        id: order.donhang_id,
        type: 'delayed',
        message: `Đơn hàng #${order.donhang_id} đang giao hàng quá 1 tiếng`,
        timestamp: order.ngay_tao
      })),
      highValueOrders: highValueOrders.map(order => ({
        id: order.donhang_id,
        type: 'high_value',
        message: `Đơn hàng #${order.donhang_id} có giá trị cao: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tong_tien)}`,
        timestamp: order.ngay_tao
      }))
    };
  }

  // Lấy danh sách món của 1 order
  static async getOrderItems(donhang_id, status) {
    const whereClause = { donhang_id };
    if (status) {
      whereClause.trang_thai_phuc_vu = status;
    }
    return await ChiTietDonHangModel.findAll({ where: whereClause });
  }

  // Thêm nhanh nhiều món vào đơn hàng
  static async addItemsToOrder(donhang_id, items, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể thêm món');
    }
    const results = [];
    for (const item of items) {
      const created = await ChiTietDonHangService.createChiTietDonHang({ ...item, donhang_id });
      results.push(created);
    }
    // Ghi log vào lịch sử đơn hàng
    await LichSuDonHangModel.create({
      donhang_id,
      hanh_dong: 'ThemMon',
      mo_ta: `Thêm ${items.length} món bổ sung`,
      nhanvien_id: user.nhanvien_id
    });
    return results;
  }

  // Hủy món khỏi đơn hàng
  static async cancelOrderItem(chitiet_id, user) {
    if (!['Nhan Vien', 'Quan Ly'].includes(user.role_name)) {
      throw new Error('Chỉ nhân viên hoặc quản lý mới có thể hủy món');
    }
    const item = await ChiTietDonHangModel.findById(chitiet_id);
    if (!item) {
      throw new Error('Không tìm thấy món ăn trong đơn hàng');
    }

    const result = await ChiTietDonHangService.cancelDish(chitiet_id);

    // Ghi log vào lịch sử đơn hàng
    await LichSuDonHangModel.create({
      donhang_id: item.donhang_id,
      hanh_dong: 'HuyMon',
      mo_ta: `Hủy món #${item.monan_id} khỏi đơn hàng`,
      nhanvien_id: user.nhanvien_id
    });

    return result;
  }

  static async getDonHangsByPhienId(phien_id) {
    const orders = await DonHangModel.findAll({
      where: { phien_id: phien_id },
      include: [
        {
          model: ChiTietDonHangModel,
          include: [
            {
              model: MonAnModel,
              attributes: ['ten_mon', 'gia'],
            },
          ],
        },
      ],
      order: [['ngay_tao', 'ASC']],
    });
    return orders;
  }
}

module.exports = DonHangService;