import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:staff_order_restaurant/data/services/thanh_toan_service.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_danh_gia.dart';
import 'package:url_launcher/url_launcher.dart';

class ManHinhThanhToan extends StatefulWidget {
  final int phienId;
  final String tenBan;

  const ManHinhThanhToan({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhThanhToan> createState() => _ManHinhThanhToanState();
}

class _ManHinhThanhToanState extends State<ManHinhThanhToan> {
  final ThanhToanService _thanhToanService = ThanhToanService();
  final TextEditingController _promoController = TextEditingController();

  bool _isLoading = true;
  bool _isProcessingPayment = false;
  bool _isApplyingPromo = false;
  String? _errorMessage;
  Map<String, dynamic>? _billDetails;

  @override
  void initState() {
    super.initState();
    _loadBillDetails();
  }

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
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

  Future<void> _applyPromoCode() async {
    if (_promoController.text.isEmpty) return;
    setState(() => _isApplyingPromo = true);
    try {
      final updatedBill = await _thanhToanService.applyPromoCode(widget.phienId, _promoController.text);
      if (mounted) {
        setState(() {
          _billDetails = updatedBill;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Áp dụng mã thành công!'), backgroundColor: Colors.green),
          );
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isApplyingPromo = false);
      }
    }
  }

  void _navigateToRatingScreen() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => ManHinhDanhGia(phienId: widget.phienId, tenBan: widget.tenBan),
      ),
    );
  }

  Future<void> _processCashPayment() async {
    if (_billDetails == null) return;
    setState(() => _isProcessingPayment = true);

    try {
      final tongCong = (_billDetails!['tong_cong'] as num).toDouble();
      await _thanhToanService.createCashPayment(widget.phienId, tongCong);
      _navigateToRatingScreen();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi thanh toán: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isProcessingPayment = false);
      }
    }
  }

  Future<void> _processVNPayPayment() async {
    if (_billDetails == null) return;
    setState(() => _isProcessingPayment = true);

    try {
      final tongCong = (_billDetails!['tong_cong'] as num).toDouble();
      final vnpayUrl = await _thanhToanService.createVNPayUrl(widget.phienId, tongCong);
      
      if (!mounted) return;
      final Uri url = Uri.parse(vnpayUrl);
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw 'Không thể mở link thanh toán VNPay.';
      }
      
      // For demo purposes, we navigate to rating screen assuming payment is successful
      _navigateToRatingScreen();

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi VNPay: $e'), backgroundColor: Colors.red),
      );
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
        centerTitle: true,
      ),
      body: _buildBody(),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Align(
              alignment: Alignment.center,
              child: Text(
                'Lỗi: $_errorMessage',
                style: const TextStyle(color: Colors.red),
              ),
            ),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: () => _loadBillDetails(), child: const Text('Thử lại')),
          ],
        ),
      );
    }
    if (_billDetails == null || (_billDetails!['items'] as List).isEmpty) {
      return const Center(child: Text('Không có món nào để thanh toán.'));
    }

    final items = _billDetails!['items'] as List;

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final gia = (item['gia'] as num).toDouble();
        final soLuong = (item['so_luong'] as num).toInt();
        final thanhTien = gia * soLuong;
        return ListTile(
          leading: Text('${soLuong}x', style: Theme.of(context).textTheme.bodyLarge),
          title: Text(item['ten_mon'] ?? 'N/A'),
          subtitle: Text('Đơn giá: ${NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(gia)}'),
          trailing: Align(
            alignment: Alignment.centerRight,
            child: Text(
              NumberFormat.currency(locale: 'vi_VN', symbol: 'đ').format(thanhTien),
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar() {
    if (_billDetails == null) return const SizedBox.shrink();

    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final tamTinh = (_billDetails!['tam_tinh'] as num).toDouble();
    final giamGia = (_billDetails!['giam_gia'] as num).toDouble();
    final thueVAT = (_billDetails!['thue_vat'] as num).toDouble();
    final tongCong = (_billDetails!['tong_cong'] as num).toDouble();
    final hasItems = (_billDetails!['items'] as List).isNotEmpty;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _promoController,
                      decoration: const InputDecoration(
                        labelText: 'Mã khuyến mãi',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12),
                      ),
                      enabled: !_isApplyingPromo,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _isApplyingPromo
                      ? const CircularProgressIndicator()
                      : ElevatedButton(onPressed: _applyPromoCode, child: const Text('Áp dụng')),
                ],
              ),
            ),
            const Divider(),
            const SizedBox(height: 8),
            _buildInfoRow('Tạm tính:', formatCurrency.format(tamTinh)),
            _buildInfoRow('Giảm giá:', '- ${formatCurrency.format(giamGia)}', color: Colors.green),
            _buildInfoRow('Thuế VAT:', formatCurrency.format(thueVAT)),
            const Divider(),
            _buildInfoRow('Tổng cộng:', formatCurrency.format(tongCong), isTotal: true),
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
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? color, bool isTotal = false}) {
    final style = isTotal
        ? Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.red, fontWeight: FontWeight.bold)
        : Theme.of(context).textTheme.titleMedium?.copyWith(color: color);
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
