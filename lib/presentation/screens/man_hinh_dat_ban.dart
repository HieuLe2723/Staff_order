import 'package:flutter/material.dart';
import '../../data/services/dat_ban_service.dart';
import '../../data/services/thong_tin_khach_hang_service.dart';
import '../../domain/entities/dat_ban.dart';
import '../../domain/entities/khu_vuc.dart';

class DatBanScreen extends StatefulWidget {
  final List<KhuVuc> khuVucs;
  const DatBanScreen({super.key, required this.khuVucs});

  @override
  _DatBanScreenState createState() => _DatBanScreenState();
}

class _DatBanScreenState extends State<DatBanScreen> {
  final _formKey = GlobalKey<FormState>();
  final _hoTenController = TextEditingController();
  final _soDienThoaiController = TextEditingController();
  final _emailController = TextEditingController();
  final _soKhachController = TextEditingController();
  final _ghiChuController = TextEditingController();
  DateTime? _thoiGianDat;
  final DatBanService _datBanService = DatBanService();
  final ThongTinKhachHangService _khachHangService = ThongTinKhachHangService();
  List<DatBan> _datBanList = [];
  KhuVuc? _selectedKhuVuc;
  int? _selectedBanId;
  int? _selectedTableId; // Theo dõi bàn được chọn trong danh sách đặt bàn

  @override
  void initState() {
    super.initState();
    _thoiGianDat = DateTime.now();
    _loadDatBanList();
    _selectedKhuVuc = widget.khuVucs.isNotEmpty ? widget.khuVucs.first : null;
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

  Future<void> _loadDatBanList() async {
    setState(() {
      _datBanList = [
        DatBan(
          datbanId: 22156343,
          khachhangId: 1,
          banId: 8,
          soKhach: 8,
          thoiGianDat: DateTime(2024, 10, 11, 18, 0),
          ghiChu: null,
          trangThai: 'ChoXuLy',
          ngayTao: DateTime.now(),
        ),
      ];
    });
  }

  Future<void> _submitReservation() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thông tin đặt bàn'),
        content: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButton<KhuVuc>(
                  hint: const Text('Chọn khu vực'),
                  value: _selectedKhuVuc,
                  onChanged: (KhuVuc? newValue) {
                    setState(() {
                      _selectedKhuVuc = newValue;
                      _selectedBanId = null; // Reset bàn khi đổi khu vực
                    });
                  },
                  items: widget.khuVucs.map<DropdownMenuItem<KhuVuc>>((KhuVuc value) {
                    return DropdownMenuItem<KhuVuc>(
                      value: value,
                      child: Text(value.tenKhuvuc),
                    );
                  }).toList(),
                ),
                TextFormField(
                  controller: _hoTenController,
                  decoration: const InputDecoration(labelText: 'Họ tên'),
                  validator: (value) => value!.isEmpty ? 'Vui lòng nhập họ tên' : null,
                ),
                TextFormField(
                  controller: _soDienThoaiController,
                  decoration: const InputDecoration(labelText: 'Số điện thoại'),
                  keyboardType: TextInputType.phone,
                  validator: (value) => value!.isEmpty ? 'Vui lòng nhập số điện thoại' : null,
                ),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) => null,
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
                            ? 'Thời gian: ${_thoiGianDat!.toLocal().toString().split('.')[0]}'
                            : 'Chọn thời gian',
                      ),
                    ),
                    TextButton(
                      onPressed: () => _selectDateTime(context),
                      child: const Text('Chọn thời gian'),
                    ),
                  ],
                ),
                TextFormField(
                  controller: _ghiChuController,
                  decoration: const InputDecoration(labelText: 'Ghi chú'),
                ),
                const SizedBox(height: 16),
                if (_selectedKhuVuc != null)
                  Wrap(
                    spacing: 8.0,
                    runSpacing: 8.0,
                    children: List.generate(_selectedKhuVuc!.soBan, (index) {
                      final tableId = index + 1;
                      return ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _selectedBanId = tableId; // Cập nhật bàn được chọn
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          shape: const CircleBorder(),
                          padding: const EdgeInsets.all(16),
                          backgroundColor: _selectedBanId == tableId
                              ? Colors.blue.shade100 // Đổi màu khi bàn được chọn
                              : null, // Màu mặc định
                        ),
                        child: Text('${_selectedKhuVuc!.tenKhuvuc.replaceAll('Khu ', '')}$tableId'),
                      );
                    }),
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
              if (_formKey.currentState!.validate() && _selectedKhuVuc != null && _selectedBanId != null) {
                Navigator.pop(context);
                await _confirmReservation();
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Vui lòng chọn khu vực và bàn.')),
                );
              }
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmReservation() async {
    if (_formKey.currentState!.validate() && _selectedKhuVuc != null) {
      try {
        final khachHang = await _khachHangService.createThongTinKhachHang(
          hoTen: _hoTenController.text,
          soDienThoai: _soDienThoaiController.text,
          email: _emailController.text.isEmpty ? null : _emailController.text,
        );
        if (khachHang != null) {
          final banId = _selectedBanId ?? 1;
          final datBan = await _datBanService.createDatBan(
            khachHangId: khachHang.khachhangId,
            banId: banId,
            soKhach: int.parse(_soKhachController.text),
            thoiGianDat: _thoiGianDat!,
            ghiChu: _ghiChuController.text.isNotEmpty ? _ghiChuController.text : null,
          );
          if (datBan != null) {
            setState(() {
              _datBanList.add(datBan);
              _showReservationSuccess(datBan);
            });
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Đặt bàn thất bại, vui lòng thử lại.')),
            );
          }
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  void _showReservationSuccess(DatBan datBan) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đặt Bàn Thành Công'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Mã đặt bàn: ${datBan.datbanId}'),
            Text('Tên: ${_hoTenController.text}'),
            Text('Số điện thoại: ${_soDienThoaiController.text}'),
            if (_emailController.text.isNotEmpty) Text('Email: ${_emailController.text}'),
            Text('Số khách: ${datBan.soKhach}'),
            Text('Thời gian: ${datBan.thoiGianDat.toLocal().toString().split('.')[0]}'),
            Text('Bàn: ${_selectedKhuVuc!.tenKhuvuc.replaceAll('Khu ', '')}${datBan.banId}'),
            if (datBan.ghiChu != null) Text('Ghi chú: ${datBan.ghiChu}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _deleteReservation(int datbanId) {
    setState(() {
      _datBanList.removeWhere((datBan) => datBan.datbanId == datbanId);
      if (_selectedTableId == datbanId) {
        _selectedTableId = null; // Clear selection if deleted
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đã xóa đặt bàn thành công.')),
    );
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
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Danh sách bàn đã được đặt',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Column(
                    children: _datBanList.map((datBan) {
                      final isSelected = _selectedTableId == datBan.datbanId;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedTableId = datBan.datbanId;
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
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Mã Đặt Bàn'),
                                Text('${datBan.datbanId}'),
                              ]),
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Tên'),
                                Text('A Long'),
                              ]),
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Số khách'),
                                Text('${datBan.soKhach} khách'),
                              ]),
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Thời gian'),
                                Text('${datBan.thoiGianDat.day}/${datBan.thoiGianDat.month}/${datBan.thoiGianDat.year} ${datBan.thoiGianDat.hour}h${datBan.thoiGianDat.minute.toString().padLeft(2, '0')}'),
                              ]),
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Bàn'),
                                Text('B${datBan.banId}'),
                              ]),
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                const Text('Ghi chú'),
                                Text(
                                  datBan.ghiChu != null && datBan.ghiChu!.length > 10
                                      ? '${datBan.ghiChu!.substring(0, 10)}...'
                                      : datBan.ghiChu ?? '',
                                ),
                              ]),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.arrow_back_ios_new, color: Colors.blue),
                                    onPressed: () => _moveTable(datBan.datbanId),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.close, color: Colors.red),
                                    onPressed: () => _deleteReservation(datBan.datbanId),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
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