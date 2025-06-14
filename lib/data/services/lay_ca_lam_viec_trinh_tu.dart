// lib/data/services/lay_ca_lam_viec_trinh_tu.dart
import '../../domain/entities/ca_lam_viec.dart';
import 'ca_lam_viec_service.dart';

class LayCaLamViecTrinhTu {
  final CaLamViecService _service;

  LayCaLamViecTrinhTu(this._service);

  Future<List<CaLamViec>> call() async {
    final caLamViecs = await _service.getAllShifts();
    return caLamViecs.map((caLamViec) => CaLamViec(
      calamviecId: caLamViec.calamviecId,
      tenCa: caLamViec.tenCa,
      thoiGianBatDau: caLamViec.thoiGianBatDau,
      thoiGianKetThuc: caLamViec.thoiGianKetThuc,
      moTa: caLamViec.moTa,
    )).toList();
  }
}