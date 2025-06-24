import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/ban_nha_hang.dart';
import '../../domain/entities/khu_vuc.dart';
import 'api_dich_vu.dart';

class BanNhaHangService {
  /// Lấy danh sách khu vực nhà hàng (API: /api/khu-vuc)
  /// Trả về List<Map> các khu vực cho màn hình chọn khu vực
  Future<List<KhuVuc>> getDanhSachKhuVuc() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final url = '${ApiDichVu.baseUrl}/api/khu-vuc';
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
        return list.map((e) => KhuVuc.fromJson(e)).toList();
      } else {
        throw Exception('Không thể lấy danh sách khu vực: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách khu vực: $e');
      return [];
    }
  }

  /// Lấy danh sách bàn theo khu vực (API: /api/ban-nha-hang?khuvuc_id=...)
  /// Trả về danh sách bàn với trạng thái: trống, đang sử dụng, đã đặt.
  /// Dùng cho màn hình hiển thị bàn theo từng khu vực.
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

  /// Lấy danh sách bàn đang hoạt động (API: /api/ban-nha-hang/active)
  /// Trả về các bàn đang có khách ngồi (đang sử dụng)
  /// Dùng cho màn hình quản lý các bàn đang có khách.
  Future<List<BanNhaHang>> getActiveBans() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final url = '${ApiDichVu.baseUrl}/api/ban-nha-hang/active';
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
        throw Exception('Không thể lấy danh sách bàn đang hoạt động: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách bàn đang hoạt động: $e');
      return [];
    }
  }
}
