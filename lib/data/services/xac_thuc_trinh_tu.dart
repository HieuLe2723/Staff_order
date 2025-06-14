import '../../domain/entities/nhan_vien.dart';
import 'dang_nhap.dart';

class XacThucTrinhTu {
  final DangNhap _dangNhap;

  XacThucTrinhTu(this._dangNhap);

  Future<NhanVienDoiTuong?> call(String credentials) async {
    final parts = credentials.split('|');
    if (parts.length != 2) {
      print('Invalid credentials format: $credentials');
      return null;
    }
    final maNhanVien = parts[0];
    final matkhauHash = parts[1];
    if (maNhanVien.isEmpty || matkhauHash.isEmpty) {
      print('Empty maNhanVien or matkhauHash: $maNhanVien | $matkhauHash');
      return null;
    }
    return await _dangNhap.xacThuc(maNhanVien, matkhauHash);
  }
}