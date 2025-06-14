// lib/domain/entities/nhan_vien.dart
class NhanVienDoiTuong {
  final String nhanvienId;
  final String hoTen;
  final String? role;
  final String token;

  NhanVienDoiTuong({
    required this.nhanvienId,
    required this.hoTen,
    this.role,
    required this.token,
  });

  factory NhanVienDoiTuong.fromJson(Map<String, dynamic> json) {
    // Kiểm tra và xử lý null
    final nhanvienId = json['nhanvien_id'] as String? ?? '';
    final hoTen = json['ho_ten'] as String? ?? '';
    final role = json['role'] ?? json['role_name'] as String?;
    final token = json['token'] as String? ?? '';

    if (nhanvienId.isEmpty || hoTen.isEmpty || token.isEmpty) {
      throw Exception('Dữ liệu đăng nhập không hợp lệ');
    }

    return NhanVienDoiTuong(
      nhanvienId: nhanvienId,
      hoTen: hoTen,
      role: role,
      token: token,
    );
  }
}