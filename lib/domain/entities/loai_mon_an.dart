class LoaiMonAn {
  final int? loaiId;
  final String? tenLoai;
  final String? loaiMenu;

  LoaiMonAn({
    this.loaiId,
    this.tenLoai,
    this.loaiMenu,
  });

  factory LoaiMonAn.fromJson(Map<String, dynamic> json) {
    return LoaiMonAn(
      loaiId: json['loai_id'],
      tenLoai: json['ten_loai'],
      loaiMenu: json['loai_menu'], // Sửa đúng trường này!
    );
  }
}