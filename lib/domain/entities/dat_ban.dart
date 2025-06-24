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
  final double soTienCoc;
  final DateTime? thoiGianDatCoc; // Thời gian đặt cọc
  final int? phienId; // Mã phiên sử dụng bàn


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
    this.soTienCoc = 0.0,
    this.thoiGianDatCoc,
    this.phienId,
  });

  factory DatBan.fromJson(Map<String, dynamic> json) {
    // Defensive parsing: always provide safe defaults for all fields
    print('[DEBUG][DatBan.fromJson] JSON: ' + json.toString()); // Thêm log để kiểm tra dữ liệu trả về
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
      soTienCoc: (json['so_tien_coc'] != null) ? double.tryParse(json['so_tien_coc'].toString()) ?? 0.0 : 0.0,
      thoiGianDatCoc: (json['thoi_gian_dat_coc'] != null && json['thoi_gian_dat_coc'].toString().isNotEmpty)
          ? DateTime.tryParse(json['thoi_gian_dat_coc'].toString())
          : null,
      phienId: json['phien_id'],
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
      'so_tien_coc': soTienCoc,
      'phien_id': phienId, // Thêm dòng này để trả về phien_id
    };
  }

  DatBan copyWith({int? phienId}) {
    return DatBan(
      hoTen: hoTen,
      soDienThoai: soDienThoai,
      banTenList: banTenList,
      datbanId: datbanId,
      khachhangId: khachhangId,
      banId: banId,
      banIds: banIds,
      soKhach: soKhach,
      thoiGianDat: thoiGianDat,
      ghiChu: ghiChu,
      trangThai: trangThai,
      ngayTao: ngayTao,
      soTienCoc: soTienCoc,
      thoiGianDatCoc: thoiGianDatCoc,
      phienId: phienId ?? this.phienId,
    );
  }
}