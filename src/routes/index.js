// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import các file route tương ứng với các bảng
const banNhaHangRoute = require('./banNhaHang.route');
const baoCaoDoanhThuRoute = require('./baoCaoDoanhThu.route');
const baoCaoChiTietMonAnRoute = require('./baoCaoChiTietMonAn.route');
const caiDatNgonNguRoute = require('./caiDatNgonNgu.route');
const chiTietDonHangRoute = require('./chiTietDonHang.route');
const chiTietPhieuNhapRoute = require('./chiTietPhieuNhap.route');
const chiTietPhieuXuatRoute = require('./chiTietPhieuXuat.route');
const danhGiaRoute = require('./danhGia.route');
const danhGiaNhanVienRoute = require('./danhGiaNhanVien.route');
const datBanRoute = require('./datBan.route');
const donHangRoute = require('./donHang.route');
const khachHangThanThietRoute = require('./KhachHangThanThietRoutes');
const khuVucRoute = require('./KhuVucRoutes');
const khuyenMaiRoute = require('./KhuyenMaiRoutes');
const lichSuBaoTriRoute = require('./LichSuBaoTriRoutes');
const lichSuDongBoRoute = require('./LichSuDongBoRoutes');
const loaiMonAnRoute = require('./LoaiMonAnRoutes');
const monAnRoute = require('./MonAnRoutes');
const monAnNguyenLieuRoute = require('./MonAnNguyenLieuRoutes');
const nguyenLieuRoute = require('./NguyenLieuRoutes');
const nhanVienRoute = require('./nhanVien.route');
const phienSuDungBanRoute = require('./phienSuDungBan.route');
const lichSuDonHangRoute = require('./lichSuDonHang.route');
const phieuNhapHangRoute = require('./phieuNhapHang.route');
const phieuXuatHangRoute = require('./phieuXuatHang.route');
const roleRoute = require('./role.route');
const thanhToanRoute = require('./thanhToan.route');
const thietBiRoute = require('./thietBi.route');
const thongTinKhachHangRoute = require('./thongTinKhachHang.route');
const authRoute = require('./auth.routes');
const caLamViecRoute = require('./CaLamViec.route'); // Thêm route cho CaLamViec
const vnpayRoute = require('./vnpay.route'); // Thêm route cho VNPay


// Gán các route vào router với tiền tố phù hợp
router.use('/ban-nha-hang', banNhaHangRoute);
router.use('/bao-cao-doanh-thu', baoCaoDoanhThuRoute);
router.use('/bao-cao-chi-tiet-mon-an', baoCaoChiTietMonAnRoute);
router.use('/cai-dat-ngon-ngu', caiDatNgonNguRoute);
router.use('/chi-tiet-don-hang', chiTietDonHangRoute);
router.use('/chi-tiet-phieu-nhap', chiTietPhieuNhapRoute);
router.use('/chi-tiet-phieu-xuat', chiTietPhieuXuatRoute);
router.use('/danh-gia', danhGiaRoute);
router.use('/danh-gia-nhan-vien', danhGiaNhanVienRoute);
router.use('/dat-ban', datBanRoute);
router.use('/don-hang', donHangRoute);
router.use('/khach-hang-than-thiet', khachHangThanThietRoute);
router.use('/khu-vuc', khuVucRoute);
router.use('/khuyen-mai', khuyenMaiRoute);
router.use('/lich-su-bao-tri', lichSuBaoTriRoute);
router.use('/lich-su-dong-bo', lichSuDongBoRoute);
router.use('/loai-mon-an', loaiMonAnRoute);
router.use('/mon-an', monAnRoute);
router.use('/mon-an-nguyen-lieu', monAnNguyenLieuRoute);
router.use('/nguyen-lieu', nguyenLieuRoute);
router.use('/nhan-vien', nhanVienRoute);
router.use('/phien-su-dung-ban', phienSuDungBanRoute);
router.use('/lich-su-don-hang', lichSuDonHangRoute);
router.use('/phieu-nhap-hang', phieuNhapHangRoute);
router.use('/phieu-xuat-hang', phieuXuatHangRoute);
router.use('/role', roleRoute);
router.use('/thanh-toan', thanhToanRoute);
router.use('/thiet-bi', thietBiRoute);
router.use('/thong-tin-khach-hang', thongTinKhachHangRoute);
router.use('/auth', authRoute);
router.use('/ca-lam-viec', caLamViecRoute); 
router.use('/vnpay', vnpayRoute); // Kết nối endpoint VNPay

module.exports = router;