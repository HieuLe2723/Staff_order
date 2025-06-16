class DatBan {
  final int datbanId;
  final int? khachhangId;
  final int? banId;
  final List<int> banIds;
  final int soKhach;
  final DateTime thoiGianDat;
  final String? ghiChu;
  final String trangThai;
  final DateTime ngayTao;

  DatBan({
    required this.datbanId,
    this.khachhangId,
    this.banId,
    this.banIds = const [],
    required this.soKhach,
    required this.thoiGianDat,
    this.ghiChu,
    required this.trangThai,
    required this.ngayTao,
  });

  factory DatBan.fromJson(Map<String, dynamic> json) {
    return DatBan(
      datbanId: json['datban_id'],
      khachhangId: json['khachhang_id'],
      banId: json['ban_id'],
      banIds: (json['ban_ids'] as List?)?.map((e) => e as int).toList() ?? [],
      soKhach: json['so_khach'],
      thoiGianDat: DateTime.parse(json['thoi_gian_dat']),
      ghiChu: json['ghi_chu'],
      trangThai: json['trang_thai'],
      ngayTao: DateTime.parse(json['ngay_tao']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'datban_id': datbanId,
      'khachhang_id': khachhangId,
      'ban_id': banId,
      'so_khach': soKhach,
      'thoi_gian_dat': thoiGianDat.toIso8601String(),
      'ghi_chu': ghiChu,
      'trang_thai': trangThai,
      'ngay_tao': ngayTao.toIso8601String(),
    };
  }
}