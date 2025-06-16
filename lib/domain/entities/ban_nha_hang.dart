class BanNhaHang {
  BanNhaHang copyWith({
    int? banId,
    String? tenBan,
    int? khuvucId,
    String? trangThai,
    String? qrCodeUrl,
  }) {
    return BanNhaHang(
      banId: banId ?? this.banId,
      tenBan: tenBan ?? this.tenBan,
      khuvucId: khuvucId ?? this.khuvucId,
      trangThai: trangThai ?? this.trangThai,
      qrCodeUrl: qrCodeUrl ?? this.qrCodeUrl,
    );
  }
  final int banId;
  final String tenBan;
  final int khuvucId;
  final String trangThai;
  final String? qrCodeUrl;


  BanNhaHang({
    required this.banId,
    required this.tenBan,
    required this.khuvucId,
    required this.trangThai,
    this.qrCodeUrl,
  });

  factory BanNhaHang.fromJson(Map<String, dynamic> json) {
    return BanNhaHang(
      banId: json['ban_id'],
      tenBan: json['ten_ban'],
      khuvucId: json['khuvuc_id'],
      trangThai: json['trang_thai'],
      qrCodeUrl: json['qr_code_url'],
    );
  }
}
