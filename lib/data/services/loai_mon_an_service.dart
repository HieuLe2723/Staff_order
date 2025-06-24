import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/loai_mon_an.dart';

class LoaiMonAnService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  // Lấy danh sách loại món ăn theo loại menu (filter theo loai_menu)
  Future<List<LoaiMonAn>> getLoaiMonAn({String? loaiMenu}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    String url = '$baseUrl/api/loai-mon-an';
    if (loaiMenu != null) {
      url += '?loai_menu=$loaiMenu';
    }

  final response = await http.get(
    Uri.parse(url),
    headers: {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final List<dynamic> list = data['data'] ?? [];
    return list.map((e) => LoaiMonAn.fromJson(e)).toList();
  } else {
    throw Exception('Không lấy được danh sách loại món ăn: ${response.body}');
  }
}
}
