import 'package:flutter/material.dart';
import 'package:staff_order_restaurant/data/services/loai_menu_service.dart';
import 'package:staff_order_restaurant/data/services/loai_mon_an_service.dart';
import 'package:staff_order_restaurant/data/services/mon_an_service.dart';
import 'package:staff_order_restaurant/domain/entities/loai_mon_an.dart';
import 'package:staff_order_restaurant/domain/entities/mon_an.dart';
import 'package:staff_order_restaurant/data/services/don_hang_service.dart';
import 'package:staff_order_restaurant/data/services/chi_tiet_don_hang_service.dart';
import 'package:staff_order_restaurant/data/services/phien_service.dart';
import 'man_hinh_kiem_do.dart';
import 'man_hinh_ra_mon.dart';
import 'man_hinh_xac_nhan_hoa_don.dart';

// A simple class to hold order item details
class OrderItem {
  final MonAn monAn;
  final int quantity;
  final String? note;

  OrderItem({required this.monAn, this.quantity = 1, this.note});

  double get totalPrice => (monAn.gia ?? 0) * quantity;

  OrderItem copyWith({int? quantity, String? note}) {
    return OrderItem(
      monAn: monAn,
      quantity: quantity ?? this.quantity,
      note: note ?? this.note,
    );
  }
}

class ManHinhOrderMonAn extends StatefulWidget {
  final String banId;
  final String phienId;
  final String tenBan;

  const ManHinhOrderMonAn({
    super.key,
    required this.banId,
    required this.phienId,
    required this.tenBan,
  });

  @override
  State<ManHinhOrderMonAn> createState() => _ManHinhOrderMonAnState();
}

class _ManHinhOrderMonAnState extends State<ManHinhOrderMonAn> {
  // Services
  final LoaiMenuService _loaiMenuService = LoaiMenuService();
  final LoaiMonAnService _loaiMonAnService = LoaiMonAnService();
  final MonAnService _monAnService = MonAnService();
  final DonHangService _donHangService = DonHangService();
  final ChiTietDonHangService _chiTietDonHangService = ChiTietDonHangService();
  final PhienService _phienService = PhienService();

  // State variables

  int? _donHangId;
  List<dynamic> _loaiMenuList = [];
  List<LoaiMonAn> _loaiMonAnList = [];
  List<MonAn> _monAnList = [];

  dynamic _selectedLoaiMenu;
  LoaiMonAn? _selectedLoaiMonAn;

  List<OrderItem> _orderedItems = []; // Món mới thêm trong lần order này
  List<OrderItem> _existingItems = []; // Món đã có từ trước

  double _totalPrice = 0.0;

  bool _isLoadingLoaiMenu = true;
  bool _isLoadingLoaiMonAn = false;
  bool _isLoadingMonAn = false;
  bool _isSendingOrder = false;

  @override
  void initState() {
    super.initState();
    // Start with a completely clean state.
    _resetStateAndLoadData();
  }

  @override
  void didUpdateWidget(covariant ManHinhOrderMonAn oldWidget) {
    super.didUpdateWidget(oldWidget);
    // When the widget is updated with a new session, we must also force a reset.
    if (widget.phienId != oldWidget.phienId) {
      _resetStateAndLoadData();
    }
  }

  void _resetStateAndLoadData() {
    // This is the definitive fix. State is cleared synchronously within setState.
    // Data loading is separated into a new function to prevent any race conditions.
    if (!mounted) return;

    setState(() {
      _donHangId = null;
      _orderedItems.clear(); // Use .clear() for safety
      _existingItems.clear(); // Use .clear() for safety
      _totalPrice = 0.0;
      _isLoadingLoaiMenu = true;
      _isLoadingLoaiMonAn = false;
      _isLoadingMonAn = false;
      _selectedLoaiMenu = null;
      _selectedLoaiMonAn = null;
      _loaiMonAnList = [];
      _monAnList = [];
    });

    // Fetch data only after the current state has been fully cleared.
    _fetchDataForSession();
  }

  Future<void> _fetchDataForSession() async {
    // This function is now separate to ensure it runs after state is cleared.
    await _fetchLoaiMenu();
    await _loadInitialOrder();
  }

  Future<void> _fetchLoaiMenu() async {
    try {
      final loaiMenuList = await _loaiMenuService.getLoaiMenu();
      if (mounted) {
        setState(() {
          _loaiMenuList = loaiMenuList;
          _isLoadingLoaiMenu = false;
          if (_loaiMenuList.isNotEmpty) {
            _selectLoaiMenu(_loaiMenuList.first);
          }
        });
      }
    } catch (e) {
      // Handle error
      print(e);
      if (mounted) {
        setState(() {
          _isLoadingLoaiMenu = false;
        });
      }
    }
  }

  Future<void> _loadInitialOrder() async {
    try {
      // Sử dụng API mới để lấy tất cả đơn hàng của phiên hiện tại
      final donHangList = await _donHangService.layDonHangTheoPhien(int.parse(widget.phienId));

      // Nếu có đơn hàng, lấy đơn hàng mới nhất (thường là đơn hàng cuối cùng)
      if (donHangList.isNotEmpty) {
        final latestOrder = donHangList.last;
        if (latestOrder != null && latestOrder['donhang_id'] != null) {
          // Lấy ID của đơn hàng mới nhất
          final donHangId = latestOrder['donhang_id'] is int
              ? latestOrder['donhang_id'] as int
              : int.parse(latestOrder['donhang_id'].toString());

          // Lấy danh sách món ăn của đơn hàng đó
          final items = await _chiTietDonHangService.layDanhSachMonDaGoi(donHangId);

          if (mounted) {
            setState(() {
              // Lưu ID đơn hàng hiện tại để thêm món vào đơn hàng này
              _donHangId = donHangId;

              // Chuyển đổi dữ liệu món ăn từ API thành danh sách OrderItem
              _existingItems = items.map((itemData) {
                final monAnData = itemData['mon_an'] as Map<String, dynamic>?;
                if (monAnData == null) {
                  return OrderItem(
                    monAn: MonAn(tenMon: 'Món đã bị xóa'),
                    quantity: itemData['so_luong'] ?? 0,
                    note: itemData['ghi_chu'],
                  );
                }
                return OrderItem(
                  monAn: MonAn.fromJson(monAnData),
                  quantity: itemData['so_luong'] ?? 0,
                  note: itemData['ghi_chu'],
                );
              }).toList();
              _totalPrice = _calculateTotalPrice();
            });
          }
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi tải đơn hàng từ phiên: $e')),
      );
    }
  }

  void _selectLoaiMenu(dynamic loaiMenu) {
    if (loaiMenu == null) return;
    // Nếu API trả về String đơn thuần
    final String loaiMenuKey = loaiMenu is String
        ? loaiMenu
        : (loaiMenu['loai_menu'] ?? loaiMenu['ten'] ?? loaiMenu.toString());
    setState(() {
      _selectedLoaiMenu = loaiMenu;
      _selectedLoaiMonAn = null;
      _monAnList = [];
      _isLoadingLoaiMonAn = true;
    });
    _fetchLoaiMonAn(loaiMenuKey);
  }

  Future<void> _fetchLoaiMonAn(String loaiMenu) async {
    setState(() {
      _isLoadingLoaiMonAn = true;
    });
    try {
      final loaiMonAnList = await _loaiMonAnService.getLoaiMonAn(loaiMenu: loaiMenu);
      if (mounted) {
        setState(() {
          _loaiMonAnList = loaiMonAnList;
          _isLoadingLoaiMonAn = false;
          if (_loaiMonAnList.isNotEmpty) {
            _selectedLoaiMonAn = _loaiMonAnList.first;
            if (_selectedLoaiMonAn!.loaiId != null) {
              _fetchMonAn(_selectedLoaiMonAn!.loaiId!);
            }
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingLoaiMonAn = false;
        });
      }
    }
  }

  void _selectLoaiMonAn(LoaiMonAn loaiMonAn) {
    setState(() {
      _selectedLoaiMonAn = loaiMonAn;
      _monAnList = [];
      _isLoadingMonAn = true;
    });
    _fetchMonAn(loaiMonAn.loaiId!);
  }

  Future<void> _fetchMonAn(int loaiId) async {
    try {
      final monAnList = await _monAnService.getMonAnTheoLoai(loaiId);
      if (mounted) {
        setState(() {
          _monAnList = monAnList;
          _isLoadingMonAn = false;
        });
      }
    } catch (e) {
      print(e);
      if (mounted) {
        setState(() {
          _isLoadingMonAn = false;
        });
      }
    }
  }

  void _addItemToOrder(MonAn monAn) {
    setState(() {
      // Check if item already exists in the new order list
      int existingIndex =
          _orderedItems.indexWhere((item) => item.monAn.monAnId == monAn.monAnId);

      if (existingIndex != -1) {
        // If it exists, update quantity
        _orderedItems[existingIndex] = _orderedItems[existingIndex].copyWith(
          quantity: _orderedItems[existingIndex].quantity + 1,
        );
      } else {
        // If not, add new item
        _orderedItems.add(OrderItem(monAn: monAn));
      }
      _totalPrice = _calculateTotalPrice();
    });
  }

  void _clearOrder() {
    setState(() {
      _orderedItems.clear();
      _totalPrice = _calculateTotalPrice();
    });
  }

  double _calculateTotalPrice() {
    double total = 0.0;
    final allItems = _existingItems + _orderedItems;
    for (var item in allItems) {
      total += item.totalPrice;
    }
    return total;
  }

  Future<void> _editNoteDialog(int newItemIndex) async {
    if (newItemIndex < 0 || newItemIndex >= _orderedItems.length) return;
    final item = _orderedItems[newItemIndex];
    final controller = TextEditingController(text: item.note ?? '');
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Ghi chú cho ${item.monAn.tenMon ?? ''}'),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Nhập ghi chú...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
          TextButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Lưu')),
        ],
      ),
    );

    if (result != null) {
      setState(() {
        _orderedItems[newItemIndex] = item.copyWith(note: result);
      });
    }
  }

  Future<void> _sendOrder() async {
    // 1. Kiểm tra xem có món nào được chọn không
    if (_orderedItems.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ít nhất một món.')),
      );
      return;
    }

    // 2. Hiển thị hộp thoại xác nhận (giữ nguyên)
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Xác nhận gửi order'),
          content: const Text('Bạn có chắc chắn muốn gửi những món đã chọn?'),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Gửi'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    if (!mounted) return;
    setState(() {
      _isSendingOrder = true;
    });

    try {
      // 3. Chuẩn bị dữ liệu
      final itemsPayload = _orderedItems.map((item) => {
        'monan_id': item.monAn.monAnId,
        'so_luong': item.quantity,
        if (item.note != null && item.note!.isNotEmpty) 'ghi_chu': item.note,
      }).toList();

      // Xác định `loaiId` một cách an toàn, tránh lỗi khi `_selectedLoaiMenu` chỉ là String
      int loaiId;
      if (_selectedLoaiMenu == null) {
        throw Exception('Không xác định được Loại Menu. Vui lòng chọn lại.');
      }

      // Trường hợp API trả về Map chứa `loai_id` hoặc `id`
      if (_selectedLoaiMenu is Map && (_selectedLoaiMenu['loai_id'] != null || _selectedLoaiMenu['id'] != null)) {
        final dynamic rawId = _selectedLoaiMenu['loai_id'] ?? _selectedLoaiMenu['id'];
        loaiId = int.parse(rawId.toString());
      } else if (_selectedLoaiMenu is String) {
        // Nếu chỉ có String, ta cần ánh xạ sang ID. Ở đây giả sử server quy ước:
        //  - "Alacarte" -> 1, "Set" -> 2, v.v.
        // TODO: Cập nhật bảng ánh xạ cho phù hợp với backend.
        switch ((_selectedLoaiMenu as String).toLowerCase()) {
          case 'alacarte':
            loaiId = 1;
            break;
          case 'set':
            loaiId = 2;
            break;
          default:
            throw Exception('Loại Menu $_selectedLoaiMenu chưa được hỗ trợ.');
        }
      } else {
        throw Exception('Không xác định được Loại Menu. Vui lòng chọn lại.');
      }

      // 4. Gửi yêu cầu lên server: Luôn tạo một đơn hàng mới cho mỗi lượt gửi.
      final donHangData = await _donHangService.taoDonHang(
        phienId: int.parse(widget.phienId),
        loaiId: loaiId,
        items: itemsPayload,
      );

      if (donHangData == null || donHangData['donhang_id'] == null) {
        throw Exception('Không thể tạo đơn hàng mới từ server.');
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã gửi order thành công!')),
      );

      // 5. Cập nhật UI (giữ nguyên)
      final bool isFirstOrder = _existingItems.isEmpty;
      if (isFirstOrder) {
        // Quay về màn hình chính và báo hiệu cần refresh dữ liệu
        // Chú ý: Không dùng popUntil vì không truyền được kết quả
        Navigator.of(context).pop(true);
      } else {
        setState(() {
          _existingItems.addAll(_orderedItems);
          _orderedItems.clear();
          _totalPrice = _calculateTotalPrice();
        });
      }

    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi gửi order: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSendingOrder = false;
        });
      }
    }
  }

  // This function will handle the back press
  void _goToKiemDo() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ManHinhKiemDo(
          phienId: int.parse(widget.phienId),
          tenBan: widget.tenBan,
        ),
      ),
    );
  }

  void _goToRaMon() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ManHinhRaMon(
          phienId: int.parse(widget.phienId),
          tenBan: widget.tenBan,
        ),
      ),
    );
  }

  Future<bool> _onWillPop() async {
    // Trường hợp 1: Đang có món đang chọn (chưa gửi order) -> cho phép quay lại 
    // mà không hỏi gì cả (để tránh mất dữ liệu đang chọn)
    if (_orderedItems.isNotEmpty) {
      return true; 
    }

    // Trường hợp 2: Không có món đang chọn, nhưng:
    // - Nếu đã từng gửi đơn hàng (đã có _existingItems hoặc đã có _donHangId) 
    //   -> về màn hình khu vực mà không hỏi gì (theo quy trình đã mô tả).
    if (_existingItems.isNotEmpty || _donHangId != null) {
      return true;
    }

    // Trường hợp 3: Không có món đang chọn VÀ chưa từng gửi đơn hàng nào 
    // -> hiển thị xác nhận hủy phiên.
    final bool? confirmExit = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đóng Order Rỗng?'),
        content: const Text(
            'Chưa có món nào được gửi. Bạn có muốn đóng phiên sử dụng bàn này không?'),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );

    // Nếu xác nhận đóng phiên
    if (confirmExit == true) {
      try {
        await _phienService.cancelEmptyPhien(int.parse(widget.phienId));
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã hủy phiên rỗng và bàn đã chuyển về trạng thái "Sẵn Sàng".')),
          );
          // Trả về true để màn hình trước biết cần reload lại danh sách bàn
          Navigator.of(context).pop(true); 
        }
        return false; // Đã xử lý điều hướng, ngăn pop mặc định
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Lỗi khi hủy phiên: $e')),
          );
        }
        return false;
      }
    } else {
      // Người dùng nhấn "Không" (không muốn đóng phiên) -> ở lại màn hình order
      return false;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => _onWillPop().then((value) {
              if (value) {
                Navigator.of(context).pop();
              }
            }),
          ),
          title: Text('Order cho bàn ${widget.tenBan}'),
          actions: [
            IconButton(
              icon: const Icon(Icons.more_vert),
              onPressed: () {},
            ),
          ],
        ),
        body: Row(
          children: [
            // Left Column (Order Details)
            Expanded(
              flex: 2,
              child: Column(
                children: [
                  // Action Buttons
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        GestureDetector(
                          onTap: _goToKiemDo,
                          child: _buildActionButton(Icons.check_box_outline_blank, 'Kiểm đồ'),
                        ),
                        GestureDetector(
                          onTap: _goToRaMon,
                          child: _buildActionButton(Icons.restaurant_menu, 'Ra món'),
                        ),
                        ElevatedButton(
                          onPressed: _isSendingOrder ? null : _sendOrder,
                          child: _isSendingOrder
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Text('GỬI ORDER'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
                  // Ordered Items List
                  Expanded(
                    child: _buildOrderedItemsList(),
                  ),
                  const Divider(),
                  // Footer
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton(
                              onPressed: _clearOrder,
                              child: const Text('XÓA TẤT CẢ', style: TextStyle(color: Colors.red)),
                            ),
                            Text(
                              'Tổng tiền: ${_totalPrice.toStringAsFixed(0)}đ',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ],
                        ),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => ManHinhXacNhanHoaDon(
                                    phienId: int.parse(widget.phienId),
                                    tenBan: widget.tenBan,
                                  ),
                                ),
                              );
                            },
                            child: const Text('Thanh toán'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                            ),
                          ),
                        ),

                      ],
                    ),
                  ),
                ],
              ),
            ),
            const VerticalDivider(),
            // Right Column (Menu)
            Expanded(
              flex: 5,
              child: Column(
                children: [
                  // Menu Type Tabs
                  _isLoadingLoaiMenu
                      ? const Center(child: CircularProgressIndicator())
                      : _buildLoaiMenuTabs(),
                  // Dish Type Tabs
                  _isLoadingLoaiMonAn
                      ? const Center(child: CircularProgressIndicator())
                      : _buildLoaiMonAnTabs(),
                  // Dishes Grid
                  Expanded(
                    child: _isLoadingMonAn
                        ? const Center(child: CircularProgressIndicator())
                        : _buildMonAnGrid(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 24),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildLoaiMenuTabs() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _loaiMenuList.length,
        itemBuilder: (context, index) {
          final loaiMenu = _loaiMenuList[index];
          final isSelected = _selectedLoaiMenu == loaiMenu;
          return GestureDetector(
            onTap: () => _selectLoaiMenu(loaiMenu),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              margin: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isSelected ? Colors.orange : Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(child: Text(loaiMenu is String ? loaiMenu : (loaiMenu['loai_menu'] ?? 'N/A'))),
            ),
          );
        },
      ),
    );
  }

  Widget _buildLoaiMonAnTabs() {
    return SizedBox(
      height: 50,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _loaiMonAnList.length,
        itemBuilder: (context, index) {
          final loaiMonAn = _loaiMonAnList[index];
          final isSelected = _selectedLoaiMonAn?.loaiId == loaiMonAn.loaiId;
          return GestureDetector(
            onTap: () => _selectLoaiMonAn(loaiMonAn),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              margin: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isSelected ? Colors.deepOrangeAccent : Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(child: Text((loaiMonAn.tenLoai != null && loaiMonAn.tenLoai!.isNotEmpty) ? loaiMonAn.tenLoai! : 'Không tên')),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMonAnGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(8.0),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 150,
        childAspectRatio: 3 / 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: _monAnList.length,
      itemBuilder: (context, index) {
        final monAn = _monAnList[index];
        return InkWell(
          onTap: () => _addItemToOrder(monAn),
          child: Card(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(monAn.tenMon ?? 'N/A', textAlign: TextAlign.center),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildOrderedItemsList() {
    final allItems = _existingItems + _orderedItems;
    if (allItems.isEmpty) {
      return const Center(child: Text('Chưa có món nào được chọn'));
    }

    return ListView.builder(
      itemCount: allItems.length,
      itemBuilder: (context, index) {
        final item = allItems[index];
        final isNew = index >= _existingItems.length;

        return ListTile(
          onTap: isNew ? () => _editNoteDialog(index - _existingItems.length) : null,
          title: Text(item.monAn.tenMon ?? 'N/A'),
          subtitle: Text('${item.quantity} x ${item.monAn.gia?.toStringAsFixed(0)}đ' + (item.note != null && item.note!.isNotEmpty ? '\nGhi chú: ${item.note}' : '')),
          trailing: Text('${item.totalPrice.toStringAsFixed(0)}đ'),
          tileColor: isNew ? Colors.orange.withOpacity(0.1) : null,
        );
      },
    );
  }
}
