import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:staff_order_restaurant/data/services/thanh_toan_service.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_thanh_toan_thanh_cong.dart';
import 'package:url_launcher/url_launcher.dart';

class ManHinhLuaChonThanhToan extends StatefulWidget {
  final int phienId;
  final String tenBan;

  const ManHinhLuaChonThanhToan({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhLuaChonThanhToan> createState() => _ManHinhLuaChonThanhToanState();
}

class _ManHinhLuaChonThanhToanState extends State<ManHinhLuaChonThanhToan> {
  final ThanhToanService _thanhToanService = ThanhToanService();
  final TextEditingController _promoController = TextEditingController();

  bool _isLoading = true;
  bool _isProcessingPayment = false;
  bool _isApplyingPromo = false;
  String? _errorMessage;
  Map<String, dynamic>? _billDetails;
  int? _thanhToanId;

  @override
  void initState() {
    super.initState();
    _loadBillDetails();
  }

  Future<void> _loadBillDetails({bool showLoading = true}) async {
    if (showLoading && mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }
    try {
      final data = await _thanhToanService.getBillDetails(widget.phienId);
      if (mounted) {
        setState(() {
          _billDetails = data;
          _thanhToanId = data['payment']['thanhtoan_id'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  void _navigateToSuccessScreen() {
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const ManHinhThanhToanThanhCong()),
      (Route<dynamic> route) => false,
    );
  }

  Future<void> _processCashPayment() async {
    if (_thanhToanId == null) return;
    setState(() => _isProcessingPayment = true);
    try {
      await _thanhToanService.updatePaymentStatus(_thanhToanId!, 'HoanTat', phuongThuc: 'TienMat');
      _navigateToSuccessScreen();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi thanh toán: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isProcessingPayment = false);
    }
  }

  Future<void> _processVNPayPayment() async {
    if (_thanhToanId == null || _billDetails == null) return;
    setState(() => _isProcessingPayment = true);

    final totalAmount = (_billDetails!['bill']['total_amount'] as num).toDouble();

    try {
      // First, update the payment method to VNPay
      await _thanhToanService.updatePaymentStatus(_thanhToanId!, 'ChoThanhToan', phuongThuc: 'VNPay');
      
      // Then, create the VNPay URL with the correct amount
      final vnpayUrl = await _thanhToanService.createVNPayUrl(widget.phienId, totalAmount);
      
      if (!mounted) return;
      final Uri url = Uri.parse(vnpayUrl);
      
      // For demo, we assume payment is successful after launching the URL
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        // In a real app, you'd wait for a callback from VNPay.
        // Here, we proceed directly to success screen for demo purposes.
        _navigateToSuccessScreen();
      } else {
        throw 'Không thể mở link thanh toán VNPay.';
      }

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
      );
      // If creating VNPay URL fails, revert status or handle accordingly
      await _thanhToanService.updatePaymentStatus(_thanhToanId!, 'DaTao', phuongThuc: 'TienMat');

    } finally {
      if (mounted) {
        setState(() => _isProcessingPayment = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Thanh toán cho ${widget.tenBan}'),
        backgroundColor: Colors.deepPurple,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(child: Text('Lỗi: $_errorMessage', style: const TextStyle(color: Colors.red)));
    }
    if (_billDetails == null) {
      return const Center(child: Text('Không có dữ liệu hóa đơn.'));
    }

    final bill = _billDetails!['bill'];
    final items = bill['items'] as List;
    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
    final totalAmount = (bill['total_amount'] as num).toDouble();

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(8.0),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text('${item['ten_mon']} (x${item['so_luong']})'),
                trailing: Text(formatCurrency.format(item['thanh_tien'])),
              );
            },
          ),
        ),
        _buildBottomBar(totalAmount, items.isNotEmpty),
      ],
    );
  }

  Widget _buildBottomBar(double totalAmount, bool hasItems) {
    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Divider(),
          _buildInfoRow('Tổng cộng:', formatCurrency.format(totalAmount), isTotal: true),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.money),
                  label: const Text('Tiền mặt'),
                  onPressed: _isProcessingPayment || !hasItems ? null : _processCashPayment,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.qr_code),
                  label: const Text('VNPay'),
                  onPressed: _isProcessingPayment || !hasItems ? null : _processVNPayPayment,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    backgroundColor: Colors.red.shade400,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          if (_isProcessingPayment)
            const Padding(
              padding: EdgeInsets.only(top: 16.0),
              child: Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isTotal = false}) {
    final style = isTotal
        ? Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.red, fontWeight: FontWeight.bold)
        : Theme.of(context).textTheme.titleMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.titleMedium),
          Text(value, style: style),
        ],
      ),
    );
  }
}
