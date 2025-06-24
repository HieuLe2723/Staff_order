import 'package:flutter/material.dart';
import 'package:staff_order_restaurant/data/services/chi_tiet_don_hang_service.dart';
import 'package:staff_order_restaurant/data/services/phien_service.dart';
import 'package:staff_order_restaurant/domain/entities/chi_tiet_don_hang.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_thanh_toan.dart';


class ManHinhKiemDo extends StatefulWidget {
  final int phienId;
  final String tenBan;
  const ManHinhKiemDo({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhKiemDo> createState() => _ManHinhKiemDoState();
}

class _ManHinhKiemDoState extends State<ManHinhKiemDo> {
  final ChiTietDonHangService _chiTietDonHangService = ChiTietDonHangService();
  final PhienService _phienService = PhienService();
  List<ChiTietDonHang> _danhSachMonDaGoi = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _showCancelled = false;

  @override
  void initState() {
    super.initState();
    _loadDanhSachMon();
  }

  Future<void> _loadDanhSachMon() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await _chiTietDonHangService.layDanhSachMonTheoPhien(widget.phienId);
      if (mounted) {
        setState(() {
          _danhSachMonDaGoi = data.map((item) => ChiTietDonHang.fromJson(item)).toList();
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

  Future<void> _cancelItem(int chiTietId) async {
    try {
      await _chiTietDonHangService.updateTrangThaiChiTiet(chiTietId, 'DaHuy');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã hủy món thành công.'), backgroundColor: Colors.green),
      );
      _loadDanhSachMon(); // Refresh the list
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi hủy món: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _showApplyVoucherDialog() async {
    final voucherController = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Áp dụng Voucher'),
        content: TextField(
          controller: voucherController,
          decoration: const InputDecoration(labelText: 'Nhập mã voucher'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () async {
              if (voucherController.text.isEmpty) return;
              try {
                final response = await _phienService.applyPromotion(widget.phienId, voucherController.text);
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text(response['message'] ?? 'Voucher đã được áp dụng!'),
                      backgroundColor: Colors.green),
                );
                Navigator.of(context).pop();
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text('Lỗi: ${e.toString().replaceAll('Exception: ', '')}'),
                      backgroundColor: Colors.red),
                );
              }
            },
            child: const Text('Áp dụng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    List<ChiTietDonHang> filteredList = _showCancelled
        ? _danhSachMonDaGoi
        : _danhSachMonDaGoi.where((item) => item.trangThai != 'DaHuy').toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Kiểm đồ - Bàn ${widget.tenBan}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          TextButton(
            onPressed: () => setState(() => _showCancelled = !_showCancelled),
            child: Text(
              _showCancelled ? 'Ẩn món đã hủy' : 'Hiện món đã hủy',
              style: TextStyle(color: Theme.of(context).primaryColor),
            ),
          ),
        ],
      ),
      body: _buildBody(filteredList),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildBody(List<ChiTietDonHang> filteredList) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(child: Text('Lỗi: $_errorMessage'));
    }

    // Group items by monAnId
    final Map<int, List<ChiTietDonHang>> groupedMap = {};
    for (final item in filteredList) {
      if (item.monAn?.monAnId != null) {
        groupedMap.putIfAbsent(item.monAn!.monAnId!, () => []).add(item);
      }
    }

    final groupedItems = groupedMap.values.toList();

    if (groupedItems.isEmpty) {
      return const Center(child: Text('Không có món nào được gọi.'));
    }

    return RefreshIndicator(
      onRefresh: _loadDanhSachMon,
      child: ListView.separated(
        padding: const EdgeInsets.all(8.0),
        itemCount: groupedItems.length,
        separatorBuilder: (context, index) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final itemGroup = groupedItems[index];
          final firstItem = itemGroup.first;
          final totalQuantity = itemGroup.fold<int>(0, (sum, item) => sum + (item.soLuong ?? 0));
          final dishName = firstItem.monAn?.tenMon ?? 'Chưa có tên';
          final combinedNotes = itemGroup
              .map((item) => item.ghiChu)
              .where((note) => note != null && note.isNotEmpty)
              .toSet() // Avoid duplicate notes
              .join('; ');

          final isAllCancelled = itemGroup.every((item) => item.trangThai == 'DaHuy');

          return ListTile(
            leading: Text(
              '${totalQuantity}x',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            title: Text(
              dishName,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                decoration: isAllCancelled ? TextDecoration.lineThrough : null,
                color: isAllCancelled ? Colors.grey : null,
              ),
            ),
            subtitle: combinedNotes.isNotEmpty
                ? Text('Ghi chú: $combinedNotes', style: const TextStyle(fontStyle: FontStyle.italic))
                : null,
            trailing: isAllCancelled
                ? const Text('Đã hủy', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))
                : IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: () {
                      // Find the first non-cancelled item in the group to cancel
                      final itemToCancel = itemGroup.firstWhere(
                        (item) => item.trangThai != 'DaHuy',
                      );
                      _cancelItem(itemToCancel.chiTietId);
                    },
                    tooltip: 'Hủy món',
                  ),
          );
        },
      ),
    );
  }

  Widget _buildBottomBar() {
    return BottomAppBar(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildNavButton(context, 'Kiểm đồ', Icons.check_circle_outline, true, () {}),
            _buildNavButton(context, 'Xác thực thanh toán', Icons.receipt_long, false, () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ManHinhThanhToan(
                    phienId: widget.phienId,
                    tenBan: widget.tenBan,
                  ),
                ),
              );
            }),
            _buildNavButton(context, 'Voucher', Icons.local_offer, false, _showApplyVoucherDialog),
          ],
        ),
      ),
    );
  }

  Widget _buildNavButton(BuildContext context, String label, IconData icon, bool isActive, VoidCallback onPressed) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: ElevatedButton.icon(
          onPressed: onPressed,
          icon: Icon(icon, size: 20),
          label: Text(label, style: const TextStyle(fontSize: 12)),
          style: ElevatedButton.styleFrom(
            backgroundColor: isActive ? Colors.blue : Colors.grey[200],
            foregroundColor: isActive ? Colors.white : Colors.black,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ),
    );
  }
}
