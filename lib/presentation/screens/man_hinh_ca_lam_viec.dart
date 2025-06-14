// lib/presentation/screens/man_hinh_ca_lam_viec.dart
import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../../data/services/ca_lam_viec_service.dart';
import '../../data/services/lay_ca_lam_viec_trinh_tu.dart';
import '../../data/services/dang_nhap.dart';
import '../../domain/entities/ca_lam_viec.dart';
import 'man_hinh_khu_vuc.dart';
import 'man_hinh_phan_ca.dart';

class ManHinhCaLamViec extends StatefulWidget {
  const ManHinhCaLamViec({super.key});

  @override
  _ManHinhCaLamViecState createState() => _ManHinhCaLamViecState();
}

class _ManHinhCaLamViecState extends State<ManHinhCaLamViec> {
  late Future<List<CaLamViec>> _caLamViecFuture;
  final CaLamViecService _caLamViecService = CaLamViecService();
  final DangNhap _dangNhap = DangNhap();
  final TextEditingController _tenCaController = TextEditingController();
  final TextEditingController _thoiGianBatDauController = TextEditingController();
  final TextEditingController _thoiGianKetThucController = TextEditingController();
  final TextEditingController _moTaController = TextEditingController();
  CaLamViec? _editingCaLamViec;
  String? _userRole;
  String? _currentNhanVienId;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _refreshData();
  }

  Future<void> _loadUserData() async {
    final role = await _dangNhap.layRoleName();
    final token = await _dangNhap.layToken();
    String? nhanVienId;
    if (token != null) {
      try {
        final decoded = JwtDecoder.decode(token);
        nhanVienId = decoded['nhanvien_id'] as String?;
      } catch (e) {
        print('Lỗi giải mã JWT: $e');
      }
    }
    if (mounted) {
      setState(() {
        _userRole = role;
        _currentNhanVienId = nhanVienId;
      });
    }
  }

  void _refreshData() {
    if (mounted) {
      setState(() {
        _caLamViecFuture = LayCaLamViecTrinhTu(_caLamViecService).call();
      });
    }
  }

  void _showAddEditDialog({CaLamViec? caLamViec}) {
    if (_userRole != 'Quan Ly') {
      _showSnackBar('Chỉ Quản Lý có quyền thêm/sửa ca làm việc.', Colors.red);
      return;
    }

    if (caLamViec != null) {
      _editingCaLamViec = caLamViec;
      _tenCaController.text = caLamViec.tenCa;
      _thoiGianBatDauController.text = caLamViec.thoiGianBatDau;
      _thoiGianKetThucController.text = caLamViec.thoiGianKetThuc;
      _moTaController.text = caLamViec.moTa ?? '';
    } else {
      _editingCaLamViec = null;
      _tenCaController.clear();
      _thoiGianBatDauController.clear();
      _thoiGianKetThucController.clear();
      _moTaController.clear();
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          caLamViec == null ? 'Thêm Ca Làm Việc' : 'Sửa Ca Làm Việc',
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTextField(
                controller: _tenCaController,
                label: 'Tên Ca',
                hint: 'VD: Ca Sáng',
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _thoiGianBatDauController,
                label: 'Thời Gian Bắt Đầu (HH:mm)',
                hint: 'VD: 08:00',
                keyboardType: TextInputType.datetime,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _thoiGianKetThucController,
                label: 'Thời Gian Kết Thúc (HH:mm)',
                hint: 'VD: 16:00',
                keyboardType: TextInputType.datetime,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _moTaController,
                label: 'Mô Tả (Tùy chọn)',
                hint: 'VD: Ca làm việc buổi sáng',
                isOptional: true,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => _saveShift(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Lưu', style: TextStyle(color: Colors.white)),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: Colors.white,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    bool isOptional = false,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.blue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
    );
  }

  Future<void> _saveShift() async {
    if (!mounted) return;

    try {
      if (_tenCaController.text.isEmpty ||
          _thoiGianBatDauController.text.isEmpty ||
          _thoiGianKetThucController.text.isEmpty) {
        throw Exception('Vui lòng điền đầy đủ thông tin bắt buộc.');
      }

      final timeFormat = RegExp(r'^\d{2}:\d{2}$');
      if (!_thoiGianBatDauController.text.contains(timeFormat) ||
          !_thoiGianKetThucController.text.contains(timeFormat)) {
        throw Exception('Định dạng thời gian phải là HH:mm.');
      }

      final startTime = _parseTime(_thoiGianBatDauController.text);
      final endTime = _parseTime(_thoiGianKetThucController.text);
      if (endTime.isBefore(startTime)) {
        throw Exception('Thời gian kết thúc phải sau thời gian bắt đầu.');
      }

      if (_editingCaLamViec == null) {
        await _caLamViecService.createShift(
          tenCa: _tenCaController.text,
          thoiGianBatDau: _thoiGianBatDauController.text,
          thoiGianKetThuc: _thoiGianKetThucController.text,
          moTa: _moTaController.text.isEmpty ? null : _moTaController.text,
        );
        _showSnackBar('Thêm ca thành công.', Colors.green);
      } else {
        await _caLamViecService.updateShift(
          calamviecId: _editingCaLamViec!.calamviecId!,
          tenCa: _tenCaController.text,
          thoiGianBatDau: _thoiGianBatDauController.text,
          thoiGianKetThuc: _thoiGianKetThucController.text,
          moTa: _moTaController.text.isEmpty ? null : _moTaController.text,
        );
        _showSnackBar('Cập nhật ca thành công.', Colors.green);
      }

      _refreshData();
      Navigator.pop(context);
    } catch (e) {
      _showSnackBar('Lỗi: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
    }
  }

  DateTime _parseTime(String time) {
    final parts = time.split(':');
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    return DateTime(2000, 1, 1, hour, minute);
  }

  void _confirmDelete(int calamviecId) {
    if (_userRole != 'Quan Ly') {
      _showSnackBar('Chỉ Quản Lý có quyền xóa ca làm việc.', Colors.red);
      return;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác Nhận Xóa', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Bạn có chắc muốn xóa ca làm việc này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await _caLamViecService.deleteShift(calamviecId);
                _refreshData();
                Navigator.pop(context);
                _showSnackBar('Xóa ca thành công.', Colors.green);
              } catch (e) {
                _showSnackBar('Lỗi: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Xóa', style: TextStyle(color: Colors.white)),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: Colors.white,
      ),
    );
  }

  void _showSnackBar(String message, Color backgroundColor) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: backgroundColor,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Quản Lý Ca Làm Việc'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: _userRole == 'Quan Ly'
            ? [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.blue, size: 28),
            onPressed: () => _showAddEditDialog(),
            tooltip: 'Thêm ca làm việc',
          ),
        ]
            : [],
      ),
      body: Row(
        children: [
          Container(
            width: 80,
            height: MediaQuery.of(context).size.height,
            color: Colors.grey[100],
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildIconWithLabel(
                  icon: const Icon(Icons.notifications, color: Colors.blue),
                  label: 'Thông báo',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.info, color: Colors.blue),
                  label: 'Ca làm',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.event_available, color: Colors.blue),
                  label: 'Đặt bàn',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ManHinhKhuVuc()),
                    );
                  },
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.support_agent, color: Colors.blue),
                  label: 'Phân ca',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ManHinhPhanCa(
                          nhanvienId: _userRole == 'Nhan Vien' ? _currentNhanVienId : null,
                        ),
                      ),
                    );
                  },
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.star, color: Colors.blue),
                  label: 'Racing S',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.sync, color: Colors.blue),
                  label: 'Đồng bộ',
                  onPressed: _refreshData,
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.receipt_long, color: Colors.blue),
                  label: 'Order',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.settings, color: Colors.blue),
                  label: 'Cài đặt',
                  onPressed: () {},
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<CaLamViec>>(
              future: _caLamViecFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  final error = snapshot.error.toString();
                  print('Error loading shifts: $error');
                  if (error.contains('Phiên đăng nhập đã hết hạn')) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (mounted) {
                        Navigator.pushReplacementNamed(context, '/login');
                      }
                    });
                    return const Center(child: Text('Đang chuyển hướng về đăng nhập...'));
                  } else if (error.contains('403')) {
                    return const Center(
                      child: Text('Bạn không có quyền truy cập. Vui lòng liên hệ quản lý.'),
                    );
                  }
                  return Center(child: Text('Lỗi: ${error.replaceAll('Exception: ', '')}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  print('No data or empty list from API: ${snapshot.data}');
                  return const Center(child: Text('Không có ca làm việc nào'));
                }

                final caLamViecs = snapshot.data!;
                return ListView.builder(
                  padding: const EdgeInsets.all(10),
                  itemCount: caLamViecs.length,
                  itemBuilder: (context, index) {
                    final caLamViec = caLamViecs[index];
                    return Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(color: Colors.blue, width: 1),
                      ),
                      margin: const EdgeInsets.symmetric(vertical: 5, horizontal: 8),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        title: Text(
                          caLamViec.tenCa,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        subtitle: Text(
                          '${caLamViec.thoiGianBatDau} - ${caLamViec.thoiGianKetThuc}\n${caLamViec.moTa ?? 'Không có mô tả'}',
                          style: const TextStyle(color: Colors.black54, fontSize: 14),
                        ),
                        onTap: () {
                          print('Navigating to ManHinhPhanCa with nhanvienId: ${_userRole == 'Nhan Vien' ? _currentNhanVienId : null}');
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ManHinhPhanCa(
                                nhanvienId: _userRole == 'Nhan Vien' ? _currentNhanVienId : null,
                              ),
                            ),
                          );
                        },
                        trailing: _userRole == 'Quan Ly'
                            ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit, color: Colors.blue),
                              onPressed: () => _showAddEditDialog(caLamViec: caLamViec),
                              tooltip: 'Sửa ca',
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _confirmDelete(caLamViec.calamviecId!),
                              tooltip: 'Xóa ca',
                            ),
                          ],
                        )
                            : null,
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconWithLabel({
    required Icon icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: icon,
          onPressed: onPressed,
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.black),
          textAlign: TextAlign.center,
          softWrap: true,
        ),
      ],
    );
  }

  @override
  void dispose() {
    _tenCaController.dispose();
    _thoiGianBatDauController.dispose();
    _thoiGianKetThucController.dispose();
    _moTaController.dispose();
    super.dispose();
  }
}