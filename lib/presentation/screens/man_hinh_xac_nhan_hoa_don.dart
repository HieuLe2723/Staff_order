import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:staff_order_restaurant/data/services/thanh_toan_service.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_danh_gia.dart';

class ManHinhXacNhanHoaDon extends StatefulWidget {
  final int phienId;
  final String tenBan;

  const ManHinhXacNhanHoaDon({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhXacNhanHoaDon> createState() => _ManHinhXacNhanHoaDonState();
}

class _ManHinhXacNhanHoaDonState extends State<ManHinhXacNhanHoaDon> {
  final ThanhToanService _thanhToanService = ThanhToanService();
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic>? _billDetails;

  @override
  void initState() {
    super.initState();
    _loadBillDetails();
  }

  Future<void> _loadBillDetails() async {
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

  void _navigateToRatingScreen() {
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ManHinhDanhGia(phienId: widget.phienId, tenBan: widget.tenBan),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Xác nhận Hóa đơn cho ${widget.tenBan}'),
        backgroundColor: Colors.teal,
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
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Lỗi: $_errorMessage', textAlign: TextAlign.center, style: const TextStyle(color: Colors.red, fontSize: 16)),
              const SizedBox(height: 20),
              ElevatedButton(onPressed: _loadBillDetails, child: const Text('Thử lại')),
            ],
          ),
        ),
      );
    }

    if (_billDetails == null || (_billDetails!['bill']['items'] as List).isEmpty) {
      return const Center(child: Text('Không có món ăn nào trong hóa đơn.', style: TextStyle(fontSize: 18)));
    }

    final items = _billDetails!['bill']['items'] as List;
    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');

    return ListView.builder(
      padding: const EdgeInsets.all(8.0),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 4.0),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.teal.shade100,
              child: Text('${item['so_luong']}', style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
            title: Text(item['ten_mon'], style: const TextStyle(fontWeight: FontWeight.bold)),
            trailing: Text(formatCurrency.format(item['thanh_tien'])),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar() {
    if (_isLoading || _errorMessage != null || _billDetails == null) {
      return const SizedBox.shrink();
    }

    final bill = _billDetails!['bill'];
    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
    final totalAmount = (bill['total_amount'] as num).toDouble();

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 2,
            blurRadius: 5,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Tổng cộng:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              Text(
                formatCurrency.format(totalAmount),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.red),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _navigateToRatingScreen,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                backgroundColor: Colors.teal,
                textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              child: const Text('Xác nhận & Đi đến Đánh giá'),
            ),
          ),
        ],
      ),
    );
  }
}
