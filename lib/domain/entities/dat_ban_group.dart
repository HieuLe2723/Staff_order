import 'package:staff_order_restaurant/domain/entities/dat_ban.dart';

class DatBanGroup {
  final String? soDienThoai;
  final int datbanId;
  final List<int> banIds;
  final List<String> tenBans;
  final String tenKhachHang;
  final int soKhach;
  final DateTime thoiGianDat;
  final String? ghiChu;
  final String trangThai;
  final DateTime ngayTao;

  DatBanGroup({
    required this.datbanId,
    required this.banIds,
    required this.tenBans,
    required this.tenKhachHang,
    required this.soKhach,
    required this.thoiGianDat,
    this.ghiChu,
    required this.trangThai,
    required this.ngayTao,
    this.soDienThoai,
  });

  // Factory hỗ trợ chuyển từ list DatBan và tên khách hàng
  factory DatBanGroup.fromDatBanList(List<DatBan> datBans, String tenKhachHang, List<String> tenBans, {String? soDienThoai}) {
    // Lấy tất cả banIds từ các DatBan (ưu tiên lấy từ e.banIds, nếu không có thì lấy e.banId)
    final allBanIds = <int>{};
    for (final e in datBans) {
      if (e.banIds.isNotEmpty) {
        allBanIds.addAll(e.banIds);
      } else if (e.banId != null) {
        allBanIds.add(e.banId!);
      }
    }
    return DatBanGroup(
      datbanId: datBans.first.datbanId,
      banIds: allBanIds.toList(),
      tenBans: tenBans,
      tenKhachHang: tenKhachHang,
      soKhach: datBans.first.soKhach,
      thoiGianDat: datBans.first.thoiGianDat,
      ghiChu: datBans.first.ghiChu,
      trangThai: datBans.first.trangThai,
      ngayTao: datBans.first.ngayTao,
      soDienThoai: soDienThoai,
    );
  }
}
