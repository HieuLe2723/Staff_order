import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ChiTietDonHangService {
  static const String baseUrl = 'http://10.0.2.2:3000';

  Future<void> themMonVaoDonHang({
    required int donHangId,
    required int monAnId,
    required int soLuong,
    String? ghiChu,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.post(
      Uri.parse('$baseUrl/api/chi-tiet-don-hang'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'donhang_id': donHangId,
        'monan_id': monAnId,
        'so_luong': soLuong,
        if (ghiChu != null) 'ghi_chu': ghiChu,
      }),
    );
    if (response.statusCode != 201) {
      throw Exception('Không thêm được món: ${response.body}');
    }
  }

  Future<void> xoaMonKhoiDonHang(int chiTietId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.delete(
      Uri.parse('$baseUrl/api/chi-tiet-don-hang/$chiTietId'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode != 200) {
      throw Exception('Không xóa được món: ${response.body}');
    }
  }

  // Lấy danh sách món ăn đã gọi theo đơn hàng 
  // Chú ý: Phương thức này sẽ được thay thế bằng layChiTietDonHang vì backend không hỗ trợ endpoint by-order
  Future<List<dynamic>> layDanhSachMonDaGoi(int donHangId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    try {
      // Tìm phiên ID từ đơn hàng ID (Lấy từ cache hoặc sử dụng API để lấy thông tin đơn hàng)
      // Vì backend không có endpoint /by-order/, chúng ta cần lấy thông tin từ endpoint session
      final donHangInfo = await layThongTinDonHang(donHangId);
      if (donHangInfo == null || donHangInfo['phien_id'] == null) {
        throw Exception('Không tìm thấy thông tin đơn hàng');
      }
      
      final phienId = donHangInfo['phien_id'];
      
      // Sử dụng API by-session và sau đó lọc kết quả theo đơn hàng ID
      final allItems = await layDanhSachMonTheoPhien(phienId);
      
      // Lọc các món thuộc đơn hàng này
      final filteredItems = allItems.where((item) => 
        item != null && 
        item['donhang_id'] != null && 
        (item['donhang_id'].toString() == donHangId.toString())
      ).toList();
      
      return filteredItems;
    } catch (e) {
      print('Lỗi gọi API layDanhSachMonDaGoi: $e');
      throw Exception('Không lấy được danh sách món đã gọi: $e');
    }
  }
  
  Future<Map<String, dynamic>?> layThongTinDonHang(int donHangId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/don-hang/$donHangId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data.containsKey('data')) {
          return data['data'];
        }
      }
      return null;
    } catch (e) {
      print('Lỗi lấy thông tin đơn hàng: $e');
      return null;
    }
  }

  Future<List<dynamic>> layDanhSachMonTheoPhien(int phienId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    try {
      // Debug log phiên ID
      print('Đang lấy danh sách món theo phiên ID: $phienId');
      
      // Fix endpoint - đã kiểm tra trong backend code, endpoint đúng là /by-session/
      final response = await http.get(
        Uri.parse('$baseUrl/api/chi-tiet-don-hang/by-session/$phienId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      
      // Debug log response
      print('Response status: ${response.statusCode}');
      try {
        if (response.body.isNotEmpty) {
          print('Response body: ${response.body.substring(0, min(100, response.body.length))}...');
        } else {
          print('Response body is empty');
        }
      } catch (e) {
        print('Error printing response body: $e');
      }
      
      // Kiểm tra trạng thái và kiểu dữ liệu response
      if (response.statusCode == 200) {
        // Kiểm tra response có phải là JSON không
        if (response.body.isNotEmpty) {
          try {
            final data = jsonDecode(response.body);
            if (data is Map && data.containsKey('data')) {
              return List<dynamic>.from(data['data'] ?? []);
            } else {
              print('Dữ liệu response không đúng định dạng: $data');
              return [];
            }
          } catch (e) {
            print('Lỗi parse JSON: $e, Response body: ${response.body}');
            throw Exception('Dữ liệu không đúng định dạng JSON');
          }
        }
        return [];
      } else {
        print('API trả về lỗi: ${response.statusCode}, body: ${response.body}');
        throw Exception('API trả về lỗi ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('Lỗi gọi API layDanhSachMonTheoPhien: $e');
      throw Exception('Không lấy được danh sách món đã gọi theo phiên: $e');
    }
  }

  // Cập nhật ghi chú cho một món trong đơn hàng
  Future<void> capNhatGhiChu(int chiTietId, String ghiChu) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final res = await http.patch(
      Uri.parse('$baseUrl/api/chi-tiet-don-hang/$chiTietId/note'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'ghi_chu': ghiChu}),
    );
    if (res.statusCode != 200) {
      throw Exception('Cập nhật ghi chú thất bại: ${res.body}');
    }
  }

  /// Đánh dấu món đã ra/đã phục vụ
  Future<void> danhDauRaMon(int chiTietId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final res = await http.post(
      Uri.parse('$baseUrl/api/chi-tiet-don-hang/$chiTietId/serve'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Đánh dấu ra món thất bại: ${res.body}');
    }
  }

  /// Thống kê thời gian ra món, trả về map với tổng thời gian và danh sách chi tiết
  Future<Map<String, dynamic>> layThongKeThoiGianRaMon(int donHangId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final res = await http.get(
      Uri.parse('$baseUrl/api/don-hang/$donHangId/serving-stats'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body)['data'] as Map<String, dynamic>;
    } else {
      throw Exception('Không lấy được thống kê ra món: ${res.body}');
    }
  }

  Future<Map<String, dynamic>> guiOrder(int banId, List<Map<String, dynamic>> items) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final nhanVienId = prefs.getString('nhanvien_id');
    
    try {
      // Fetch the current active session for the table
      final response = await http.get(
        Uri.parse('$baseUrl/api/phien-su-dung-ban/active-by-ban/$banId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode != 200) {
        throw Exception('Không thể lấy thông tin phiên sử dụng bàn: ${response.body}');
      }
      
      final data = jsonDecode(response.body);
      final phienId = data['data']['phien_id'];
      
      if (phienId == null) {
        throw Exception('Không tìm thấy phiên sử dụng bàn');
      }
      
      // Create a new order for the session
      final orderResponse = await http.post(
        Uri.parse('$baseUrl/api/don-hang'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'phien_id': phienId,
          'nhanvien_id': nhanVienId,
          'items': items,
        }),
      );
      
      if (orderResponse.statusCode != 201) {
        throw Exception('Không thể tạo đơn hàng: ${orderResponse.body}');
      }
      
      final orderData = jsonDecode(orderResponse.body);
      
      return {
        'phien_id': phienId,
        'don_hang_id': orderData['data']['donhang_id'],
        'message': 'Gửi order thành công'
      };
    } catch (e) {
      print('Lỗi khi gửi order: $e');
      throw Exception('Không thể gửi order: $e');
    }
  }

  // Update the status of a specific order detail item
  Future<void> updateTrangThaiChiTiet(int chiTietId, String trangThai) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    final response = await http.patch(
      Uri.parse('$baseUrl/api/chi-tiet-don-hang/$chiTietId/status'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'trang_thai': trangThai}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update item status: ${response.body}');
    }
  }
  
  // Cập nhật trạng thái nhiều món ăn cùng lúc
  Future<void> updateTrangThaiNhieuMon(List<int> chiTietIds, String trangThai) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    
    try {
      print('Cập nhật trạng thái cho ${chiTietIds.length} món thành $trangThai');
      
      final response = await http.patch(
        Uri.parse('$baseUrl/api/chi-tiet-don-hang/serve-bulk'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'chi_tiet_ids': chiTietIds,
          'trang_thai': trangThai
        }),
      );
      
      if (response.statusCode != 200) {
        throw Exception('Cập nhật trạng thái hàng loạt thất bại: ${response.body}');
      }
      
      print('Cập nhật trạng thái hàng loạt thành công!');
    } catch (e) {
      print('Lỗi cập nhật trạng thái hàng loạt: $e');
      throw Exception('Không thể cập nhật trạng thái: $e');
    }
  }

  Future<void> updateSoLuongDaRa(List<Map<String, dynamic>> items) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    final url = Uri.parse('$baseUrl/api/chi-tiet-don-hang/update-so-luong-ra');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'items': items}),
    );

    if (response.statusCode != 200) {
      final responseBody = jsonDecode(response.body);
      throw Exception(responseBody['message'] ?? 'Failed to update served quantities');
    }
  }
}
