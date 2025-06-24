const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
const BanNhaHangModel = require('../models/banNhaHang.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model');
const NhanVienModel = require('../models/nhanVien.model');
const DonHangModel = require('../models/donHang.model');
const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
const MonAnModel = require('../models/monAn.model');
const KhuyenMaiModel = require('../models/khuyenMai.model');

class PhienSuDungBanService {
  static async createPhien({ ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu = 'ALaCarte', loai_thao_tac }) {
    if (!ban_id || !nhanvien_id || !so_khach_nguoi_lon) {
      throw new Error('Missing required fields');
    }

    // Kiểm tra ban_id
    const ban = await BanNhaHangModel.findById(ban_id);
    if (!ban) {
      throw new Error('Table not found');
    }
    if (ban.trang_thai !== 'SanSang') {
      throw new Error('Table is not available');
    }

    // Kiểm tra ban_id_goc nếu có
    if (ban_id_goc) {
      const banGoc = await BanNhaHangModel.findById(ban_id_goc);
      if (!banGoc) {
        throw new Error('Original table not found');
      }
    }

    // Kiểm tra khachhang_id nếu có
    if (khachhang_id) {
      const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
      if (!khachHang) {
        throw new Error('Customer not found');
      }
    }

    // Kiểm tra nhanvien_id
    const nhanVien = await NhanVienModel.findById(nhanvien_id);
    if (!nhanVien) {
      throw new Error('Employee not found');
    }

    // Kiểm tra loai_thao_tac
    if (loai_thao_tac && !['GopBan', 'TachBan', 'ChuyenBan'].includes(loai_thao_tac)) {
      throw new Error('Invalid loai_thao_tac value');
    }

    const newPhien = await PhienSuDungBanModel.create({
      ban_id,
      ban_id_goc,
      khachhang_id,
      nhanvien_id,
      so_khach_nguoi_lon,
      so_khach_tre_em_co_phi,
      so_khach_tre_em_mien_phi,
      loai_khach,
      loai_menu,
      loai_thao_tac,
      thong_bao_thanh_toan: null
    });

    // Cập nhật trạng thái bàn thành 'DangSuDung'
    await BanNhaHangModel.update(ban_id, { trang_thai: 'DangSuDung' });

    return newPhien;
  }

  static async getActivePhienByBanId(ban_id) {
    if (!ban_id) {
      throw new Error('`ban_id` is required.');
    }
    const allPhiensForBan = await PhienSuDungBanModel.findAll({ ban_id: ban_id });
    if (!allPhiensForBan || allPhiensForBan.length === 0) {
      return null;
    }

    const activePhien = allPhiensForBan.find(p => p.thoi_gian_ket_thuc === null);
    
    if (!activePhien) {
      return null;
    }

    // Kiểm tra xem phiên đã có đơn hàng nào chưa
    const orders = await DonHangModel.findAll({ phien_id: activePhien.phien_id });
    activePhien.da_co_don_hang = orders && orders.length > 0;

    return activePhien;
  }

  static async getPhienById(phien_id) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }
    return phien;
  }

  static async updatePhien(phien_id, { ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc }) {
    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Table session not found');
    }

    if (ban_id) {
      const ban = await BanNhaHangModel.findById(ban_id);
      if (!ban) {
        throw new Error('Table not found');
      }
    }

    if (ban_id_goc) {
      const banGoc = await BanNhaHangModel.findById(ban_id_goc);
      if (!banGoc) {
        throw new Error('Original table not found');
      }
    }

    if (khachhang_id) {
      const khachHang = await ThongTinKhachHangModel.findById(khachhang_id);
      if (!khachHang) {
        throw new Error('Customer not found');
      }
    }

    if (nhanvien_id) {
      const nhanVien = await NhanVienModel.findById(nhanvien_id);
      if (!nhanVien) {
        throw new Error('Employee not found');
      }
    }

    if (loai_thao_tac && !['GopBan', 'TachBan', 'ChuyenBan'].includes(loai_thao_tac)) {
      throw new Error('Invalid loai_thao_tac value');
    }

    return await PhienSuDungBanModel.update(phien_id, {
      ban_id,
      ban_id_goc,
      khachhang_id,
      nhanvien_id,
      so_khach_nguoi_lon,
      so_khach_tre_em_co_phi,
      so_khach_tre_em_mien_phi,
      loai_khach,
      loai_menu,
      loai_thao_tac,
      thong_bao_thanh_toan,
      thoi_gian_ket_thuc
    });
  }

  static async calculateBill(phien_id) {
    const phien = await this.getPhienById(phien_id);

    const donHangs = await DonHangModel.findAll({ phien_id });
    
    let total_amount = 0;
    const items = [];

    if (donHangs && donHangs.length > 0) {
      for (const donHang of donHangs) {
        const chiTietDonHangs = await ChiTietDonHangModel.findByDonHangId(donHang.donhang_id);
        for (const item of chiTietDonHangs) {
          if (item.trang_thai_phuc_vu !== 'DaHuy') {
            const monAn = await MonAnModel.findById(item.monan_id);
            if (monAn) {
              const itemTotal = item.so_luong * monAn.gia_ban;
              total_amount += itemTotal;
              items.push({
                ten_mon: monAn.ten_mon,
                so_luong: item.so_luong,
                don_gia: monAn.gia_ban,
                thanh_tien: itemTotal,
                ghi_chu: item.ghi_chu
              });
            }
          }
        }
      }
    }

    return {
      phien_id: phien.phien_id,
      ban_id: phien.ban_id,
      total_amount,
      items
    };
  }

  static async getAllItemsInPhien(phien_id) {
    // Đảm bảo phiên tồn tại
    await this.getPhienById(phien_id);

    const donHangs = await DonHangModel.findAll({ phien_id });
    
    const allItems = [];

    if (donHangs && donHangs.length > 0) {
      for (const donHang of donHangs) {
        const chiTietDonHangs = await ChiTietDonHangModel.findByDonHangId(donHang.donhang_id);
        for (const item of chiTietDonHangs) {
          const monAn = await MonAnModel.findById(item.monan_id);
          if (monAn) {
            allItems.push({
              chitiet_id: item.chitiet_id,
              donhang_id: item.donhang_id,
              ten_mon: monAn.ten_mon,
              so_luong: item.so_luong,
              don_gia: monAn.gia_ban,
              thanh_tien: item.so_luong * monAn.gia_ban,
              ghi_chu: item.ghi_chu,
              trang_thai_phuc_vu: item.trang_thai_phuc_vu,
              thoi_gian_tao: item.thoi_gian_tao,
              thoi_gian_phuc_vu: item.thoi_gian_phuc_vu,
            });
          }
        }
      }
    }

    // Sắp xếp các món ăn theo thời gian tạo để có thứ tự hợp lý
    allItems.sort((a, b) => new Date(a.thoi_gian_tao) - new Date(b.thoi_gian_tao));

    return allItems;
  }

  static async closePhien(phien_id) {
    const phien = await this.getPhienById(phien_id);

    // Đánh dấu thời gian kết thúc cho phiên
    const updatedPhien = await PhienSuDungBanModel.update(phien_id, { thoi_gian_ket_thuc: new Date() });

    // Cập nhật trạng thái bàn về 'SanSang'
    if (phien.ban_id) {
      await BanNhaHangModel.update(phien.ban_id, { trang_thai: 'SanSang' });
    }

    return updatedPhien;
  }

  static async cancelEmptyPhien(phien_id) {
    // 1. Kiểm tra phiên tồn tại
    const phien = await this.getPhienById(phien_id);

    // 2. Kiểm tra xem có đơn hàng nào được tạo trong phiên chưa
    const orders = await DonHangModel.findAll({ phien_id });
    if (orders && orders.length > 0) {
      throw new Error('Không thể hủy vì phiên đã có đơn hàng được tạo.');
    }

    // 3. Tiến hành xóa phiên
    const result = await PhienSuDungBanModel.delete(phien_id);
    
    // 4. Cập nhật trạng thái bàn về 'SanSang'
    if (phien.ban_id) {
      await BanNhaHangModel.update(phien.ban_id, { trang_thai: 'SanSang' });
    }
    return result;
  }

  static async deletePhien(phien_id) {
    // Kiểm tra nếu có order chưa rỗng thì không cho xóa
    const orders = await DonHangModel.findAll({ phien_id });
    if (orders && orders.length > 0) {
      for (const order of orders) {
        const items = await ChiTietDonHangModel.findByDonHangId(order.donhang_id);
        if (items && items.length > 0) {
          // Chỉ tính các món chưa hủy
          const activeItems = items.filter(i => i.trang_thai_phuc_vu !== 'DaHuy');
          if (activeItems.length > 0) {
            throw new Error('Không thể xóa phiên: vẫn còn các món ăn trong đơn hàng');
          }
        }
      }
    }

    const phien = await this.getPhienById(phien_id);

    const result = await PhienSuDungBanModel.delete(phien_id);
    
    // Sau khi xóa phiên, cập nhật trạng thái bàn về 'SanSang'
    if (phien.ban_id) {
      await BanNhaHangModel.update(phien.ban_id, { trang_thai: 'SanSang' });
    }
    return result;
  }

  static async applyPromotion(phien_id, ma_code) {
    // 1. Tìm và xác thực mã khuyến mãi
    const promotion = await KhuyenMaiModel.findByCode(ma_code);
    if (!promotion) {
      throw new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
    }

    // 2. Kiểm tra xem phiên có tồn tại không
    const session = await PhienSuDungBanModel.findById(phien_id);
    if (!session) {
      throw new Error('Phiên không tồn tại.');
    }
    if (session.thoi_gian_ket_thuc) {
      throw new Error('Phiên đã kết thúc, không thể áp dụng khuyến mãi.');
    }

    // 3. Áp dụng khuyến mãi vào phiên
    const updatedSession = await PhienSuDungBanModel.setPromotion(phien_id, promotion.khuyenmai_id);

    return {
      session: updatedSession,
      promotion: promotion,
    };
  }
}

module.exports = PhienSuDungBanService;