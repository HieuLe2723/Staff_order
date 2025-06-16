class DatBan {
  final String? hoTen;
  final String? soDienThoai;
  final List<String> banTenList;
  final int datbanId;
  final int? khachhangId;
  final int? banId;
  /// Luôn là list, không bao giờ null
  final List<int> banIds;
  final int soKhach;
  final DateTime thoiGianDat;
  final String? ghiChu;
  final String trangThai;
  final DateTime ngayTao;
  


  DatBan({
    this.banTenList = const [],
    required this.datbanId,
    this.khachhangId,
    this.banId,
    this.banIds = const [],
    required this.soKhach,
    required this.thoiGianDat,
    this.ghiChu,
    required this.trangThai,
    required this.ngayTao,
    this.hoTen,
    this.soDienThoai,
  });

  factory DatBan.fromJson(Map<String, dynamic> json) {
    // Defensive parsing: always provide safe defaults for all fields
    return DatBan(
      banTenList: (json['ban_ten_list'] is List)
          ? (json['ban_ten_list'] as List).where((e) => e != null).map((e) => e.toString()).toList()
          : [],
      datbanId: json['datban_id'] ?? 0,
      khachhangId: json['khachhang_id'], // nullable
      banId: json['ban_id'], // nullable
      // Đảm bảo luôn trả về list rỗng nếu không có dữ liệu
      banIds: (json['ban_ids'] is List)
          ? (json['ban_ids'] as List).where((e) => e != null).map((e) => e as int).toList()
          : [], // always a list, never null
      soKhach: json['so_khach'] ?? 0,
      thoiGianDat: (json['thoi_gian_dat'] != null && json['thoi_gian_dat'].toString().isNotEmpty)
          ? DateTime.tryParse(json['thoi_gian_dat'].toString()) ?? DateTime.now()
          : DateTime.now(),
      ghiChu: (json['ghi_chu'] ?? '').toString(), // always a string
      trangThai: json['trang_thai'] ?? '',
      ngayTao: (json['ngay_tao'] != null && json['ngay_tao'].toString().isNotEmpty)
          ? DateTime.tryParse(json['ngay_tao'].toString()) ?? DateTime.now()
          : DateTime.now(),
      hoTen: json['ho_ten'],
      soDienThoai: json['so_dien_thoai'],
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
      'ho_ten': hoTen,
      'so_dien_thoai': soDienThoai,
    };
  }
}