import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class DanhGiaService {
  static const String _baseUrl = 'http://10.0.2.2:3000';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  /// Gửi đánh giá của khách hàng
  /// POST /api/danh-gia
  Future<void> submitDanhGia({
    required int phienId,
    required int diemSo,
    String? binhLuan,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.post(
      Uri.parse('$_baseUrl/api/danh-gia'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'phien_id': phienId,
        'diem_so': diemSo,
        'binh_luan': binhLuan,
      }),
    );

    if (res.statusCode != 201 && res.statusCode != 200) {
      final body = jsonDecode(res.body);
      throw Exception(body['message'] ?? 'Gửi đánh giá thất bại');
    }
  }
}
