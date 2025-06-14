import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/dat_ban.dart';
import 'api_dich_vu.dart';

class DatBanService {
  final ApiDichVu _apiService = ApiDichVu();

  // Create a new reservation
  Future<DatBan?> createDatBan({
    required int khachHangId,
    required int banId,
    required int soKhach,
    required DateTime thoiGianDat,
    String? ghiChu,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.post(
        Uri.parse('${ApiDichVu.baseUrl}/dat-ban'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'khachhang_id': khachHangId,
          'ban_id': banId,
          'so_khach': soKhach,
          'thoi_gian_dat': thoiGianDat.toIso8601String(),
          'ghi_chu': ghiChu,
          'trang_thai': 'ChoXuLy',
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return DatBan.fromJson(data['data']);
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi đặt bàn: $e');
      return null;
    }
  }
}