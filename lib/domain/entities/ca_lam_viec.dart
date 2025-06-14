// lib/domain/entities/ca_lam_viec.dart
class CaLamViec {
  final int? calamviecId;
  final String tenCa;
  final String thoiGianBatDau;
  final String thoiGianKetThuc;
  final String? moTa;

  CaLamViec({
    this.calamviecId,
    required this.tenCa,
    required this.thoiGianBatDau,
    required this.thoiGianKetThuc,
    this.moTa,
  });

  factory CaLamViec.fromJson(Map<String, dynamic> json) {
    return CaLamViec(
      calamviecId: json['calamviec_id'],
      tenCa: json['ten_ca'],
      thoiGianBatDau: json['thoi_gian_bat_dau'],
      thoiGianKetThuc: json['thoi_gian_ket_thuc'],
      moTa: json['mo_ta'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'calamviec_id': calamviecId,
      'ten_ca': tenCa,
      'thoi_gian_bat_dau': thoiGianBatDau,
      'thoi_gian_ket_thuc': thoiGianKetThuc,
      'mo_ta': moTa,
    };
  }
}