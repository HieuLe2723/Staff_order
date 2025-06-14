import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../../domain/entities/nhan_vien.dart';
import 'api_dich_vu.dart';

class DangNhap {
  final ApiDichVu _apiDichVu = ApiDichVu();

  Future<NhanVienDoiTuong?> xacThuc(String maNhanVien, String matkhauHash) async {
    final nhanVien = await _apiDichVu.xacThuc(maNhanVien, matkhauHash);
    if (nhanVien != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', nhanVien.token);
      print('Token saved: ${nhanVien.token}');
    } else {
      print('Authentication failed');
    }
    return nhanVien;
  }

  Future<String?> layToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  Future<void> xoaToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  Future<String?> layRoleName() async {
    final token = await layToken();
    if (token == null) {
      print('No token found');
      return null;
    }
    try {
      final decoded = JwtDecoder.decode(token);
      print('Decoded token: $decoded');
      return decoded['role'] as String? ?? decoded['role_name'] as String?;
    } catch (e) {
      print('Lỗi giải mã JWT: $e');
      return null;
    }
  }
}