class MonAn {
  final int? monAnId;
  final String? tenMon;
  final int? loaiId;
  final double? gia;
  final bool? khoa;
  final DateTime? ngayKhoa;
  final String? hinhAnh;

  MonAn({
    this.monAnId,
    this.tenMon,
    this.loaiId,
    this.gia,
    this.khoa,
    this.ngayKhoa,
    this.hinhAnh,
  });

  factory MonAn.fromJson(Map<String, dynamic> json) {
    // Hàm helper để parse id an toàn
    int? _safeParseInt(dynamic value) {
      if (value == null) return null;
      if (value is int) return value;
      if (value is String) {
        try {
          return int.parse(value);
        } catch (e) {
          print('Lỗi chuyển đổi "$value" sang int: $e');
          return null;
        }
      }
      if (value is double) return value.round();
      return null;
    }
    
    // Parse DateTime an toàn
    DateTime? _parseDateTimeSafe(dynamic dateStr) {
      if (dateStr == null) return null;
      try {
        if (dateStr is String) {
          return DateTime.parse(dateStr);
        }
        return null;
      } catch (e) {
        print('Lỗi parse DateTime "$dateStr": $e');
        return null;
      }
    }
    
    return MonAn(
      monAnId: _safeParseInt(json['monan_id']),
      tenMon: json['ten_mon']?.toString(),
      loaiId: _safeParseInt(json['loai_id']),
      gia: _parseGia(json['gia']),
      khoa: json['khoa'] == 1 || json['khoa'] == true,
      ngayKhoa: _parseDateTimeSafe(json['ngay_khoa']),
      hinhAnh: json['hinh_anh']?.toString(),
    );
  }

  // Helper to parse giá ở nhiều kiểu dữ liệu
  static double? _parseGia(dynamic rawGia) {
    if (rawGia == null) return null;
    if (rawGia is num) return rawGia.toDouble();
    if (rawGia is String) {
      return double.tryParse(rawGia);
    }
    return null;
  }
}
