import 'package:flutter/material.dart';
import '../../data/services/phien_service.dart';
import 'man_hinh_order_mon_an.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Màn hình nhập thông tin khách/ tạo phiên sử dụng bàn
/// Được gọi khi nhân viên chọn 1 bàn trống.
class ManHinhNhapThongTinKhach extends StatefulWidget {
  final int banId;
  final String tenBan;
  const ManHinhNhapThongTinKhach({super.key, required this.banId, required this.tenBan});

  @override
  State<ManHinhNhapThongTinKhach> createState() => _ManHinhNhapThongTinKhachState();
}

class _ManHinhNhapThongTinKhachState extends State<ManHinhNhapThongTinKhach> {
  final _formKey = GlobalKey<FormState>();
  final _nguoiLonCtrl = TextEditingController(text: '1');
  final _treEmCoPhiCtrl = TextEditingController(text: '0');
  final _treEmKhongPhiCtrl = TextEditingController(text: '0');

  String _loaiKhachHang = 'KhachLe';
  String _loaiMenu = 'ALaCarte';

  final PhienService _phienService = PhienService();

  @override
  void dispose() {
    _nguoiLonCtrl.dispose();
    _treEmCoPhiCtrl.dispose();
    _treEmKhongPhiCtrl.dispose();
    super.dispose();
  }

  Future<void> _taoOrder() async {
    if (!_formKey.currentState!.validate()) return;

    final soNguoiLon = int.parse(_nguoiLonCtrl.text);
    final soTreEmCoPhi = int.parse(_treEmCoPhiCtrl.text);
    final soTreEmKhongPhi = int.parse(_treEmKhongPhiCtrl.text);

    try {
      // Lấy nhanVienId từ SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final nhanVienId = prefs.getString('nhanvien_id');
      if (nhanVienId == null || nhanVienId.isEmpty) {
        throw Exception('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
      }
      // 1. Tạo phiên
      final phienData = await _phienService.createPhien(
        banId: widget.banId,
        nhanVienId: nhanVienId,
        soKhachNguoiLon: soNguoiLon,
        soKhachTreEmCoPhi: soTreEmCoPhi,
        soKhachTreEmMienPhi: soTreEmKhongPhi,
        loaiKhach: _loaiKhachHang,
        loaiMenu: _loaiMenu,
      );
      final phienId = phienData['phien_id'] as int?;

      if (phienId == null) {
        throw Exception('Tạo phiên không thành công, không có ID trả về.');
      }

      if (!mounted) return;
      // 2. Chuyển sang màn hình order với phienId
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ManHinhOrderMonAn(

            banId: widget.banId.toString(),
            tenBan: widget.tenBan,
            phienId: phienId.toString(),
            // donHangId is no longer created here
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi tạo order: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tạo phiên - ${widget.tenBan}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _nguoiLonCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số người lớn'),
                      validator: (v) => (v == null || v.isEmpty) ? 'Nhập số' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _treEmCoPhiCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Trẻ em có phí'),
                      validator: (v) => (v == null || v.isEmpty) ? 'Nhập số' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _treEmKhongPhiCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Trẻ em không phí'),
                validator: (v) => (v == null || v.isEmpty) ? 'Nhập số' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _loaiKhachHang,
                decoration: const InputDecoration(labelText: 'Loại khách hàng'),
                items: const [
                  DropdownMenuItem(value: 'KhachLe', child: Text('Cá nhân')),
                  DropdownMenuItem(value: 'KhachDoan', child: Text('Nhóm')),
                  DropdownMenuItem(value: 'KhachDatTruoc', child: Text('Đặt trước')),
                ],
                onChanged: (v) => setState(() => _loaiKhachHang = v ?? 'KhachLe'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _loaiMenu,
                decoration: const InputDecoration(labelText: 'Loại menu'),
                items: const [
                  DropdownMenuItem(value: 'ALaCarte', child: Text('Alacarte')),
                  DropdownMenuItem(value: 'SetMenu', child: Text('Set menu')),
                  DropdownMenuItem(value: 'Buffet', child: Text('Buffet')),
                ],
                onChanged: (v) => setState(() => _loaiMenu = v ?? 'ALaCarte'),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _taoOrder,
                child: const Text('Tạo order & gọi món'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
