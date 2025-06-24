// src/services/autoUpdateBanStatus.js
const DatBanModel = require('../models/datBan.model');
const BanNhaHangModel = require('../models/banNhaHang.model');
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');
const pool = require('../config/db.config');

async function updateBanStatusIfNoOrder() {
  try {
    // Xử lý các đơn đặt bàn 1 bàn (ban_id != null)
    const [singleRows] = await pool.query(`
      SELECT d.datban_id, d.ban_id, d.thoi_gian_dat, d.trang_thai, d.so_tien_coc
      FROM DatBan d
      LEFT JOIN PhienSuDungBan psd ON d.ban_id = psd.ban_id
      LEFT JOIN DonHang dh ON psd.phien_id = dh.phien_id
      WHERE d.trang_thai IN ('ChoXuLy', 'DaDat', 'DaXacNhan')
        AND dh.donhang_id IS NULL
        AND d.thoi_gian_dat < DATE_SUB(NOW(), INTERVAL 1 MINUTE)
        AND d.ban_id IS NOT NULL
    `);
    
    for (const datban of singleRows) {
      // Chuyển tiền cọc vào doanh thu nếu có
      if (datban.so_tien_coc > 0) {
        await handleDepositForCancelledBooking(datban);
      }
      
      // Cập nhật trạng thái bàn và đơn đặt bàn
      await BanNhaHangModel.update(datban.ban_id, { trang_thai: 'SanSang' });
      await DatBanModel.update(datban.datban_id, { trang_thai: 'DaHuy' });
      console.log(`Đã cập nhật bàn ${datban.ban_id} và đơn đặt bàn ${datban.datban_id} về trạng thái SanSang/DaHuy`);
    }

    // Xử lý các đơn đặt bàn group (ban_id == null, dùng bảng DatBan_Ban)
    const [groupRows] = await pool.query(`
      SELECT DISTINCT d.datban_id, d.thoi_gian_dat, d.trang_thai, d.so_tien_coc
      FROM DatBan d
      LEFT JOIN DatBan_Ban dbb ON d.datban_id = dbb.datban_id
      LEFT JOIN PhienSuDungBan psd ON dbb.ban_id = psd.ban_id
      LEFT JOIN DonHang dh ON psd.phien_id = dh.phien_id
      WHERE d.trang_thai IN ('ChoXuLy', 'DaDat', 'DaXacNhan')
        AND dh.donhang_id IS NULL
        AND d.thoi_gian_dat < DATE_SUB(NOW(), INTERVAL 60 MINUTE)
        AND d.ban_id IS NULL
    `);

    for (const datban of groupRows) {
      // Chuyển tiền cọc vào doanh thu nếu có
      if (datban.so_tien_coc > 0) {
        await handleDepositForCancelledBooking(datban);
      }

      // Lấy danh sách các bàn thuộc đơn đặt bàn group
      const ban_ids = await DatBanModel.getBanIdsByDatBanId(datban.datban_id);
      for (const ban_id of ban_ids) {
        await BanNhaHangModel.update(ban_id, { trang_thai: 'SanSang' });
        console.log(`Đã cập nhật bàn ${ban_id} (group) về trạng thái SanSang`);
      }
      await DatBanModel.update(datban.datban_id, { trang_thai: 'DaHuy' });
      console.log(`Đã cập nhật đơn đặt bàn group ${datban.datban_id} về trạng thái DaHuy`);
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bàn:', error);
    throw error;
  }
}

// Hàm xử lý tiền cọc khi hủy đặt bàn
async function handleDepositForCancelledBooking(datban) {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Tìm báo cáo doanh thu trong ngày
    let baoCaoArr = await BaoCaoDoanhThuModel.findAll({ 
      loai_bao_cao: 'Ngay', 
      ngay_bao_cao: today 
    });
    let baoCao = Array.isArray(baoCaoArr) ? baoCaoArr[0] : baoCaoArr;
    // Nếu chưa có báo cáo ngày, tạo mới
    if (!baoCao) {
      baoCao = await BaoCaoDoanhThuModel.create({
        ngay_bao_cao: today,
        loai_bao_cao: 'Ngay',
        tong_doanh_thu: datban.so_tien_coc,
        tong_don_hang: 0
      });
      console.log(`Đã tạo báo cáo doanh thu mới cho ngày ${today}`);
    } else {
      // Cập nhật báo cáo đã tồn tại
      if (typeof baoCao.tong_doanh_thu === 'undefined') {
        console.error('Không tìm thấy trường tong_doanh_thu trong báo cáo doanh thu!');
        return;
      }
      const newTongDoanhThu = (parseFloat(baoCao.tong_doanh_thu) || 0) + parseFloat(datban.so_tien_coc);
      await pool.query(
        'UPDATE BaoCaoDoanhThu SET tong_doanh_thu = ? WHERE baocao_id = ?',
        [newTongDoanhThu, baoCao.baocao_id]
      );
    }
    console.log(`Đã chuyển tiền cọc ${datban.so_tien_coc} từ đơn đặt bàn ${datban.datban_id} vào doanh thu ngày ${today}`);
  } catch (error) {
    console.error('Lỗi khi xử lý tiền cọc:', error);
  }
}

// Hàm này có thể được gọi định kỳ bằng cron hoặc scheduler
if (require.main === module) {
  updateBanStatusIfNoOrder()
    .then(() => {
      console.log('Đã kiểm tra và cập nhật trạng thái các bàn quá hạn.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Lỗi khi chạy cập nhật trạng thái bàn:', error);
      process.exit(1);
    });
}

module.exports = { updateBanStatusIfNoOrder, handleDepositForCancelledBooking };