import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/thong_tin_khach_hang.dart';
import 'api_dich_vu.dart';

class ThongTinKhachHangService {
  final ApiDichVu _apiService = ApiDichVu();

  // Create a new customer
  Future<ThongTinKhachHang?> createThongTinKhachHang({
    required String hoTen,
    required String soDienThoai,
    String? email,
    String? quocTich,
    String? nhomTuoi,
    String? loaiNhom,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.post(
        Uri.parse('${ApiDichVu.baseUrl}/thong-tin-khach-hang'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'ho_ten': hoTen,
          'so_dien_thoai': soDienThoai,
          'email': email,
          'quoc_tich': quocTich,
          'nhom_tuoi': nhomTuoi,
          'loai_nhom': loaiNhom,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return ThongTinKhachHang.fromJson(data['data']);
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể tạo thông tin khách hàng: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi tạo thông tin khách hàng: $e');
      return null;
    }
  }
}