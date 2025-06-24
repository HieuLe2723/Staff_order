import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/khuyen_mai.dart';

class KhuyenMaiService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  Future<KhuyenMai?> layKhuyenMaiTheoMa(String code) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.get(
      Uri.parse('$baseUrl/api/khuyen-mai/$code'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return KhuyenMai.fromJson(data['data']);
    } else {
      return null;
    }
  }
}
