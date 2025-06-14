class ThongTinKhachHang {
  final int khachhangId;
  final String? hoTen;
  final String? soDienThoai;
  final String? email;
  final String? quocTich;
  final String? nhomTuoi;
  final String? loaiNhom;
  final DateTime ngayTao;
  final DateTime? ngayCapNhat;

  ThongTinKhachHang({
    required this.khachhangId,
    this.hoTen,
    this.soDienThoai,
    this.email,
    this.quocTich,
    this.nhomTuoi,
    this.loaiNhom,
    required this.ngayTao,
    this.ngayCapNhat,
  });

  factory ThongTinKhachHang.fromJson(Map<String, dynamic> json) {
    return ThongTinKhachHang(
      khachhangId: json['khachhang_id'],
      hoTen: json['ho_ten'],
      soDienThoai: json['so_dien_thoai'],
      email: json['email'],
      quocTich: json['quoc_tich'],
      nhomTuoi: json['nhom_tuoi'],
      loaiNhom: json['loai_nhom'],
      ngayTao: DateTime.parse(json['ngay_tao']),
      ngayCapNhat: json['ngay_cap_nhat'] != null ? DateTime.parse(json['ngay_cap_nhat']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'khachhang_id': khachhangId,
      'ho_ten': hoTen,
      'so_dien_thoai': soDienThoai,
      'email': email,
      'quoc_tich': quocTich,
      'nhom_tuoi': nhomTuoi,
      'loai_nhom': loaiNhom,
      'ngay_tao': ngayTao.toIso8601String(),
      'ngay_cap_nhat': ngayCapNhat?.toIso8601String(),
    };
  }
}