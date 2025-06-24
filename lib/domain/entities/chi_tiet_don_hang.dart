import 'package:staff_order_restaurant/domain/entities/mon_an.dart';

class ChiTietDonHang {
  final int chiTietId;
  final int donHangId;
  final int soLuong;
  final int soLuongDaRa;
  final String? ghiChu;
  final String? trangThai;
  final MonAn? monAn;
  final String? nhanVienTen; // Added for 'Ra món' screen
  final String? nhanvienId; // Added for 'Ra món' screen
  final DateTime? thoiGianTaoDonHang; // Added for 'Ra món' screen

  ChiTietDonHang({
    required this.chiTietId,
    required this.donHangId,
    required this.soLuong,
    this.soLuongDaRa = 0,
    this.ghiChu,
    required this.trangThai,
    this.monAn,
    this.nhanVienTen,
    this.nhanvienId,
    this.thoiGianTaoDonHang,
  });

  factory ChiTietDonHang.fromJson(Map<String, dynamic> json) {
    // Hàm helper để chuyển đổi an toàn sang kiểu int
    int _safeParseInt(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is String) {
        try {
          return int.parse(value);
        } catch (e) {
          print('Lỗi chuyển đổi "$value" sang int: $e');
          return 0;
        }
      }
      if (value is double) return value.round();
      print('Kiểu dữ liệu không hỗ trợ: ${value.runtimeType}');
      return 0;
    }
    
    // Kiểm tra và parse MonAn một cách an toàn
    MonAn? parseMonAn(dynamic monAnData) {
      if (monAnData == null) return null;
      try {
        if (monAnData is Map<String, dynamic>) {
          return MonAn.fromJson(monAnData);
        }
        return null;
      } catch (e) {
        print('Lỗi khi parse MonAn: $e');
        return null;
      }
    }
    
    // Parse DateTime an toàn
    DateTime? parseDateTime(dynamic dateTimeStr) {
      if (dateTimeStr == null) return null;
      try {
        if (dateTimeStr is String) {
          return DateTime.parse(dateTimeStr);
        } else if (dateTimeStr is DateTime) {
          return dateTimeStr;
        }
        return null;
      } catch (e) {
        print('Lỗi khi parse DateTime từ $dateTimeStr: $e');
        return null;
      }
    }
    
    return ChiTietDonHang(
      chiTietId: _safeParseInt(json['chi_tiet_id']),
      donHangId: _safeParseInt(json['donhang_id']),
      soLuong: _safeParseInt(json['so_luong']),
      soLuongDaRa: _safeParseInt(json['so_luong_da_ra']),
      ghiChu: json['ghi_chu']?.toString(),
      trangThai: json['trang_thai']?.toString() ?? 'DangChoXuLy',
      monAn: parseMonAn(json['mon_an']),
      nhanVienTen: json['ho_ten']?.toString(),
      nhanvienId: json['nhanvien_id']?.toString(),
      thoiGianTaoDonHang: parseDateTime(json['thoi_gian_tao_don_hang']),
    );
  }

  ChiTietDonHang copyWith({
    int? chiTietId,
    int? donHangId,
    int? soLuong,
    int? soLuongDaRa,
    String? ghiChu,
    String? trangThai,
    MonAn? monAn,
    String? nhanVienTen,
    String? nhanvienId,
    DateTime? thoiGianTaoDonHang,
  }) {
    return ChiTietDonHang(
      chiTietId: chiTietId ?? this.chiTietId,
      donHangId: donHangId ?? this.donHangId,
      soLuong: soLuong ?? this.soLuong,
      soLuongDaRa: soLuongDaRa ?? this.soLuongDaRa,
      ghiChu: ghiChu ?? this.ghiChu,
      trangThai: trangThai ?? this.trangThai,
      monAn: monAn ?? this.monAn,
      nhanVienTen: nhanVienTen ?? this.nhanVienTen,
      nhanvienId: nhanvienId ?? this.nhanvienId,
      thoiGianTaoDonHang: thoiGianTaoDonHang ?? this.thoiGianTaoDonHang,
    );
  }
}
