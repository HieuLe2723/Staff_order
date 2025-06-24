import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'api_dich_vu.dart';


class PhienService {
  static const String _baseUrl = ApiDichVu.baseUrl;

  /// Tạo phiên sử dụng bàn (POST /api/phien)
  /// Trả về Map dữ liệu phiên vừa tạo.
  Future<Map<String, dynamic>> createPhien({
    required int banId,
    required String nhanVienId,
    required int soKhachNguoiLon,
    required int soKhachTreEmCoPhi,
    required int soKhachTreEmMienPhi,
    required String loaiKhach,
    required String loaiMenu,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) {
      throw Exception('Vui lòng đăng nhập lại.');
    }

    final response = await http.post(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'ban_id': banId,
        'nhanvien_id': nhanVienId,
        'so_khach_nguoi_lon': soKhachNguoiLon,
        'so_khach_tre_em_co_phi': soKhachTreEmCoPhi,
        'so_khach_tre_em_mien_phi': soKhachTreEmMienPhi,
        'loai_khach': loaiKhach,
        'loai_menu': loaiMenu,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body)['data'];
    } else {
      throw Exception('Tạo phiên thất bại: ${response.body}');
    }
  }

  /// Kết thúc phiên (PATCH /api/phien/{id}/end)
  Future<void> endPhien(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.patch(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/$phienId/end'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Kết thúc phiên thất bại: ${res.body}');
    }
  }

  /// Hủy một phiên rỗng (chưa có đơn hàng)
  /// (DELETE /api/phien-su-dung-ban/:id/cancel-empty)
  Future<void> cancelEmptyPhien(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.delete(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/$phienId/cancel-empty'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Hủy phiên rỗng thất bại: ${res.body}');
    }
  }

  /// Xoá phiên (DELETE /api/phien/{id})
  /// Áp dụng mã khuyến mãi cho phiên
  /// (POST /api/phien-su-dung-ban/:phien_id/apply-promotion)
  Future<Map<String, dynamic>> applyPromotion(int phienId, String maKhuyenMai) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.post(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/$phienId/apply-promotion'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'ma_khuyen_mai': maKhuyenMai}),
    );

    final body = jsonDecode(res.body);

    if (res.statusCode == 200) {
      return body; // Trả về thông điệp thành công và dữ liệu
    } else {
      // Ném ra lỗi với thông điệp từ server nếu có
      throw Exception(body['message'] ?? 'Áp dụng khuyến mãi thất bại');
    }
  }

  /// Lấy thông tin thanh toán cho một phiên
  /// GET /api/phien-su-dung-ban/:phien_id/payment-info
  Future<Map<String, dynamic>> getPaymentInfo(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.get(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/$phienId/payment-info'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body['data'];
    } else {
      throw Exception(body['message'] ?? 'Lấy thông tin thanh toán thất bại');
    }
  }

  Future<void> deletePhien(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.delete(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/$phienId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Xoá phiên thất bại: ${res.body}');
    }
  }

  /// Gọi backend tự huỷ các phiên rỗng (không có món nào) (POST /api/phien/auto-cancel)
  Future<void> autoCancelIfEmpty() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) return;

    await http.post(
      Uri.parse('$_baseUrl/api/phien-su-dung-ban/auto-cancel'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    // Không cần xử lý response, backend sẽ tự huỷ và trả về danh sách phiên đã huỷ nếu cần.
  }
}
