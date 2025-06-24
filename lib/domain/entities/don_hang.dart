class DonHang {
  final int? donHangId;
  final int? phienId;
  final String? loaiMenu;
  final int? khuyenMaiId;
  final double? giaTriGiam;
  final double? tongTien;
  final String? trangThai;
  final DateTime? ngayTao;
  final String? hanhDong;
  final String? moTaHanhDong;
  final DateTime? thoiGianHanhDong;

  DonHang({
    this.donHangId,
    this.phienId,
    this.loaiMenu,
    this.khuyenMaiId,
    this.giaTriGiam,
    this.tongTien,
    this.trangThai,
    this.ngayTao,
    this.hanhDong,
    this.moTaHanhDong,
    this.thoiGianHanhDong,
  });

  factory DonHang.fromJson(Map<String, dynamic> json) {
    return DonHang(
      donHangId: json['donhang_id'],
      phienId: json['phien_id'],
      loaiMenu: json['loai_menu'],
      khuyenMaiId: json['khuyenmai_id'],
      giaTriGiam: (json['gia_tri_giam'] is int)
          ? (json['gia_tri_giam'] as int).toDouble()
          : (json['gia_tri_giam'] as num?)?.toDouble(),
      tongTien: (json['tong_tien'] is int)
          ? (json['tong_tien'] as int).toDouble()
          : (json['tong_tien'] as num?)?.toDouble(),
      trangThai: json['trang_thai'],
      ngayTao: json['ngay_tao'] != null ? DateTime.parse(json['ngay_tao']) : null,
      hanhDong: json['hanh_dong'],
      moTaHanhDong: json['mo_ta_hanh_dong'],
      thoiGianHanhDong: json['thoi_gian_hanh_dong'] != null ? DateTime.parse(json['thoi_gian_hanh_dong']) : null,
    );
  }
}
