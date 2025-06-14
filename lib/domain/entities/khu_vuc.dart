class KhuVuc {
  final int khuvucId;
  final String tenKhuvuc;
  final int soBan; // Số bàn trong khu vực

  KhuVuc({
    required this.khuvucId,
    required this.tenKhuvuc,
    required this.soBan,
  });

  factory KhuVuc.fromJson(Map<String, dynamic> json) {
    return KhuVuc(
      khuvucId: json['khuvuc_id'],
      tenKhuvuc: json['ten_khuvuc'],
      soBan: json['so_ban'] ?? 0,
    );
  }
}