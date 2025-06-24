import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../domain/entities/nhan_vien.dart';

class ApiDichVu {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Use 10.0.2.2 for Android emulator

  Future<NhanVienDoiTuong?> xacThuc(String maNhanVien, String matkhauHash) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nhanvien_id': maNhanVien, 'password': matkhauHash}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Nếu có trường 'data' thì parse user, nếu có 'message' thì báo lỗi
      if (data.containsKey('data')) {
        final userData = data['data'];
        return NhanVienDoiTuong.fromJson(userData);
      } else if (data.containsKey('message')) {
        print('Đăng nhập thất bại: ${data['message']}');
        return null;
      } else {
        print('Phản hồi không hợp lệ từ server: ${response.body}');
        return null;
      }
    } else {
      print('Server responded with status code: ${response.statusCode}');
      print('Response body: ${response.body}');
      return null;
    }
  }
}