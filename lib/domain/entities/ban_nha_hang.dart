class BanNhaHang {
  BanNhaHang copyWith({
    int? banId,
    String? tenBan,
    int? khuvucId,
    String? trangThai,
    String? qrCodeUrl,
    DateTime? thoiGianBatDau,
    String? loaiKhach,
    String? loaiMenu,
  }) {
    return BanNhaHang(
      banId: banId ?? this.banId,
      tenBan: tenBan ?? this.tenBan,
      khuvucId: khuvucId ?? this.khuvucId,
      trangThai: trangThai ?? this.trangThai,
      qrCodeUrl: qrCodeUrl ?? this.qrCodeUrl,
      thoiGianBatDau: thoiGianBatDau ?? this.thoiGianBatDau,
      loaiKhach: loaiKhach ?? this.loaiKhach,
      loaiMenu: loaiMenu ?? this.loaiMenu,
    );
  }
  final int banId;
  final String tenBan;
  final int khuvucId;
  final String trangThai;
  final String? qrCodeUrl;
  final DateTime? thoiGianBatDau; // Thời gian bắt đầu sử dụng bàn
  final String? loaiKhach; // Add this field to store customer type
  final String? loaiMenu; // Add this field to store menu type


  BanNhaHang({
    required this.banId,
    required this.tenBan,
    required this.khuvucId,
    required this.trangThai,
    this.qrCodeUrl,
    this.thoiGianBatDau, // Thêm trường thời gian bắt đầu
    this.loaiKhach, // Initialize the new field
    this.loaiMenu, // Initialize the new field
  });

  factory BanNhaHang.fromJson(Map<String, dynamic> json) {
    return BanNhaHang(
      banId: json['ban_id'],
      tenBan: json['ten_ban'],
      khuvucId: json['khuvuc_id'],
      trangThai: json['trang_thai'],
      qrCodeUrl: json['qr_code_url'],
      thoiGianBatDau: json['thoi_gian_bat_dau'] != null ? DateTime.parse(json['thoi_gian_bat_dau']) : null,
      loaiKhach: json['loai_khach'], // Map the new field from JSON
      loaiMenu: json['loai_menu'], // Map the new field from JSON
    );
  }
}
