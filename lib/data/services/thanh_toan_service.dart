import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ThanhToanService {
  static const String _baseUrl = 'http://10.0.2.2:3000';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  /// Lấy thông tin Hóa Đơn để thanh toán
  /// GET /api/thanh-toan/phien/:phien_id/bill
  Future<Map<String, dynamic>> getBillDetails(int phienId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final url = Uri.parse('$_baseUrl/api/thanh-toan/checkout');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'phien_id': phienId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load bill details: ${response.body}');
    }
  }

  /// Áp dụng Mã khuyến mãi
  /// POST /api/thanh-toan/phien/:phien_id/apply-promo
  Future<Map<String, dynamic>> applyPromoCode(int phienId, String promoCode) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.post(
      Uri.parse('$_baseUrl/api/thanh-toan/phien/$phienId/apply-promo'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'ma_code': promoCode}),
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body;
    } else {
      throw Exception(body['message'] ?? 'Áp dụng mã khuyến mãi thất bại');
    }
  }

  /// Thanh toán bằng Tiền mặt
  /// POST /api/thanh-toan/cash
  Future<Map<String, dynamic>> createCashPayment(int phienId, double soTien) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.post(
      Uri.parse('$_baseUrl/api/thanh-toan/cash'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'phien_id': phienId,
        'so_tien': soTien,
      }),
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200 || res.statusCode == 201) {
      return body;
    } else {
      throw Exception(body['message'] ?? 'Thanh toán tiền mặt thất bại');
    }
  }

  /// Tạo URL thanh toán VNPay
  /// POST /api/thanh-toan/:phien_id/create-vnpay-url
  Future<String> createVNPayUrl(int phienId, double amount) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.post(
      Uri.parse('$_baseUrl/api/thanh-toan/$phienId/create-vnpay-url'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
       body: jsonEncode({
        'amount': amount,
        'orderInfo': 'Thanh toan cho phien $phienId',
      }),
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body['paymentUrl']; // Sửa key thành 'paymentUrl'
    } else {
      throw Exception(body['message'] ?? 'Tạo link VNPay thất bại');
    }
  }

  /// Kiểm tra trạng thái Giao dịch VNPay
  /// GET /api/thanh-toan/:thanhtoan_id/status
  Future<Map<String, dynamic>> checkVNPayStatus(int thanhtoanId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final res = await http.get(
      Uri.parse('$_baseUrl/api/thanh-toan/$thanhtoanId/status'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final body = jsonDecode(res.body);
    if (res.statusCode == 200) {
      return body;
    } else {
      throw Exception(body['message'] ?? 'Kiểm tra trạng thái VNPay thất bại');
    }
  }

  /// Cập nhật trạng thái và phương thức thanh toán
  /// PUT /api/thanh-toan/:id/status
  Future<void> updatePaymentStatus(int thanhtoanId, String status, {String? phuongThuc}) async {
    final token = await _getToken();
    if (token == null) throw Exception('Vui lòng đăng nhập lại.');

    final Map<String, dynamic> body = {
      'status': status,
    };
    if (phuongThuc != null) {
      body['phuong_thuc'] = phuongThuc;
    }

    final res = await http.patch(
      Uri.parse('$_baseUrl/api/thanh-toan/$thanhtoanId/status'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    if (res.statusCode != 200) {
      final resBody = jsonDecode(res.body);
      throw Exception(resBody['message'] ?? 'Cập nhật trạng thái thanh toán thất bại');
    }
  }
}
