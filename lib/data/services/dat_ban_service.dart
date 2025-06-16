import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/dat_ban.dart';
import 'api_dich_vu.dart';

class DatBanService {
  /// Hủy đặt bàn (mềm), chuyển trạng thái đặt bàn sang 'Đã hủy' và trả bàn về trạng thái 'Sẵn sàng'.
  /// Dùng cho cả trường hợp đặt 1 bàn hoặc nhiều bàn (truyền đúng datBanId).
  Future<bool> huyDatBan(int datBanId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final response = await http.patch(
        Uri.parse('${ApiDichVu.baseUrl}/api/dat-ban/$datBanId/huy'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể hủy đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi hủy đặt bàn: $e');
      return false;
    }
  }

  /// Xóa đặt bàn (cứng), chỉ dùng cho admin hoặc cleanup. Truyền đúng datBanId.
  Future<bool> xoaDatBan(int datBanId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final response = await http.delete(
        Uri.parse('${ApiDichVu.baseUrl}/api/dat-ban/$datBanId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể xóa đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi xóa đặt bàn: $e');
      return false;
    }
  }

  final ApiDichVu _apiService = ApiDichVu();

  // Fetch all reservations (optionally filter by area/date)
  Future<List<DatBan>> getAllDatBan({int? khuVucId, DateTime? date, String? trangThai}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      String url = '${ApiDichVu.baseUrl}/api/dat-ban';
      Map<String, String> queryParams = {};
      if (khuVucId != null) queryParams['khuvuc_id'] = khuVucId.toString();
      if (date != null) queryParams['date'] = date.toIso8601String();
      if (trangThai != null) queryParams['trang_thai'] = trangThai;
      if (queryParams.isNotEmpty) {
        url += '?' + Uri(queryParameters: queryParams).query;
      }
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
        return list.map((e) => DatBan.fromJson(e)).toList();
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể lấy danh sách đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách đặt bàn: $e');
      return [];
    }
  }

  // Create a new reservation
  /// Tạo đặt bàn, hỗ trợ đặt nhiều bàn (multi-table booking)
  Future<List<DatBan>> createDatBan({
    int? khachHangId,
    required List<int> banIds,
    required int soKhach,
    required DateTime thoiGianDat,
    String? ghiChu,
    String? hoTen,
    String? soDienThoai,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      // Build payload: gửi ban_ids nếu nhiều bàn, ban_id nếu 1 bàn
      final Map<String, dynamic> payload = {
        'so_khach': soKhach,
        'thoi_gian_dat': thoiGianDat.toIso8601String(),
        'trang_thai': 'ChoXuLy',
      };
      if (banIds.length > 1) {
        payload['ban_ids'] = banIds;
      } else if (banIds.length == 1) {
        payload['ban_id'] = banIds.first;
      }
      if (khachHangId != null) {
        payload['khachhang_id'] = khachHangId;
      }
      if (hoTen != null && hoTen.isNotEmpty) {
        payload['ho_ten'] = hoTen;
      }
      if (soDienThoai != null && soDienThoai.isNotEmpty) {
        payload['so_dien_thoai'] = soDienThoai;
      }
      if (ghiChu != null && ghiChu.isNotEmpty) {
        payload['ghi_chu'] = ghiChu;
      }
      final response = await http.post(
        Uri.parse('${ApiDichVu.baseUrl}/api/dat-ban'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final dynamic raw = data['data'];
        // Always treat as a list for consistency
        if (raw is List) {
          return raw
              .where((e) => e != null)
              .map((e) => DatBan.fromJson(e as Map<String, dynamic>))
              .toList();
        } else if (raw is Map<String, dynamic>) {
          return [DatBan.fromJson(raw)];
        } else if (raw != null) {
          // Defensive: try to parse as Map if possible
          try {
            return [DatBan.fromJson(Map<String, dynamic>.from(raw))];
          } catch (_) {
            // Malformed backend data
            throw Exception('Dữ liệu trả về từ máy chủ không hợp lệ.');
          }
        } else {
          // Backend returned no data
          throw Exception('Không nhận được dữ liệu đặt bàn từ máy chủ.');
        }
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi đặt bàn: $e');
      return [];
    }
  }

  // Gán khách hàng vào đặt bàn sau khi đã tạo đặt bàn
  Future<void> ganKhachHangVaoDatBan(int datBanId, int khachHangId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');
      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }
      final response = await http.patch(
        Uri.parse('${ApiDichVu.baseUrl}/api/dat-ban/$datBanId/gan-khach-hang'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'khachhang_id': khachHangId}),
      );
      if (response.statusCode != 200) {
        throw Exception('Không thể gán khách hàng cho đặt bàn: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi gán khách hàng cho đặt bàn: $e');
      throw Exception('Lỗi khi gán khách hàng cho đặt bàn: $e');
    }
  }
}