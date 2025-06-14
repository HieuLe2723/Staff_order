import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/khu_vuc.dart';

class KhuVucKho {
  static const String baseUrl = 'http://10.0.2.2:3000';

  Future<List<KhuVuc>> layDanhSachKhuVuc() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/api/khu-vuc'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        print('API Response: $jsonResponse'); // Log toàn bộ phản hồi
        List<dynamic> data = jsonResponse['data'] ?? []; // Xử lý nếu data là mảng hoặc null
        return data.map((json) => KhuVuc.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (response.statusCode == 403) {
        final error = jsonDecode(response.body);
        throw Exception('${error['message']} (Mã: ${response.statusCode})');
      } else {
        print('Lỗi từ server: ${response.statusCode} - ${response.body}');
        throw Exception('Không thể tải danh sách khu vực: ${response.statusCode}');
      }
    } catch (e) {
      print('Lỗi khi gọi API khu vực: $e');
      throw Exception('Không thể tải danh sách khu vực: $e');
    }
  }
}