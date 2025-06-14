import 'khu_vuc_ban.dart';
import '../../domain/entities/khu_vuc.dart'; // Cập nhật import

class LayKhuVucTrinhTu {
  final KhuVucKho _kho;

  LayKhuVucTrinhTu(this._kho);

  Future<List<KhuVuc>> call() async {
    final khuVucs = await _kho.layDanhSachKhuVuc();
    return khuVucs.map((khuVuc) => KhuVuc(
      khuvucId: khuVuc.khuvucId,
      tenKhuvuc: khuVuc.tenKhuvuc,
      soBan: khuVuc.soBan,
    )).toList();
  }
}