import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
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
        if (db.banIds.isNotEmpty) {
          reservedBanIds.addAll(db.banIds);
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
  final TextEditingController _soTienCocController = TextEditingController(text: '0');
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
        trangThai = 'SanSang';
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
        _datBanGroupList = datBans.map((db) {
          // Nếu banTenList rỗng, tự lấy tên bàn từ _banList
          List<String> tenBans = (db.banTenList.isNotEmpty)
              ? db.banTenList
              : (db.banIds.isNotEmpty)
                  ? db.banIds.map((id) =>
                      _banList.firstWhere((b) => b.banId == id, orElse: () => BanNhaHang(banId: id, tenBan: 'B$id', khuvucId: 0, trangThai: '', qrCodeUrl: null)).tenBan
                    ).toList()
                  : (db.banId != null
                      ? [
                          _banList.firstWhere((b) => b.banId == db.banId, orElse: () => BanNhaHang(banId: db.banId!, tenBan: 'B${db.banId}', khuvucId: 0, trangThai: '', qrCodeUrl: null)).tenBan
                        ]
                      : []);
          // Thêm log kiểm tra phienId
          print('[DEBUG][DatBanGroup] Tạo group cho datbanId: \\${db.datbanId}, phienId: \\${db.phienId}, banIds: \\${db.banIds}, banTenList: \\${db.banTenList}');
          final group = DatBanGroup.fromDatBanList(
            [db],
            db.hoTen ?? '',
            tenBans,
            soDienThoai: db.soDienThoai ?? '',
          );
          print('[DEBUG][DatBanGroup] Group tạo ra: datbanId: \\${group.datbanId}, phienId: \\${group.phienId}, tenBans: \\${group.tenBans}');
          return group;
        }).toList();
        print('[DEBUG] _datBanGroupList cập nhật:');
        for (final group in _datBanGroupList) {
          print('  groupId: \\${group.datbanId}, tenKhachHang: \\${group.tenKhachHang}, soDienThoai: \\${group.soDienThoai}, tenBans: \\${group.tenBans}, trangThai: \\${group.trangThai}, phienId: \\${group.phienId}');
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
          int soKhach = int.tryParse(_soKhachController.text) ?? 0;
          bool showTienCoc = _selectedBanIds.length > 3 || soKhach > 10;
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
                        if (value == null || value.isEmpty) return 'Vui lòng nhập số khách';
                        if (int.tryParse(value) == null) return 'Vui lòng nhập số hợp lệ';
                        return null;
                      },
                      onChanged: (value) {
                        setState(() {}); // Để cập nhật showTienCoc khi số khách thay đổi
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
                    // Số tiền cọc
                    if (showTienCoc)
                      TextFormField(
                        controller: _soTienCocController,
                        decoration: const InputDecoration(labelText: 'Số tiền cọc (VNĐ)'),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (showTienCoc && (value == null || value.isEmpty)) {
                            return 'Vui lòng nhập số tiền cọc';
                          }
                          if (value != null && value.isNotEmpty && double.tryParse(value) == null) {
                            return 'Nhập số hợp lệ';
                          }
                          return null;
                        },
                      ),
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
    if (_formKey.currentState!.validate() && _selectedKhuVuc != null && _selectedBanIds.isNotEmpty) {
      try {
        double soTienCoc = double.tryParse(_soTienCocController.text) ?? 0.0;
        
        // Hiển thị loading
        if (context.mounted) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext context) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            },
          );
        }

        try {
          final datBans = await _datBanService.createDatBan(
            khachHangId: null,
            banIds: _selectedBanIds,
            soKhach: int.parse(_soKhachController.text),
            thoiGianDat: _thoiGianDat ?? DateTime.now(),
            ghiChu: _ghiChuController.text.isEmpty ? null : _ghiChuController.text,
            hoTen: _hoTenController.text.trim(),
            soDienThoai: _soDienThoaiController.text.trim(),
            soTienCoc: soTienCoc,
          );

          // Log thông tin đặt bàn và phiên sử dụng bàn
          for (final db in datBans) {
            print('[DEBUG][DatBan] datban_id: \\${db.datbanId}, phien_id: \\${db.phienId}, ban_id: \\${db.banId}, ban_ids: \\${db.banIds}');
          }

          // Đóng loading
          if (context.mounted) {
            Navigator.of(context).pop();
          }

          if (datBans.isEmpty) {
            throw Exception('Không nhận được phản hồi từ máy chủ');
          }

          // Cập nhật UI
          if (context.mounted) {
            setState(() {
              _datBanList.addAll(datBans);
              // Tạo DatBanGroup mới để hiển thị
              final now = DateTime.now();
              final datBanGroup = DatBanGroup(
                datbanId: datBans.first.datbanId,
                tenKhachHang: _hoTenController.text.trim(),
                soDienThoai: _soDienThoaiController.text.trim(),
                soKhach: int.parse(_soKhachController.text),
                thoiGianDat: _thoiGianDat ?? now,
                trangThai: 'ChoXuLy',
                banIds: _selectedBanIds,
                tenBans: datBans.map((db) => 'B${db.banId}').toList(),
                ghiChu: _ghiChuController.text,
                ngayTao: now,
                phienId: datBans.first.phienId, // Đảm bảo luôn truyền phienId
              );
              _datBanGroupList.insert(0, datBanGroup);
            });
          }

          // Đồng bộ lại trạng thái bàn
          await _reloadBanAndDatBan();
          
          // Hiển thị thông báo
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('✅ Đặt bàn thành công!')),
            );
          }

          // Reset form
          _hoTenController.clear();
          _soDienThoaiController.clear();
          _emailController.clear();
          _soKhachController.clear();
          _ghiChuController.clear();
          _soTienCocController.text = '0';
          _selectedBanIds = [];
          _thoiGianDat = DateTime.now();

          // Không đóng dialog đặt bàn ngay mà chỉ reset form
          // để người dùng có thể xem lại thông tin đã đặt
          setState(() {
            // Reset các trường nhập liệu
            _hoTenController.clear();
            _soDienThoaiController.clear();
            _emailController.clear();
            _soKhachController.clear();
            _ghiChuController.clear();
            _soTienCocController.text = '0';
            _selectedBanIds = [];
            _thoiGianDat = DateTime.now();
          });
          
          // Tự động đóng dialog sau 3 giây
          Future.delayed(const Duration(seconds: 60), () {
            if (context.mounted) {
              Navigator.of(context).pop();
            }
          });

        } catch (e) {
          // Đóng loading nếu có lỗi
          if (context.mounted) {
            Navigator.of(context).pop();
          }
          rethrow;
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('❌ Lỗi khi đặt bàn: ${e.toString()}')),
          );
        }
      }
    } else if (_selectedBanIds.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('❌ Vui lòng chọn ít nhất một bàn!')),
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

  // Hàm mở link thanh toán VNPay
  Future<void> _thanhToanDatCocVNPay(int datBanId, int phienId) async {
    final paymentUrl = await _datBanService.taoLinkThanhToanVNPay(datBanId,phienId);
    if (paymentUrl != null && paymentUrl.isNotEmpty) {
      if (await canLaunchUrl(Uri.parse(paymentUrl))) {
        await launchUrl(Uri.parse(paymentUrl), mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mở trang thanh toán VNPay!')),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không lấy được link thanh toán!')),
      );
    }
  }

  // Hàm đặt cọc nhanh (gọi API đặt cọc và mở thanh toán VNPay)
  Future<void> _datCocVaThanhToanVNPay(int datBanId, double soTienCoc, int phienId) async {
    final success = await _datBanService.datCoc(datBanId, soTienCoc);
    if (success) {
      await _thanhToanDatCocVNPay(datBanId,phienId);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đặt cọc thất bại!')),
      );
    }
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
                        } else if (_filterStatus == "cancelled") {
                          return g.trangThai == "DaHuy";
                        }
                        return true;
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
                                  Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    const Text('Tiền cọc'),
    if (_datBanList.isNotEmpty)
      Text(
        (() {
          final datBan = _datBanList.firstWhere(
            (d) => d.datbanId == group.datbanId,
            orElse: () => DatBan(
              datbanId: group.datbanId,
              soKhach: group.soKhach,
              thoiGianDat: group.thoiGianDat,
              trangThai: group.trangThai,
              ngayTao: group.ngayTao,
              banTenList: group.tenBans,
              banIds: group.banIds,
            ),
          );
          return datBan.soTienCoc > 0 ? '${datBan.soTienCoc.toStringAsFixed(0)} VNĐ' : 'Không';
        })(),
        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
      )
    else
      const Text('Không'),
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
                                      // Nút đặt cọc & thanh toán VNPay
                                      IconButton(
                                        icon: const Icon(Icons.payment, color: Colors.green),
                                        tooltip: 'Đặt cọc & Thanh toán VNPay',
                                        onPressed: () async {
                                          final datBan = _datBanList.firstWhere(
                                            (d) => d.datbanId == group.datbanId,
                                            orElse: () => DatBan(
                                              datbanId: group.datbanId,
                                              soKhach: group.soKhach,
                                              thoiGianDat: group.thoiGianDat,
                                              trangThai: group.trangThai,
                                              ngayTao: group.ngayTao,
                                              banTenList: group.tenBans,
                                              banIds: group.banIds,
                                              phienId: group.phienId, // Đảm bảo truyền phienId từ group
                                            ),
                                          );
                                          final soTienCoc = datBan.soTienCoc;
                                          final phienId = datBan.phienId;
                                          if (soTienCoc > 0 && phienId != null) {
                                            await _datCocVaThanhToanVNPay(datBan.datbanId, soTienCoc, phienId);
                                          } else if (soTienCoc <= 0) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Đặt bàn này chưa có số tiền cọc!')),
                                            );
                                          } else {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Không tìm thấy mã phiên sử dụng bàn!')),
                                            );
                                          }
                                        },
                                      ),
                                      // Nút đặt cọc (gọi datCocHandler)
                                      IconButton(
                                        icon: const Icon(Icons.attach_money, color: Colors.blue),
                                        tooltip: 'Đặt cọc',
                                        onPressed: () async {
                                          final datBan = _datBanList.firstWhere(
                                            (d) => d.datbanId == group.datbanId,
                                            orElse: () => DatBan(
                                              datbanId: group.datbanId,
                                              soKhach: group.soKhach,
                                              thoiGianDat: group.thoiGianDat,
                                              trangThai: group.trangThai,
                                              ngayTao: group.ngayTao,
                                              banTenList: group.tenBans,
                                              banIds: group.banIds,
                                              phienId: group.phienId, // Đảm bảo truyền phienId từ group
                                            ),
                                          );
                                          final soTienCoc = datBan.soTienCoc;
                                          if (soTienCoc > 0) {
                                            await _datBanService.datCocHandler(context, datBan.datbanId, soTienCoc, _reloadBanAndDatBan);
                                          } else {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Đặt bàn này chưa có số tiền cọc!')),
                                            );
                                          }
                                        },
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