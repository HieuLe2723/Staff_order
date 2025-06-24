import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LoaiMenuService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  // Lấy danh sách loại menu
  Future<List<dynamic>> getLoaiMenu() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.get(
      Uri.parse('$baseUrl/api/loai-mon-an/loai-menu'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'] ?? [];
    } else {
      throw Exception('Không lấy được danh sách loại menu: \\${response.body}');
    }
  }
}
