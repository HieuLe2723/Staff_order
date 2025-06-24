import 'ban_nha_hang.dart';

class KhuVuc {
  final int khuvucId;
  final String tenKhuvuc;
  final int soBan;
  final List<BanNhaHang> banList; // Thêm dòng này

  KhuVuc({
    required this.khuvucId,
    required this.tenKhuvuc,
    required this.soBan,
    required this.banList,
  });

  factory KhuVuc.fromJson(Map<String, dynamic> json) {
    return KhuVuc(
      khuvucId: json['khuvuc_id'],
      tenKhuvuc: json['ten_khuvuc'],
      soBan: (json['so_ban'] as int?) ?? (json['ban_list'] as List<dynamic>? ?? []).length,
      banList: (json['ban_list'] as List<dynamic>? ?? [])
          .map((e) => BanNhaHang.fromJson(e))
          .toList(),
    );
  }
}