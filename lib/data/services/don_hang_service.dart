import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class DonHangService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  /// Lấy danh sách đơn hàng theo phiên ID
  /// Sử dụng API mới GET /api/don-hang/by-phien/:phien_id
  Future<List<dynamic>> layDonHangTheoPhien(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final response = await http.get(
      Uri.parse('$baseUrl/api/don-hang/by-phien/$phienId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['data'] == null) {
        return [];
      }
      return data['data'] as List<dynamic>;
    } else {
      throw Exception('Không thể lấy đơn hàng cho phiên ID: $phienId - ${response.body}');
    }
  }

  // Đổi tên hàm để rõ nghĩa hơn: lấy phiên hoạt động theo mã bàn
Future<Map<String, dynamic>?> layPhienHoatDongTheoBan(int banId) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');

  // URL đã được sửa lại cho đúng với API mới
  final response = await http.get(
    Uri.parse('$baseUrl/api/phien-su-dung-ban/active/by-table/$banId'),
    headers: {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    // API trả về phiên trong 'data', nên ta return data['data']
    return data['data'];
  } else if (response.statusCode == 404) {
    // Đây là trường hợp bàn trống, không có phiên hoạt động.
    // Không phải lỗi, nên ta chỉ cần trả về null.
    print('Bàn $banId không có phiên hoạt động.');
    return null;
  } else {
    // Xử lý các lỗi khác (500, 401, ...)
    print('Lỗi khi lấy phiên hoạt động: ${response.statusCode}');
    print('Nội dung lỗi: ${response.body}');
    return null;
  }
}
// Cần truyền vào danh sách các món ăn (items) và sửa loaiMenu thành loaiId
Future<Map<String, dynamic>?> taoDonHang({
  required int phienId,
  required int loaiId, // <-- SỬA 1: Đổi từ String loaiMenu sang int loaiId
  required List<Map<String, dynamic>> items, // <-- THÊM 1: Thêm danh sách items
  int? khuyenMaiId,
  double? giaTriGiam,
  double? tongTien,
  String? trangThai,
}) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt_token');
  if (token == null) throw Exception('Vui lòng đăng nhập lại.');

  final response = await http.post(
    Uri.parse('$baseUrl/api/don-hang'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'phien_id': phienId,
      'loai_id': loaiId, // <-- SỬA 2: Đổi key từ 'loai_menu' sang 'loai_id'
      'items': items, // <-- THÊM 2: Thêm items vào body của request
      if (khuyenMaiId != null) 'khuyenmai_id': khuyenMaiId,
      if (giaTriGiam != null) 'gia_tri_giam': giaTriGiam,
      if (tongTien != null) 'tong_tien': tongTien,
      if (trangThai != null) 'trang_thai': trangThai,
    }),
  );

  if (response.statusCode == 201) {
    return jsonDecode(response.body)['data'];
  } else {
    // Ném ra lỗi với nội dung từ server để dễ debug hơn
    throw Exception('Tạo đơn hàng thất bại: ${response.body}');
  }
}

  /// Kiểm tra xem đơn hàng có rỗng hay không (không có món nào)
  Future<bool> kiemTraDonHangRong(int donHangId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final res = await http.get(
      Uri.parse('$baseUrl/api/don-hang/$donHangId/is-empty'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return (data['data'] as bool?) ?? true;
    } else {
      throw Exception('Không kiểm tra được trạng thái đơn hàng: ${res.body}');
    }
  }
  // In your DonHangService class (e.g., don_hang_service.dart)

  Future<Map<String, dynamic>> addItemsToOrder({
    required int donHangId,
    required List<Map<String, dynamic>> items,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    // API endpoint để thêm nhiều món vào một đơn hàng đã có
    final response = await http.post(
      Uri.parse('$baseUrl/api/don-hang/$donHangId/items'), // URL: /api/don-hang/{id}/items
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'items': items, // Body chỉ cần chứa danh sách items
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Thêm món vào đơn hàng thất bại: ${response.body}');
    }
  }
}
