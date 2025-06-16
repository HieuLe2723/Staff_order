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
    // Ưu tiên lấy tên bàn từ banTenList của từng DatBan nếu có
    final allTenBans = <String>{};
    for (final e in datBans) {
      if ((e.banTenList).isNotEmpty) {
        allTenBans.addAll(e.banTenList);
      }
    }
    final finalTenBans = allTenBans.isNotEmpty ? allTenBans.toList() : tenBans;

    // Lấy tất cả banIds từ các DatBan (ưu tiên lấy từ e.banIds, nếu không có thì lấy e.banId)
    final allBanIds = <int>{};
    for (final e in datBans) {
      // Đảm bảo luôn dùng list, không bao giờ null
      if ((e.banIds).isNotEmpty) {
        allBanIds.addAll(e.banIds);
      } else if (e.banId != null) {
        allBanIds.add(e.banId ?? 0); // fallback to 0 if null
      }
    }
    final first = datBans.isNotEmpty ? datBans.first : null;
    return DatBanGroup(
      datbanId: first?.datbanId ?? 0,
      banIds: allBanIds.isNotEmpty ? allBanIds.toList() : [], // always a list
      tenBans: tenBans.isNotEmpty ? tenBans : [], // always a list
      tenKhachHang: tenKhachHang.isNotEmpty ? tenKhachHang : '', // always a string
      soKhach: first?.soKhach ?? 0,
      thoiGianDat: first?.thoiGianDat ?? DateTime.now(),
      ghiChu: (first?.ghiChu ?? '').toString(), // always a string
      trangThai: first?.trangThai ?? '',
      ngayTao: first?.ngayTao ?? DateTime.now(),
      soDienThoai: soDienThoai ?? '', // always a string
    );
  }
}
