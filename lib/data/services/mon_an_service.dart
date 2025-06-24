import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/mon_an.dart';

class MonAnService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  // Lấy danh sách món ăn theo loại
  Future<List<MonAn>> getMonAnTheoLoai(int loaiId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final uri = Uri.parse('$baseUrl/api/mon-an?loai_id=$loaiId');
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> list = data['data'] ?? [];
      return list.map((e) => MonAn.fromJson(e)).toList();
    } else {
      throw Exception('Không lấy được danh sách món ăn theo loại: ${response.body}');
    }
  }

  Future<List<MonAn>> getMenu({String? loaiMenu}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final uri = Uri.parse('$baseUrl/api/mon-an${loaiMenu != null ? '?loai_monan=$loaiMenu' : ''}');
    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> list = data['data'] ?? [];
      return list.map((e) => MonAn.fromJson(e)).toList();
    } else {
      throw Exception('Không lấy được menu: ${response.body}');
    }
  }
}
