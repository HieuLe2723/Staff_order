import 'package:flutter/material.dart';
import '../../data/services/dat_ban_service.dart';
import '../../data/services/thong_tin_khach_hang_service.dart';
import '../../domain/entities/dat_ban.dart';
import '../../domain/entities/dat_ban_group.dart';
import '../../domain/entities/khu_vuc.dart';
import '../../domain/entities/ban_nha_hang.dart';
import '../../data/services/ban_nha_hang_service.dart';


class DatBanScreen extends StatefulWidget {
  final List<KhuVuc> khuVucs;
  const DatBanScreen({super.key, required this.khuVucs});

  @override
  _DatBanScreenState createState() => _DatBanScreenState();
}

class _DatBanScreenState extends State<DatBanScreen> {
  // Hàm đồng bộ trạng thái bàn dựa vào danh sách đặt bàn
  void _syncTableStatusWithReservations() {
    // Lấy tất cả các banId của các đơn đặt có trạng thái ChoXuLy hoặc DaDat
    final reservedBanIds = <int>{};
    for (final db in _datBanList) {
      if (db.trangThai == 'ChoXuLy' || db.trangThai == 'DaDat') {
        // Đảm bảo banIds luôn là list, không bao giờ null
        if ((db.banIds ?? []).isNotEmpty) {
          reservedBanIds.addAll(db.banIds ?? []);
        } else if (db.banId != null) {
          reservedBanIds.add(db.banId!);
        }
      }
    }
    print('[DEBUG] _syncTableStatusWithReservations: reservedBanIds = $reservedBanIds');
    setState(() {
      _banList = _banList.map((ban) {
        if (reservedBanIds.contains(ban.banId)) {
          print('  [SYNC] Ban ${ban.banId} chuyển sang DaDat');
          return ban.copyWith(trangThai: 'DaDat');
        } else {
          print('  [SYNC] Ban ${ban.banId} chuyển sang SanSang');
          return ban.copyWith(trangThai: 'SanSang');
        }
      }).toList();
    });
  }
  String _filterStatus = "approved"; // "approved" hoặc "cancelled"
  String _searchText = "";
  final TextEditingController _searchController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _hoTenController = TextEditingController();
  final _soDienThoaiController = TextEditingController();
  final _emailController = TextEditingController();
  final _soKhachController = TextEditingController();
  final _ghiChuController = TextEditingController();
  DateTime? _thoiGianDat;
  final DatBanService _datBanService = DatBanService();
  final ThongTinKhachHangService _khachHangService = ThongTinKhachHangService();
  final BanNhaHangService _banNhaHangService = BanNhaHangService();
  List<DatBan> _datBanList = [];
  List<DatBanGroup> _datBanGroupList = []; // Danh sách group để hiển thị
  KhuVuc? _selectedKhuVuc;
  List<BanNhaHang> _banList = [];
  List<int> _selectedBanIds = [];
  int? _selectedTableId; // Theo dõi bàn được chọn trong danh sách đặt bàn

  // Widget con hiển thị trạng thái bàn
  Widget tableStatusWidget(BanNhaHang ban) {
    print('[TableStatusWidget] banId: ${ban.banId}, trangThai: ${ban.trangThai}');
    if (ban.trangThai == 'DaDat') {
      return Row(
        children: const [
          Icon(Icons.event_busy, size: 16, color: Colors.red),
          SizedBox(width: 4),
          Text('Đã đặt', style: TextStyle(fontSize: 12, color: Colors.red)),
        ],
      );
    } else if (ban.trangThai == 'DangSuDung') {
      return Row(
        children: const [
          Icon(Icons.lock, size: 14, color: Colors.orange),
          SizedBox(width: 4),
          Text('Đang dùng', style: TextStyle(fontSize: 12, color: Colors.orange)),
        ],
      );
    } else {
      return const Text('Trống', style: TextStyle(fontSize: 12, color: Colors.black54));
    }
  }

  @override
  void initState() {
    super.initState();
    _thoiGianDat = DateTime.now();
    _selectedKhuVuc = widget.khuVucs.isNotEmpty ? widget.khuVucs.first : null;
    if (_selectedKhuVuc != null) {
      _reloadBanAndDatBan();
    }
  }

  Future<void> _loadBanList(int khuvucId) async {
    final bans = await _banNhaHangService.getBanListByKhuVuc(khuvucId);
    print('[DEBUG] _loadBanList: API trả về ${bans.length} bàn: ${bans.map((b) => {"banId": b.banId, "tenBan": b.tenBan, "trangThai": b.trangThai}).toList()}');
    setState(() {
      _banList = bans;
      _selectedBanIds.clear();
    });
  }

  Future<void> _selectDateTime(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _thoiGianDat ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2026),
    );
    if (pickedDate != null) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_thoiGianDat ?? DateTime.now()),
      );
      if (pickedTime != null) {
        setState(() {
          _thoiGianDat = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _reloadBanAndDatBan() async {
    if (_selectedKhuVuc == null) return;
    await _loadBanList(_selectedKhuVuc!.khuvucId); // Load danh sách bàn trước
    await _loadDatBanList(); // Rồi mới load danh sách đặt bàn
    _syncTableStatusWithReservations(); // Đồng bộ trạng thái bàn
  }

  Future<void> _loadDatBanList() async {
    if (_selectedKhuVuc == null) return;
    try {
      // Truyền filter trạng thái khi lấy danh sách đặt bàn
      String? trangThai;
      if (_filterStatus == 'cancelled') {
        trangThai = 'DaHuy';
      } else if (_filterStatus == 'approved') {
        trangThai = null; // hoặc truyền trạng thái phù hợp nếu có (ví dụ: 'DaDat', 'ChoXuLy')
      }
      final datBans = await _datBanService.getAllDatBan(
        khuVucId: _selectedKhuVuc!.khuvucId,
        trangThai: trangThai,
      );
      print('[DEBUG] _loadDatBanList: API trả về ${datBans.length} đặt bàn: ');
      for (final db in datBans) {
        print('  datbanId: ${db.datbanId}, hoTen: ${db.hoTen ?? ''}, soDienThoai: ${db.soDienThoai}, banIds: ${db.banIds}, banTenList: ${db.banTenList}, trangThai: ${db.trangThai}');
      }
      setState(() {
        _datBanList = datBans;
        _datBanGroupList = datBans.map((db) => DatBanGroup.fromDatBanList(
          [db],
          db.hoTen ?? '',
          db.banTenList,
          soDienThoai: db.soDienThoai ?? '',
        )).toList();
        print('[DEBUG] _datBanGroupList cập nhật:');
        for (final group in _datBanGroupList) {
          print('  groupId: ${group.datbanId}, tenKhachHang: ${group.tenKhachHang}, soDienThoai: ${group.soDienThoai}, tenBans: ${group.tenBans}, trangThai: ${group.trangThai}');
        }
      });
      _syncTableStatusWithReservations(); // Đồng bộ trạng thái bàn ngay sau khi load đặt bàn
    } catch (e) {
      setState(() {
        _datBanList = [];
        _datBanGroupList = [];
      });
    }
  }

  Future<void> _submitReservation() async {
    // Luôn luôn lấy lại danh sách bàn mới nhất từ API cho khu vực đang chọn
    if (_selectedKhuVuc != null) {
      await _loadBanList(_selectedKhuVuc!.khuvucId);
    }
    // Hiển thị form đặt bàn
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Thông tin đặt bàn'),
            content: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: _hoTenController,
                      decoration: const InputDecoration(
                        labelText: 'Tên khách hàng',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Vui lòng nhập tên khách hàng';
                        }
                        return null;
                      },
                    ),
                    SizedBox(height: 8),
                    TextFormField(
                      controller: _soDienThoaiController,
                      decoration: const InputDecoration(
                        labelText: 'Số điện thoại',
                      ),
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Vui lòng nhập số điện thoại';
                        }
                        return null;
                      },
                    ),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    TextFormField(
                      controller: _soKhachController,
                      decoration: const InputDecoration(labelText: 'Số khách'),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value!.isEmpty) return 'Vui lòng nhập số khách';
                        if (int.tryParse(value) == null) return 'Vui lòng nhập số hợp lệ';
                        return null;
                      },
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _thoiGianDat != null
                                ? 'Thời gian: ${_thoiGianDat ?? DateTime.now().toLocal().toString().split('.')[0]}'
                                : 'Chọn thời gian',
                          ),
                        ),
                        TextButton(
                          onPressed: () => _selectDateTime(context),
                          child: const Text('Chọn thời gian'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Ghi chú
                    TextFormField(
                      controller: _ghiChuController,
                      decoration: const InputDecoration(labelText: 'Ghi chú'),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 12),
                    // Khu vực (ChoiceChip)
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: widget.khuVucs.map((khuVuc) {
                          final isSelected = _selectedKhuVuc?.khuvucId == khuVuc.khuvucId;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: ChoiceChip(
                              label: Text(khuVuc.tenKhuvuc),
                              selected: isSelected,
                              selectedColor: Colors.blue.shade100,
                              onSelected: (_) async {
                                setState(() {
                                  _selectedKhuVuc = khuVuc;
                                  _selectedBanIds = [];
                                });
                                await _loadBanList(khuVuc.khuvucId);
                              },
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Danh sách bàn (ChoiceChip)
                    if (_selectedKhuVuc != null)
                      _banList.isNotEmpty
                          ? Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: _banList.map((ban) {
                                final isSelected = _selectedBanIds.contains(ban.banId);
                                return ChoiceChip(
                                  label: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(ban.tenBan),
                                      if (ban.trangThai == 'DaDat') ...[
                                        SizedBox(width: 4),
                                        Icon(Icons.event_busy, size: 18, color: Colors.red),
                                        SizedBox(width: 2),
                                        Text('Đã đặt', style: TextStyle(color: Colors.red, fontSize: 12)),
                                      ]
                                      else if (ban.trangThai != 'SanSang') ...[
                                        SizedBox(width: 4),
                                        Icon(Icons.lock, size: 16, color: Colors.orange),
                                        SizedBox(width: 2),
                                        Text('Đang dùng', style: TextStyle(color: Colors.orange, fontSize: 12)),
                                      ]
                                    ],
                                  ),
                                  selected: isSelected,
                                  selectedColor: Colors.blue,
                                  labelStyle: TextStyle(
                                    color: isSelected ? Colors.white : Colors.black,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  backgroundColor: ban.trangThai == 'SanSang'
                                      ? (isSelected ? Colors.blue : Colors.white)
                                      : Colors.grey[300],
                                  shape: StadiumBorder(side: BorderSide(color: isSelected ? Colors.blue.shade900 : Colors.grey)),
                                  onSelected: ban.trangThai == 'SanSang'
                                      ? (_) {
                                          setState(() {
                                            if (isSelected) {
                                              _selectedBanIds.remove(ban.banId);
                                            } else {
                                              _selectedBanIds.add(ban.banId);
                                            }
                                          });
                                        }
                                      : null, // disable nếu không sẵn sàng
                                );
                              }).toList(),
                            )
                          : const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Text('Không có bàn khả dụng', style: TextStyle(color: Colors.red)),
                            ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Hủy'),
              ),
              TextButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate() && _selectedKhuVuc != null && _selectedBanIds.isNotEmpty) {
                    Navigator.pop(context);
                    await _confirmReservation();
                  } else if (_selectedBanIds.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Vui lòng chọn ít nhất một bàn!')),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Vui lòng chọn khu vực và nhập đầy đủ thông tin!')),
                    );
                  }
                },
                child: const Text('Xác nhận'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _confirmReservation() async {
    if (_formKey.currentState!.validate() && _selectedKhuVuc != null) {
      try {
        // Gửi danh sách bàn đã chọn vào service
        final datBans = await _datBanService.createDatBan(
          khachHangId: null,
          banIds: _selectedBanIds,
          soKhach: int.parse(_soKhachController.text),
          thoiGianDat: _thoiGianDat ?? DateTime.now(),
          ghiChu: _ghiChuController.text.isNotEmpty ? _ghiChuController.text : null,
          hoTen: _hoTenController.text.trim(),
          soDienThoai: _soDienThoaiController.text.trim(),
        );
        // Group các DatBan vừa đặt thành 1 DatBanGroup cho UI
        final tenBans = datBans.map((d) {
          final ban = _banList.firstWhere(
            (b) => b.banId == d.banId,
            orElse: () => BanNhaHang(
              banId: d.banId ?? 0,
              tenBan: 'B${d.banId ?? ""}',
              khuvucId: 0,
              trangThai: '',
              qrCodeUrl: null,
            ),
          );
          return ban.tenBan;
        }).toList();
        final datBanGroup = DatBanGroup.fromDatBanList(
          datBans,
          _hoTenController.text,
          tenBans,
          soDienThoai: _soDienThoaiController.text,
        );
        setState(() {
          _datBanList.addAll(datBans);
          _datBanGroupList.add(datBanGroup);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đặt bàn thành công!')),
        );
        // Reload lại danh sách bàn và đặt bàn sau khi đặt thành công
        await _reloadBanAndDatBan();
        // KHÔNG pop màn hình, chỉ cập nhật danh sách bàn và hiển thị thông báo thành công
        // Khi nhấn back mới quay về khu vực
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  void _showAddCustomerDialog(List<int> datBanIds) {
    showDialog(
      context: context,
      builder: (context) {
        final _customerFormKey = GlobalKey<FormState>();
        final _tenController = TextEditingController();
        final _sdtController = TextEditingController();
        final _emailController = TextEditingController();
        return AlertDialog(
          title: Text('Nhập thông tin khách hàng'),
          content: Form(
            key: _customerFormKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: _tenController,
                  decoration: InputDecoration(labelText: 'Họ tên'),
                  validator: (value) => value!.isEmpty ? 'Vui lòng nhập họ tên' : null,
                ),
                TextFormField(
                  controller: _sdtController,
                  decoration: InputDecoration(labelText: 'Số điện thoại'),
                  keyboardType: TextInputType.phone,
                  validator: (value) => value!.isEmpty ? 'Vui lòng nhập số điện thoại' : null,
                ),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Bỏ qua'),
            ),
            TextButton(
              onPressed: () async {
                if (_customerFormKey.currentState!.validate()) {
                  final khachHang = await _khachHangService.createThongTinKhachHang(
                    hoTen: _tenController.text,
                    soDienThoai: _sdtController.text,
                    email: _emailController.text.isEmpty ? null : _emailController.text,
                  );
                  if (khachHang != null) {
                    // Gọi API liên kết khách hàng với các đặt bàn vừa tạo
                    for (final datBanId in datBanIds) {
                      await _datBanService.ganKhachHangVaoDatBan(datBanId, khachHang.khachhangId);
                    }
                    Navigator.pop(context);
                    await _reloadBanAndDatBan(); // Reload lại danh sách đặt bàn để hiển thị tên/sđt mới
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Đã thêm thông tin khách hàng cho đặt bàn!')),
                    );
                  }
                }
              },
              child: Text('Lưu'),
            ),
          ],
        );
      },
    );
  }

  void _showReservationSuccess(DatBan datBan) {
    // Không hiển thị dialog thành công khi đặt bàn
  }

  Future<void> _deleteReservation(int datbanId) async {
    final success = await _datBanService.huyDatBan(datbanId);
    if (success) {
      await _reloadBanAndDatBan();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã hủy đặt bàn thành công.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi hủy đặt bàn.')),
      );
    }
  }

  void _moveTable(int datbanId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Chuyển bàn'),
        content: Text('Chọn bàn mới để chuyển (chưa triển khai).'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hệ thống đặt bàn'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _submitReservation,
            child: const Text('ĐẶT BÀN', style: TextStyle(color: Colors.white)),
            style: TextButton.styleFrom(backgroundColor: Colors.blue),
          ),
        ],
      ),
      body: Column(
        children: [
          // --- FILTER BUTTONS ---
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _filterStatus = "approved";
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _filterStatus == "approved" ? Colors.blue : Colors.grey[300],
                    foregroundColor: _filterStatus == "approved" ? Colors.white : Colors.black,
                  ),
                  child: const Text("Yêu cầu đã duyệt"),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _filterStatus = "cancelled";
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _filterStatus == "cancelled" ? Colors.red : Colors.grey[300],
                    foregroundColor: _filterStatus == "cancelled" ? Colors.white : Colors.black,
                  ),
                  child: const Text("Đã hủy"),
                ),
              ],
            ),
          ),
          // --- SEARCH BAR ---
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: "Tìm kiếm theo tên hoặc số điện thoại...",
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
              ),
              onChanged: (val) {
                setState(() {
                  _searchText = val.trim();
                });
              },
            ),
          ),
          // --- DANH SÁCH ---
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Builder(
                    builder: (context) {
                      // Lọc danh sách theo trạng thái và từ khóa
                      List<DatBanGroup> filtered = _datBanGroupList.where((g) {
                        if (_filterStatus == "approved") {
                          return g.trangThai != "DaHuy";
                        } else {
                          return g.trangThai == "DaHuy";
                        }
                      }).where((g) {
                        if (_searchText.isEmpty) return true;
                        final ten = g.tenKhachHang.toLowerCase();
                        final sdt = g.soDienThoai?.toLowerCase() ?? '';
                        return ten.contains(_searchText.toLowerCase()) || sdt.contains(_searchText.toLowerCase());
                      }).toList();
                      if (filtered.isEmpty) {
                        return const Center(child: Text('Không có dữ liệu phù hợp.'));
                      }
                      return Column(
                        children: filtered.map((group) {
                          final isSelected = _selectedTableId == group.datbanId;
                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedTableId = group.datbanId;
                              });
                            },
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.blue.shade100 : Colors.white,
                                border: Border.all(color: Colors.black),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Mã Đặt Bàn'),
                                      Text('${group.datbanId}'),
                                    ],
                                  ),
                                  Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    if (group.tenKhachHang.isNotEmpty)
      Text(group.tenKhachHang, style: const TextStyle(fontWeight: FontWeight.bold))
    else if ((group.soDienThoai ?? '').isNotEmpty)
      Text(group.soDienThoai ?? '', style: const TextStyle(fontWeight: FontWeight.bold))
    else
      const Text('(Chưa nhập tên hoặc SĐT)', style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey)),
  ],
),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Số khách'),
                                      Text('${group.soKhach} khách'),
                                    ],
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Thời gian'),
                                      Text('${group.thoiGianDat.day}/${group.thoiGianDat.month}/${group.thoiGianDat.year} ${group.thoiGianDat.hour}h${group.thoiGianDat.minute.toString().padLeft(2, '0')}'),
                                    ],
                                  ),
                                  Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const Text('Bàn'),
    if (group.tenBans.isNotEmpty)
      Text(group.tenBans.join(', '), style: const TextStyle(fontWeight: FontWeight.bold))
    else
      const Text('(Chưa có bàn)', style: TextStyle(color: Colors.red)),
  ],
),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Ghi chú'),
                                      Text(
                                        (group.ghiChu ?? '').length > 10
                                            ? '${(group.ghiChu ?? '').substring(0, 10)}...'
                                            : (group.ghiChu ?? ''),
                                      ),
                                    ],
                                  ),
                                  Row(
                                    children: [
                                      // Nút nhập/sửa thông tin khách hàng
                                      IconButton(
                                        icon: const Icon(Icons.person_outline, color: Colors.deepOrange),
                                        tooltip: group.tenKhachHang.isNotEmpty ? 'Sửa thông tin khách hàng' : 'Nhập thông tin khách hàng',
                                        onPressed: () => _showAddCustomerDialog([group.datbanId]),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.blue),
                                        onPressed: () => _moveTable(group.datbanId),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.close, color: Colors.red),
                                        onPressed: () => _deleteReservation(group.datbanId),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}