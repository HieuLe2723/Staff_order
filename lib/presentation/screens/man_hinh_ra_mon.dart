import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:staff_order_restaurant/data/services/chi_tiet_don_hang_service.dart';
import 'package:staff_order_restaurant/domain/entities/chi_tiet_don_hang.dart';
import 'package:collection/collection.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ManHinhRaMon extends StatefulWidget {
  final int phienId;
  final String tenBan;

  const ManHinhRaMon({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhRaMon> createState() => _ManHinhRaMonState();
}

class _ManHinhRaMonState extends State<ManHinhRaMon> {
  final ChiTietDonHangService _chiTietDonHangService = ChiTietDonHangService();
  List<ChiTietDonHang> _danhSachMon = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _nhanVienName = '';

  final Map<int, TextEditingController> _slRaControllers = {};
  bool _showServedItems = false;
  bool _isUpdating = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadData();
    _timer = Timer.periodic(const Duration(minutes: 1), (timer) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _slRaControllers.values.forEach((controller) => controller.dispose());
    super.dispose();
  }

  Future<void> _loadData() async {
    await _loadUserInfo();
    await _loadMonDaGoi();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _nhanVienName = prefs.getString('ho_ten') ?? 'N/A';
      });
    }
  }

  Future<void> _loadMonDaGoi() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final data = await _chiTietDonHangService.layDanhSachMonTheoPhien(widget.phienId);
      if (mounted) {
        // Clear and dispose old controllers
        _slRaControllers.values.forEach((controller) => controller.dispose());
        _slRaControllers.clear();

        final newDanhSachMon = data.map((item) => ChiTietDonHang.fromJson(item)).toList();

        // Create new controllers
        for (var item in newDanhSachMon) {
          _slRaControllers[item.chiTietId] = TextEditingController();
        }

        setState(() {
          _danhSachMon = newDanhSachMon;
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

  Future<void> _handleUpdateStatus() async {
    final itemsToUpdate = <Map<String, dynamic>>[];
    _slRaControllers.forEach((chiTietId, controller) {
      final soLuongRa = int.tryParse(controller.text) ?? 0;
      if (soLuongRa > 0) {
        itemsToUpdate.add({'chi_tiet_id': chiTietId, 'so_luong_ra': soLuongRa});
      }
    });

    if (itemsToUpdate.isEmpty || !mounted) return;

    setState(() => _isUpdating = true);

    try {
      // NOTE: This assumes a new service method `updateSoLuongDaRa` exists.
      await _chiTietDonHangService.updateSoLuongDaRa(itemsToUpdate);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã cập nhật ${itemsToUpdate.length} món thành công!'),
          backgroundColor: Colors.green,
        ),
      );
      await _loadMonDaGoi(); // Refresh list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi cập nhật: ${e.toString().replaceAll('Exception: ', '')}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isUpdating = false);
      }
    }
  }

  void _toggleSelectAllInOrder(List<ChiTietDonHang> itemsInOrder, bool selectAll) {
    setState(() {
      for (var item in itemsInOrder) {
        final soLuongConLai = item.soLuong - item.soLuongDaRa;
        if (soLuongConLai > 0) {
          final controller = _slRaControllers[item.chiTietId];
          if (controller != null) {
            controller.text = selectAll ? soLuongConLai.toString() : '';
          }
        }
      }
    });
  }

  String _calculateWaitingTime(DateTime? orderTime) {
    if (orderTime == null) return 'N/A';
    final difference = DateTime.now().difference(orderTime);
    return '${difference.inMinutes} phút';
  }

  @override
  Widget build(BuildContext context) {
    List<ChiTietDonHang> displayedItems = _showServedItems
        ? _danhSachMon
        : _danhSachMon.where((item) => item.trangThai != 'DaHuy' && (item.soLuong > item.soLuongDaRa)).toList();

    final groupedByDonHang = groupBy(displayedItems, (ChiTietDonHang item) => item.donHangId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ra món'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          TextButton(
            onPressed: () => setState(() => _showServedItems = !_showServedItems),
            child: Text(
              _showServedItems ? 'Ẩn món đã ra' : 'Hiện món đã ra',
              style: TextStyle(color: Theme.of(context).primaryColor),
            ),
          ),
        ],
      ),
      body: _buildBody(groupedByDonHang),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildBody(Map<int, List<ChiTietDonHang>> groupedByDonHang) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_errorMessage != null) return Center(child: Text('Lỗi: $_errorMessage'));
    if (groupedByDonHang.isEmpty) return const Center(child: Text('Tất cả món đã được ra.'));

    var sortedKeys = groupedByDonHang.keys.toList()..sort();

    return RefreshIndicator(
      onRefresh: _loadMonDaGoi,
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: sortedKeys.length,
        itemBuilder: (context, index) {
          final donHangId = sortedKeys[index];
          final itemsInOrder = groupedByDonHang[donHangId]!;
          final firstItem = itemsInOrder.first;

          return Card(
            margin: const EdgeInsets.symmetric(vertical: 8.0),
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOrderHeader(index, firstItem, itemsInOrder),
                  const Divider(),
                  _buildItemHeader(),
                  ...itemsInOrder.map((item) => _buildItemRow(item)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderHeader(int index, ChiTietDonHang firstItem, List<ChiTietDonHang> itemsInOrder) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              'Lượt order ${index + 1} (${firstItem.nhanVienTen ?? 'Chưa có tên'} - ${firstItem.nhanvienId ?? 'N/A'}) - Đã chờ ${_calculateWaitingTime(firstItem.thoiGianTaoDonHang)}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          Row(
            children: [
              const Text('Chọn tất cả'),
              Checkbox(
                value: false, // Visual only, logic is in onChanged
                onChanged: (bool? value) {
                  if (value != null) _toggleSelectAllInOrder(itemsInOrder, value);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItemHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          const Expanded(flex: 5, child: Text('Món ăn', style: TextStyle(fontWeight: FontWeight.bold))),
          const Expanded(flex: 2, child: Center(child: Text('SL nấu', style: TextStyle(fontWeight: FontWeight.bold)))),
          const Expanded(flex: 2, child: Center(child: Text('Còn lại', style: TextStyle(fontWeight: FontWeight.bold)))),
          const Expanded(flex: 2, child: Center(child: Text('SL ra', style: TextStyle(fontWeight: FontWeight.bold)))),
        ],
      ),
    );
  }

  Widget _buildItemRow(ChiTietDonHang item) {
    final String dishName = item.monAn?.tenMon ?? 'Chưa có tên';
    final soLuongConLai = item.soLuong - item.soLuongDaRa;
    final bool isFullyServed = soLuongConLai <= 0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 5,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dishName, style: const TextStyle(fontWeight: FontWeight.w600)),
                if (item.ghiChu != null && item.ghiChu!.isNotEmpty)
                  Text('Ghi chú: ${item.ghiChu}', style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.black54)),
              ],
            ),
          ),
          Expanded(flex: 2, child: Center(child: Text('${item.soLuong}'))),
          Expanded(flex: 2, child: Center(child: Text('$soLuongConLai', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)))),
          Expanded(
            flex: 2,
            child: SizedBox(
              height: 40,
              child: TextField(
                controller: _slRaControllers[item.chiTietId],
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  contentPadding: EdgeInsets.zero,
                  enabled: !isFullyServed,
                ),
                onChanged: (value) {
                  final enteredValue = int.tryParse(value) ?? 0;
                  if (enteredValue > soLuongConLai) {
                    _slRaControllers[item.chiTietId]?.text = soLuongConLai.toString();
                    _slRaControllers[item.chiTietId]?.selection = TextSelection.fromPosition(TextPosition(offset: soLuongConLai.toString().length));
                  }
                  setState(() {}); // Re-build to update button state
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    bool canUpdate = _slRaControllers.values.any((controller) => (int.tryParse(controller.text) ?? 0) > 0);

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), spreadRadius: 1, blurRadius: 5, offset: const Offset(0, -2))],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đóng'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: !canUpdate || _isUpdating ? null : _handleUpdateStatus,
              child: _isUpdating
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Cập nhật'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}