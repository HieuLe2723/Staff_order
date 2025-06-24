// lib/data/services/ca_lam_viec_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/entities/ca_lam_viec.dart';
import '../../domain/entities/nhan_vien.dart';
import '../../domain/entities/phan_ca_nhan_vien.dart';
import 'api_dich_vu.dart';

class CaLamViecService {

  Future<List<CaLamViec>> getAllShifts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.get(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['data'] as List;
        return data.map((json) => CaLamViec.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể lấy danh sách ca làm việc: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách ca làm việc: $e');
      throw Exception('Lỗi khi lấy danh sách ca làm việc: $e');
    }
  }

  Future<CaLamViec> createShift({
    required String tenCa,
    required String thoiGianBatDau,
    required String thoiGianKetThuc,
    String? moTa,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.post(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/create'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'ten_ca': tenCa,
          'thoi_gian_bat_dau': thoiGianBatDau,
          'thoi_gian_ket_thuc': thoiGianKetThuc,
          'mo_ta': moTa,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return CaLamViec.fromJson(data['data']);
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể tạo ca làm việc: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi tạo ca làm việc: $e');
      throw Exception('Lỗi khi tạo ca làm việc: $e');
    }
  }

  Future<void> updateShift({
    required int calamviecId,
    required String tenCa,
    required String thoiGianBatDau,
    required String thoiGianKetThuc,
    String? moTa,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.put(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/$calamviecId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'ten_ca': tenCa,
          'thoi_gian_bat_dau': thoiGianBatDau,
          'thoi_gian_ket_thuc': thoiGianKetThuc,
          'mo_ta': moTa,
        }),
      );

      if (response.statusCode == 200) {
        return;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể cập nhật ca làm việc: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi cập nhật ca làm việc: $e');
      throw Exception('Lỗi khi cập nhật ca làm việc: $e');
    }
  }

  Future<void> updateShiftAssignment({
    required int phancaId,
    required String nhanvienId,
    required int calamviecId,
    required String ngayLam,
    String? ghiChu,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.put(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/assign/$phancaId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'nhanvien_id': nhanvienId,
          'calamviec_id': calamviecId,
          'ngay_lam': ngayLam,
          'ghi_chu': ghiChu,
        }),
      );

      if (response.statusCode == 200) {
        return;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể cập nhật phân ca: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi cập nhật phân ca: $e');
      throw Exception('Lỗi khi cập nhật phân ca: $e');
    }
  }

  Future<void> deleteShift(int calamviecId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.delete(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/$calamviecId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể xóa ca làm việc: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi xóa ca làm việc: $e');
      throw Exception('Lỗi khi xóa ca làm việc: $e');
    }
  }

  Future<void> deleteShiftAssignment(int phancaId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.delete(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/assign/$phancaId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể xóa phân ca: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi xóa phân ca: $e');
      throw Exception('Lỗi khi xóa phân ca: $e');
    }
  }

  Future<List<PhanCaNhanVien>> getEmployeeShifts({
    required String nhanvienId,
    required String startDate,
    required String endDate,
    int? calamviecId,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final uri = Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/employee-shifts')
          .replace(queryParameters: {
        'nhanvien_id': nhanvienId.isNotEmpty ? nhanvienId : null,
        'startDate': startDate,
        'endDate': endDate,
        if (calamviecId != null) 'calamviec_id': calamviecId.toString(),
      });

      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['data'] as List;
        return data.map((json) => PhanCaNhanVien.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể lấy danh sách ca làm việc của nhân viên: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách ca làm việc của nhân viên: $e');
      throw Exception('Lỗi khi lấy danh sách ca làm việc của nhân viên: $e');
    }
  }

  Future<List<NhanVienDoiTuong>> getAllEmployees() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.get(
        Uri.parse('${ApiDichVu.baseUrl}/api/nhan-vien'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['data'] as List;
        return data.map((json) => NhanVienDoiTuong.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể lấy danh sách nhân viên: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi lấy danh sách nhân viên: $e');
      throw Exception('Lỗi khi lấy danh sách nhân viên: $e');
    }
  }

  Future<void> assignShift({
    required String nhanvienId,
    required int calamviecId,
    required String ngayLam,
    String? ghiChu,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (token == null) {
        throw Exception('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      final response = await http.post(
        Uri.parse('${ApiDichVu.baseUrl}/api/ca-lam-viec/assign'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'nhanvien_id': nhanvienId,
          'calamviec_id': calamviecId,
          'ngay_lam': ngayLam,
          'ghi_chu': ghiChu,
        }),
      );

      if (response.statusCode == 201) {
        return;
      } else if (response.statusCode == 401) {
        await prefs.remove('jwt_token');
        throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        throw Exception('Không thể phân ca: ${response.body}');
      }
    } catch (e) {
      print('Lỗi khi phân ca: $e');
      throw Exception('Lỗi khi phân ca: $e');
    }
  }
}