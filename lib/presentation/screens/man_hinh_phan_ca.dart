import 'package:flutter/material.dart';
import '../../data/services/ca_lam_viec_service.dart';
import '../../data/services/dang_nhap.dart';
import '../../domain/entities/ca_lam_viec.dart';
import '../../domain/entities/nhan_vien.dart';
import '../../domain/entities/phan_ca_nhan_vien.dart';

class ManHinhPhanCa extends StatefulWidget {
  final String? nhanvienId;
  final int? selectedCaLamViecId; // Nếu null, hiển thị cho tất cả nhân viên (Quản Lý)

  const ManHinhPhanCa({super.key, this.nhanvienId, this.selectedCaLamViecId});

  @override
  _ManHinhPhanCaState createState() => _ManHinhPhanCaState();
}

class _ManHinhPhanCaState extends State<ManHinhPhanCa> {
  final CaLamViecService _caLamViecService = CaLamViecService();
  final DangNhap _dangNhap = DangNhap();
  late Future<List<PhanCaNhanVien>> _phanCaFuture;
  late Future<List<NhanVienDoiTuong>> _nhanVienFuture;
  late Future<List<CaLamViec>> _caLamViecFuture;
  String? _userRole;
  String? _selectedNhanVienId;
  int? _selectedCaLamViecId;
  DateTime _selectedDate = DateTime.now();
  final TextEditingController _ghiChuController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _nhanVienFuture = _caLamViecService.getAllEmployees();
    _caLamViecFuture = _caLamViecService.getAllShifts();
    _refreshData();
  }

  Future<void> _loadUserRole() async {
    final role = await _dangNhap.layRoleName();
    if (mounted) {
      setState(() {
        _userRole = role;
      });
    }
  }

  void _refreshData() {
    if (mounted) {
      setState(() {
        _phanCaFuture = _caLamViecService.getEmployeeShifts(
          nhanvienId: widget.nhanvienId ?? _selectedNhanVienId ?? '',
          startDate: '2025-06-01',
          endDate: '2025-06-30',
          calamviecId: widget.selectedCaLamViecId,
        );
      });
    }
  }

  Future<void> _showAssignShiftDialog() async {
    if (_userRole != 'Quan Ly') {
      _showSnackBar('Chỉ Quản Lý có quyền phân ca.', Colors.red);
      return;
    }

    _ghiChuController.clear();
    _selectedCaLamViecId = null;
    _selectedNhanVienId = null;
    _selectedDate = DateTime.now();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Phân Ca Làm Việc', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FutureBuilder<List<NhanVienDoiTuong>>(
                future: _nhanVienFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Text('Lỗi tải danh sách nhân viên: ${snapshot.error}', style: const TextStyle(color: Colors.red));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Không có nhân viên nào', style: TextStyle(color: Colors.grey));
                  }
                  final nhanViens = snapshot.data!;
                  return DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Chọn Nhân Viên',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    value: _selectedNhanVienId,
                    items: nhanViens
                        .map((nv) => DropdownMenuItem(
                      value: nv.nhanvienId,
                      child: Text(nv.hoTen, overflow: TextOverflow.ellipsis),
                    ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedNhanVienId = value;
                      });
                    },
                    validator: (value) => value == null ? 'Vui lòng chọn nhân viên' : null,
                    isExpanded: true, // Đảm bảo dropdown chiếm toàn bộ chiều rộng
                  );
                },
              ),
              const SizedBox(height: 12),
              FutureBuilder<List<CaLamViec>>(
                future: _caLamViecFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Text('Lỗi tải danh sách ca: ${snapshot.error}', style: const TextStyle(color: Colors.red));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Không có ca làm việc nào', style: TextStyle(color: Colors.grey));
                  }
                  final caLamViecs = snapshot.data!;
                  return DropdownButtonFormField<int>(
                    decoration: InputDecoration(
                      labelText: 'Chọn Ca Làm Việc',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    value: _selectedCaLamViecId,
                    items: caLamViecs
                        .map((ca) => DropdownMenuItem(
                      value: ca.calamviecId,
                      child: Text('${ca.tenCa} (${ca.thoiGianBatDau} - ${ca.thoiGianKetThuc})'),
                    ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedCaLamViecId = value;
                      });
                    },
                    validator: (value) => value == null ? 'Vui lòng chọn ca làm việc' : null,
                    isExpanded: true,
                  );
                },
              ),
              const SizedBox(height: 12),
              TextField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Ngày Làm',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  filled: true,
                  fillColor: Colors.grey[100],
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today, color: Colors.blue),
                    onPressed: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime(2100),
                        builder: (context, child) {
                          return Theme(
                            data: ThemeData.light().copyWith(
                              colorScheme: const ColorScheme.light(
                                primary: Colors.blue,
                                onPrimary: Colors.white,
                                surface: Colors.white,
                                onSurface: Colors.black,
                              ),
                              dialogBackgroundColor: Colors.white,
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (date != null) {
                        setState(() {
                          _selectedDate = date;
                        });
                      }
                    },
                  ),
                ),
                controller: TextEditingController(
                  text: '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _ghiChuController,
                decoration: InputDecoration(
                  labelText: 'Ghi Chú (Tùy chọn)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  filled: true,
                  fillColor: Colors.grey[100],
                ),
                maxLines: 2,
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
            onPressed: () async {
              if (_selectedNhanVienId == null) {
                _showSnackBar('Vui lòng chọn nhân viên.', Colors.red);
                return;
              }
              if (_selectedCaLamViecId == null) {
                _showSnackBar('Vui lòng chọn ca làm việc.', Colors.red);
                return;
              }
              try {
                await _caLamViecService.assignShift(
                  nhanvienId: _selectedNhanVienId!,
                  calamviecId: _selectedCaLamViecId!,
                  ngayLam: '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                  ghiChu: _ghiChuController.text.isEmpty ? null : _ghiChuController.text,
                );
                _showSnackBar('Phân ca thành công.', Colors.green);
                _refreshData();
                Navigator.pop(context);
              } catch (e) {
                _showSnackBar('Lỗi: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
              }
            },
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

  void _showSnackBar(String message, Color backgroundColor) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: backgroundColor,
        ),
      );
    }
  }

  // Thêm phương thức _showEditShiftDialog
  Future<void> _showEditShiftDialog(PhanCaNhanVien phanCa) async {
    _ghiChuController.text = phanCa.ghiChu ?? '';
    _selectedDate = DateTime.parse(phanCa.ngayLam);
    _selectedNhanVienId = phanCa.nhanvienId; // Đặt giá trị mặc định
    _selectedCaLamViecId = phanCa.calamviecId; // Đặt giá trị mặc định

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sửa Phân Ca', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              FutureBuilder<List<NhanVienDoiTuong>>(
                future: _nhanVienFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Text('Lỗi: ${snapshot.error}', style: TextStyle(color: Colors.red));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Không có nhân viên nào', style: TextStyle(color: Colors.grey));
                  }
                  final nhanViens = snapshot.data!;
                  return DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Chọn Nhân Viên',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    value: _selectedNhanVienId,
                    items: nhanViens
                        .map((nv) => DropdownMenuItem(
                      value: nv.nhanvienId,
                      child: Text(nv.hoTen),
                    ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedNhanVienId = value;
                      });
                    },
                    validator: (value) => value == null ? 'Vui lòng chọn nhân viên' : null,
                    isExpanded: true,
                  );
                },
              ),
              const SizedBox(height: 12),
              FutureBuilder<List<CaLamViec>>(
                future: _caLamViecFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Text('Lỗi: ${snapshot.error}', style: TextStyle(color: Colors.red));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Không có ca làm việc nào', style: TextStyle(color: Colors.grey));
                  }
                  final caLamViecs = snapshot.data!;
                  return DropdownButtonFormField<int>(
                    decoration: InputDecoration(
                      labelText: 'Chọn Ca Làm Việc',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    value: _selectedCaLamViecId,
                    items: caLamViecs
                        .map((ca) => DropdownMenuItem(
                      value: ca.calamviecId,
                      child: Text('${ca.tenCa} (${ca.thoiGianBatDau} - ${ca.thoiGianKetThuc})'),
                    ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedCaLamViecId = value;
                      });
                    },
                    validator: (value) => value == null ? 'Vui lòng chọn ca làm việc' : null,
                    isExpanded: true,
                  );
                },
              ),
              const SizedBox(height: 12),
              TextField(
                readOnly: true,
                decoration: InputDecoration(
                  labelText: 'Ngày Làm',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  filled: true,
                  fillColor: Colors.grey[100],
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.calendar_today, color: Colors.blue),
                    onPressed: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime.now(),
                        lastDate: DateTime(2100),
                        builder: (context, child) {
                          return Theme(
                            data: ThemeData.light().copyWith(
                              colorScheme: const ColorScheme.light(
                                primary: Colors.blue,
                                onPrimary: Colors.white,
                                surface: Colors.white,
                                onSurface: Colors.black,
                              ),
                              dialogBackgroundColor: Colors.white,
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (date != null) {
                        setState(() {
                          _selectedDate = date;
                        });
                      }
                    },
                  ),
                ),
                controller: TextEditingController(
                  text: '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _ghiChuController,
                decoration: InputDecoration(
                  labelText: 'Ghi Chú (Tùy chọn)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  filled: true,
                  fillColor: Colors.grey[100],
                ),
                maxLines: 2,
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
            onPressed: () async {
              if (_selectedNhanVienId == null) {
                _showSnackBar('Vui lòng chọn nhân viên.', Colors.red);
                return;
              }
              if (_selectedCaLamViecId == null) {
                _showSnackBar('Vui lòng chọn ca làm việc.', Colors.red);
                return;
              }
              try {
                await _caLamViecService.updateShiftAssignment( // Thay updateShift bằng updateShiftAssignment
                  phancaId: phanCa.phancaId,
                  nhanvienId: _selectedNhanVienId!,
                  calamviecId: _selectedCaLamViecId!,
                  ngayLam: '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                  ghiChu: _ghiChuController.text.isEmpty ? null : _ghiChuController.text,
                );
                _showSnackBar('Cập nhật phân ca thành công.', Colors.green);
                _refreshData();
                Navigator.pop(context);
              } catch (e) {
                _showSnackBar('Lỗi: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
              }
            },
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

  // Thêm phương thức _deleteShift
  Future<void> _deleteShift(int phancaId) async {
    try {
      await _caLamViecService.deleteShiftAssignment(phancaId);
      _showSnackBar('Xóa phân ca thành công.', Colors.green);
      _refreshData();
    } catch (e) {
      _showSnackBar('Lỗi: ${e.toString().replaceAll('Exception: ', '')}', Colors.red);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh Sách Phân Ca'),
        actions: _userRole == 'Quan Ly'
            ? [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAssignShiftDialog,
            tooltip: 'Phân ca',
          ),
        ]
            : [],
      ),
      body: Column(
        children: [
          if (_userRole == 'Quan Ly')
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: FutureBuilder<List<NhanVienDoiTuong>>(
                future: _nhanVienFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const CircularProgressIndicator();
                  } else if (snapshot.hasError) {
                    return Text('Lỗi: ${snapshot.error}');
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Text('Không có nhân viên nào');
                  }
                  final nhanViens = snapshot.data!;
                  return DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Chọn Nhân Viên',
                      border: OutlineInputBorder(),
                    ),
                    value: _selectedNhanVienId,
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('Tất cả nhân viên'),
                      ),
                      ...nhanViens
                          .map((nv) => DropdownMenuItem(
                        value: nv.nhanvienId,
                        child: Text(nv.hoTen),
                      ))
                          .toList(),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedNhanVienId = value;
                        _refreshData();
                      });
                    },
                  );
                },
              ),
            ),
          Expanded(
            child: FutureBuilder<List<PhanCaNhanVien>>(
              future: _phanCaFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Lỗi: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('Không có phân ca nào'));
                }

                final phanCas = snapshot.data!;
                return ListView.builder(
                  itemCount: phanCas.length,
                  itemBuilder: (context, index) {
                    final phanCa = phanCas[index];
                    return Card(
                      margin: const EdgeInsets.all(8),
                      child: ListTile(
                        title: Text('${phanCa.hoTen} - ${phanCa.tenCa}'),
                        subtitle: Text(
                          'Ngày: ${phanCa.ngayLam}\nThời gian: ${phanCa.thoiGianBatDau} - ${phanCa.thoiGianKetThuc}\nTrạng thái: ${phanCa.trangThai}\nGhi chú: ${phanCa.ghiChu ?? 'Không có'}',
                        ),
                        trailing: _userRole == 'Quan Ly'
                            ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(Icons.edit, color: Colors.blue),
                              onPressed: () => _showEditShiftDialog(phanCa),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _deleteShift(phanCa.phancaId),
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

  @override
  void dispose() {
    _ghiChuController.dispose();
    super.dispose();
  }
}