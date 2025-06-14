// lib/domain/entities/phan_ca_nhan_vien.dart
class PhanCaNhanVien {
  final int phancaId;
  final String nhanvienId;
  final int calamviecId;
  final String ngayLam;
  final String? thoiGianCheckIn;
  final String? thoiGianCheckOut;
  final String trangThai;
  final String? ghiChu;
  final String tenCa;
  final String thoiGianBatDau;
  final String thoiGianKetThuc;
  final String hoTen;

  PhanCaNhanVien({
    required this.phancaId,
    required this.nhanvienId,
    required this.calamviecId,
    required this.ngayLam,
    this.thoiGianCheckIn,
    this.thoiGianCheckOut,
    required this.trangThai,
    this.ghiChu,
    required this.tenCa,
    required this.thoiGianBatDau,
    required this.thoiGianKetThuc,
    required this.hoTen,
  });

  factory PhanCaNhanVien.fromJson(Map<String, dynamic> json) {
    return PhanCaNhanVien(
      phancaId: json['phanca_id'],
      nhanvienId: json['nhanvien_id'],
      calamviecId: json['calamviec_id'],
      ngayLam: json['ngay_lam'],
      thoiGianCheckIn: json['thoi_gian_check_in'],
      thoiGianCheckOut: json['thoi_gian_check_out'],
      trangThai: json['trang_thai'],
      ghiChu: json['ghi_chu'],
      tenCa: json['ten_ca'],
      thoiGianBatDau: json['thoi_gian_bat_dau'],
      thoiGianKetThuc: json['thoi_gian_ket_thuc'],
      hoTen: json['ho_ten'],
    );
  }
}