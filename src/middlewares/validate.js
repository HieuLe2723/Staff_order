// src/middlewares/validate.js
const Joi = require('joi');
const ResponseUtils = require('../utils/response');
const HelperUtils = require('../utils/helper');

const validate = (schema) => (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = HelperUtils.sanitizeString(req.body[key]);
    }
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json(ResponseUtils.error(messages, 400));
  }

  next();
};

const schemas = {
  login: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    password: Joi.string().min(1).required()
  }),

  reservation: Joi.object({
    khachhang_id: Joi.number().integer().min(1).required(),
    ban_id: Joi.number().integer().min(1).required(),
    so_khach: Joi.number().integer().min(1).required(),
    thoi_gian_dat: Joi.string().isoDate().required(),
    ghi_chu: Joi.string().max(255).allow(''),
    trang_thai: Joi.string().valid('ChoXuLy', 'DaXacNhan', 'DaHuy').optional()
  }),

  order: Joi.object({
    phien_id: Joi.number().integer().min(1).required(),
    loai_menu: Joi.string().max(50).allow(''),
    khuyenmai_id: Joi.number().integer().min(1).allow(null),
    gia_tri_giam: Joi.number().precision(2).min(0).optional(),
    tong_tien: Joi.number().precision(2).min(0).optional(),
    trang_thai: Joi.string().valid('ChoXuLy', 'DangNau', 'DaPhucVu', 'DaThanhToan', 'DaHuy').optional(),
    hanh_dong: Joi.string().valid('ThemMon', 'XoaMon', 'HuyMon', 'HoanTat').optional(),
    mo_ta_hanh_dong: Joi.string().max(255).optional(),
    thoi_gian_hanh_dong: Joi.date().iso().optional(),
    items: Joi.array().items(
      Joi.object({
        monan_id: Joi.number().integer().min(1).required(),
        so_luong: Joi.number().integer().min(1).required(),
        ghi_chu: Joi.string().max(255).allow('')
      })
    ).required()
  }),

  customer: Joi.object({
    ho_ten: Joi.string().max(100).allow(''),
    so_dien_thoai: Joi.string().pattern(/^(\+84|0)[0-9]{9,10}$/).allow(''),
    email: Joi.string().email().max(100).allow(''),
    quoc_tich: Joi.string().max(50).allow(''),
    nhom_tuoi: Joi.string().max(50).allow(''),
    loai_nhom: Joi.string().max(50).allow('')
  }),

  promotion: Joi.object({
    ma_code: Joi.string().max(50).required(),
    mo_ta: Joi.string().max(255).allow(''),
    phan_tram_giam: Joi.number().integer().min(0).max(100),
    ngay_het_han: Joi.date().iso()
  }),

  evaluation: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    khachhang_id: Joi.number().integer().min(1).required(),
    phien_id: Joi.number().integer().min(1).required(),
    diem_so: Joi.number().integer().min(1).max(5).required(),
    binh_luan: Joi.string().max(255).allow('')
  }),

  nhanVien: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    ho_ten: Joi.string().max(100).required(),
    email: Joi.string().email().max(100).required(),
    matkhau_hash: Joi.string().max(255).required(),
    role_id: Joi.number().integer().min(1).required(),
    hoat_dong: Joi.number().integer().min(0).max(1).optional()
  }),

  thietBi: Joi.object({
    ten: Joi.string().max(100).required(),
    so_luong: Joi.number().integer().min(1).optional(),
    trang_thai: Joi.string().valid('HoatDong', 'DangSuaChua', 'HuHong').optional()
  }),

  thanhToan: Joi.object({
    donhang_id: Joi.number().integer().min(1).required(),
    so_tien: Joi.number().precision(2).positive().required(),
    khuyenmai_id: Joi.number().integer().min(1).optional().allow(null),
    phuong_thuc: Joi.string().valid('TienMat', 'VNPay', 'Momo', 'ZaloPay').required(),
    ma_giao_dich: Joi.string().max(100).optional().allow(''),
    ma_phan_hoi: Joi.string().max(10).optional().allow(''),
    trang_thai: Joi.string().valid('ChoXuLy', 'HoanTat', 'ThatBai').required()
  }),

  phienSuDungBan: Joi.object({
    ban_id: Joi.number().integer().min(1).required(),
    ban_id_goc: Joi.number().integer().min(1).optional().allow(null),
    khachhang_id: Joi.number().integer().min(1).optional().allow(null),
    nhanvien_id: Joi.string().max(10).required(),
    so_khach_nguoi_lon: Joi.number().integer().min(0).required(),
    so_khach_tre_em_co_phi: Joi.number().integer().min(0).optional(),
    so_khach_tre_em_mien_phi: Joi.number().integer().min(0).optional(),
    loai_khach: Joi.string().max(50).optional().allow(''),
    loai_thao_tac: Joi.string().valid('GopBan', 'TachBan', 'ChuyenBan').optional().allow(null),
    thong_bao_thanh_toan: Joi.string().max(255).optional().allow(null)
  }),

  role: Joi.object({
    role_name: Joi.string().max(50).required()
  }),

  khuVuc: Joi.object({
    ten_khuvuc: Joi.string().max(100).required(),
    so_ban: Joi.number().integer().min(0).required()
  }),

  khachHangThanThiet: Joi.object({
    khachhang_id: Joi.number().integer().min(1).required(),
    diem_so: Joi.number().integer().min(0).required(),
    cap_bac: Joi.string().valid('Bac', 'Vang', 'BachKim').required()
  }),

  nguyenLieu: Joi.object({
    ten_nguyenlieu: Joi.string().max(100).required(),
    don_vi: Joi.string().max(20).required(),
    so_luong_con_lai: Joi.number().precision(2).min(0).required(),
    nguong_canh_bao: Joi.number().precision(2).min(0).required()
  }),

  monAn: Joi.object({
    ten_mon: Joi.string().max(100).required(),
    loai_id: Joi.number().integer().min(1).required(),
    gia: Joi.number().precision(2).positive().required(),
    hinh_anh: Joi.string().max(255).allow('')
  }),

  lichSuBaoTri: Joi.object({
    thietbi_id: Joi.number().integer().min(1).required(),
    mo_ta: Joi.string().max(255).allow(''),
    ngay_bao_tri: Joi.date().iso().required(),
    trang_thai: Joi.string().valid('DaSua', 'DangXuLy', 'KhongSuaDuoc').required()
  }),

  monAnNguyenLieu: Joi.object({
    monan_id: Joi.number().integer().min(1).required(),
    nguyenlieu_id: Joi.number().integer().min(1).required(),
    so_luong_can: Joi.number().precision(2).min(0).required()
  }),

  lichSuDongBo: Joi.object({
    loai_du_lieu: Joi.string().max(50).required(),
    trang_thai: Joi.string().valid('ThanhCong', 'ThatBai').required(),
    mo_ta: Joi.string().max(255).allow('')
  }),

  loaiMonAn: Joi.object({
    ten_loai: Joi.string().max(100).required()
  }),

  loginHistory: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    ip_address: Joi.string().max(45).required(),
    thiet_bi: Joi.string().max(100).required()
  }),

  revenueReport: Joi.object({
    ngay_bao_cao: Joi.date().iso().required(),
    loai_bao_cao: Joi.string().valid('Ngay', 'Tuan', 'Thang', 'Quy', 'Nam').required(),
    thang: Joi.number().integer().min(1).max(12).optional(),
    quy: Joi.number().integer().min(1).max(4).optional(),
    nam: Joi.number().integer().min(2020).required(),
    tong_doanh_thu: Joi.number().precision(2).required(),
    tong_don_hang: Joi.number().integer().required()
  }),

  chiTietDonHang: Joi.object({
    donhang_id: Joi.number().integer().min(1).required(),
    monan_id: Joi.number().integer().min(1).required(),
    so_luong: Joi.number().integer().min(1).required(),
    ghi_chu: Joi.string().max(255).allow(''),
    thoi_gian_phuc_vu: Joi.date().iso().optional().allow(null),
    trang_thai_phuc_vu: Joi.string().valid('ChoNau', 'DangNau', 'DaPhucVu').optional()
  }),

  phieuNhapHang: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    ngay_nhap: Joi.date().iso().optional(),
    tong_so_luong: Joi.number().precision(2).min(0).optional(),
    ghi_chu: Joi.string().max(255).allow(''),
    trang_thai: Joi.string().valid('ChoXacNhan', 'DaXacNhan', 'DaHuy').optional()
  }),

  chiTietPhieuNhap: Joi.object({
    phieunhap_id: Joi.number().integer().min(1).required(),
    nguyenlieu_id: Joi.number().integer().min(1).required(),
    so_luong: Joi.number().precision(2).min(0).required(),
    don_vi: Joi.string().max(20).required(),
    ghi_chu: Joi.string().max(255).allow('')
  }),

  phieuXuatHang: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    ngay_xuat: Joi.date().iso().optional(),
    tong_so_luong: Joi.number().precision(2).min(0).optional(),
    ghi_chu: Joi.string().max(255).allow(''),
    trang_thai: Joi.string().valid('ChoXacNhan', 'DaXacNhan', 'DaHuy').optional()
  }),

  chiTietPhieuXuat: Joi.object({
    phieuxuat_id: Joi.number().integer().min(1).required(),
    nguyenlieu_id: Joi.number().integer().min(1).required(),
    so_luong: Joi.number().precision(2).min(0).required(),
    don_vi: Joi.string().max(20).required(),
    ghi_chu: Joi.string().max(255).allow('')
  }),

  caiDatNgonNgu: Joi.object({
    ma_ngon_ngu: Joi.string().max(10).required(),
    ten_ngon_ngu: Joi.string().max(100).required()
  }),

  danhGiaNhanVien: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    thang: Joi.number().integer().min(1).max(12).required(),
    nam: Joi.number().integer().min(2020).required(),
    diem_so: Joi.number().integer().min(0).required(),
    binh_luan: Joi.string().max(255).allow('')
  }),

  baoCaoChiTietMonAn: Joi.object({
    baocao_id: Joi.number().integer().min(1).required(),
    monan_id: Joi.number().integer().min(1).required(),
    so_luong: Joi.number().integer().min(0).required(),
    tong_doanh_thu_mon: Joi.number().precision(2).min(0).required()
  }),

  statusSchema: Joi.object({
    trang_thai: Joi.string().valid('ChoXuLy', 'HoanTat', 'ThatBai').required(),
  }),

  banNhaHang: Joi.object({
    ten_ban: Joi.string().max(50).required(), // Khớp với ten_ban VARCHAR(50) NOT NULL
    khuvuc_id: Joi.number().integer().min(1).required(), // Khớp với khuvuc_id INT
    trang_thai: Joi.string().valid('SanSang', 'DangSuDung', 'DaDat').optional(), // Khớp với SQL
    qr_code_url: Joi.string().max(255).uri().optional() // Khớp với qr_code_url VARCHAR(255)
  }),

  caLamViec: Joi.object({
    ten_ca: Joi.string().max(50).required(),
    thoi_gian_bat_dau: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    thoi_gian_ket_thuc: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    mo_ta: Joi.string().max(255).allow('').optional()
  }),

  phanCaNhanVien: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    calamviec_id: Joi.number().integer().min(1).required(),
    ngay_lam: Joi.date().iso().required(),
    thoi_gian_check_in: Joi.date().iso().optional().allow(null),
    thoi_gian_check_out: Joi.date().iso().optional().allow(null),
    trang_thai: Joi.string().valid('ChuaCheckIn', 'DaCheckIn', 'DaCheckOut', 'Nghi').optional(),
    ghi_chu: Joi.string().max(255).allow('').optional()
  }),

  luongNhanVien: Joi.object({
    nhanvien_id: Joi.string().max(10).required(),
    phanca_id: Joi.number().integer().min(1).required(),
    thang: Joi.number().integer().min(1).max(12).required(),
    nam: Joi.number().integer().min(2020).required(),
    so_gio_lam: Joi.number().precision(2).min(0).required(),
    luong: Joi.number().precision(2).min(0).required(),
    trang_thai: Joi.string().valid('ChuaThanhToan', 'DaThanhToan').optional()
  })
};

module.exports = { validate, schemas };