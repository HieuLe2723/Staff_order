import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/ban_nha_hang.dart';
import 'api_dich_vu.dart';

class BanNhaHangService {
  Future<List<BanNhaHang>> getBanListByKhuVuc(int khuvucId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final url = '${ApiDichVu.baseUrl}/api/ban-nha-hang?khuvuc_id=$khuvucId';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> list = data['data'] ?? [];
        return list.map((e) => BanNhaHang.fromJson(e)).toList();
      } else {
        throw Exception('Không thể lấy danh sách bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách bàn: $e');
      return [];
    }
  }
}
