import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/services/dang_nhap.dart';
import '../../data/services/xac_thuc_trinh_tu.dart';
import 'man_hinh_khu_vuc.dart';

class ManHinhDangNhap extends StatefulWidget {
  const ManHinhDangNhap({super.key});

  @override
  _ManHinhDangNhapState createState() => _ManHinhDangNhapState();
}

class _ManHinhDangNhapState extends State<ManHinhDangNhap> {
  final XacThucTrinhTu _xacThucTrinhTu = XacThucTrinhTu(DangNhap());
  String nhanvienId = '';
  String matkhauHash = '';

  final FocusNode _focusNhanVien = FocusNode();
  final FocusNode _focusMatKhau = FocusNode();

  @override
  void initState() {
    super.initState();
    _kiemTraTokenDaLuu();
    Future.delayed(Duration(milliseconds: 500), () {
      FocusScope.of(context).requestFocus(_focusNhanVien);
    });
  }

  void _kiemTraTokenDaLuu() async {
    final token = await DangNhap().layToken();
    if (token != null) {
      _chuyenHuongSangKhuVuc();
    }
  }

  void _onKeyPressed(String value) {
    setState(() {
      bool isNhanvienId = nhanvienId.length < 6;

      if (value == 'x') {
        if (isNhanvienId && nhanvienId.isNotEmpty) {
          nhanvienId = nhanvienId.substring(0, nhanvienId.length - 1);
        } else if (!isNhanvienId && matkhauHash.isNotEmpty) {
          matkhauHash = matkhauHash.substring(0, matkhauHash.length - 1);
        }
      } else {
        if (isNhanvienId) {
          nhanvienId += value;
          if (nhanvienId.length == 6) {
            FocusScope.of(context).requestFocus(_focusMatKhau);
          }
        } else {
          matkhauHash += value;
        }
      }
    });
  }

  Future<void> _dangNhap() async {
    try {
      final nhanVien = await _xacThucTrinhTu(nhanvienId, matkhauHash);
      if (nhanVien != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Đăng nhập thành công! Chào ${nhanVien.hoTen}')));
        _chuyenHuongSangKhuVuc();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Đăng nhập thất bại: Sai mã nhân viên hoặc mật khẩu')));
      }
    } catch (e) {
      print('Login error: $e');
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Lỗi: ${e.toString()}')));
    }
  }

  void _chuyenHuongSangKhuVuc() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const ManHinhKhuVuc()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: OrientationBuilder(
        builder: (context, orientation) {
          return LayoutBuilder(
            builder: (context, constraints) {
              return SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Logo
                        Container(
                          height: 300,
                          width: 450,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey),
                          ),
                          child: Image.asset(
                            'assets/images/staff_order_logo.png',
                            fit: BoxFit.contain,
                          ),
                        ),
                        const SizedBox(height: 40),

                        Flex(
                          direction: orientation == Orientation.portrait ? Axis.vertical : Axis.horizontal,
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Nhập liệu
                            Column(
                              children: [
                                _buildRoundedBox(
                                  text: nhanvienId.isEmpty ? '' : nhanvienId,
                                  focusNode: _focusNhanVien,
                                ),
                                const SizedBox(height: 12),
                                _buildRoundedBox(
                                  text: matkhauHash.isEmpty ? '' : matkhauHash.replaceAll(RegExp('.'), '•'),
                                  focusNode: _focusMatKhau,
                                ),
                                const SizedBox(height: 20),
                                AnimatedScale(
                                  duration: const Duration(milliseconds: 200),
                                  scale: (nhanvienId.isNotEmpty && matkhauHash.isNotEmpty) ? 1.0 : 0.95,
                                  child: ElevatedButton(
                                    onPressed: (nhanvienId.isNotEmpty && matkhauHash.isNotEmpty) ? _dangNhap : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF00ADEF),
                                      foregroundColor: Colors.white,
                                      minimumSize: const Size(200, 60), // to hơn phím
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(30),
                                      ),
                                    ),
                                    child: const Text('XÁC NHẬN', style: TextStyle(fontSize: 20)),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 40, height: 40),

                            // Bàn phím
                            _buildNumpad(),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildRoundedBox({required String text, FocusNode? focusNode}) {
    return Container(
      width: 300,
      height: 80,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.black),
      ),
      alignment: Alignment.centerLeft,
      child: Focus(
        focusNode: focusNode,
        child: Text(
          text,
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }

  Widget _buildNumpad() {
    final keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'x'];

    return SizedBox(
      width: 220,
      child: GridView.builder(
        shrinkWrap: true,
        itemCount: keys.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
        ),
        itemBuilder: (context, index) {
          final key = keys[index];
          return GestureDetector(
            onTap: () => _onKeyPressed(key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 100),
              decoration: BoxDecoration(
                color: const Color(0xFFB3E5FC),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.shade300,
                    offset: const Offset(2, 2),
                    blurRadius: 4,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  key,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
