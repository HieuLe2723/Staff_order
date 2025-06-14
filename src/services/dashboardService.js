const db = require('../config/db.config');// hoặc pool/query nếu bạn có

exports.getQuickStats = async () => {
  const [orders] = await db.query('SELECT COUNT(*) AS tong_don_hang FROM DonHang');
  const [revenue] = await db.query('SELECT SUM(tong_tien) AS tong_doanh_thu FROM DonHang WHERE trang_thai = "DaThanhToan"');
  const [tables] = await db.query('SELECT COUNT(*) AS ban_dang_su_dung FROM BanNhaHang WHERE trang_thai = "DangSuDung"');
  const [employees] = await db.query('SELECT COUNT(*) AS nhan_vien_hoat_dong FROM NhanVien WHERE hoat_dong = 1');

  return {
    tong_don_hang: orders[0].tong_don_hang || 0,
    tong_doanh_thu: revenue[0].tong_doanh_thu || 0,
    ban_dang_su_dung: tables[0].ban_dang_su_dung || 0,
    nhan_vien_hoat_dong: employees[0].nhan_vien_hoat_dong || 0
  };
};
