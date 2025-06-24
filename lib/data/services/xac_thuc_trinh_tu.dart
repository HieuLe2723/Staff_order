import '../../domain/entities/nhan_vien.dart';
import 'dang_nhap.dart';

class XacThucTrinhTu {
  final DangNhap _dangNhap;

  XacThucTrinhTu(this._dangNhap);

  Future<NhanVienDoiTuong?> call(String maNhanVien, String matkhauHash) async {
    if (maNhanVien.isEmpty || matkhauHash.isEmpty) {
      print('Empty maNhanVien or matkhauHash');
      return null;
    }
    return await _dangNhap.xacThuc(maNhanVien, matkhauHash);
  }
}