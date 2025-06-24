class PhienSuDungBan {
  final int? phienId;
  final int? banId;
  final int? banIdGoc;
  final int? khachHangId;
  final String? nhanVienId;
  final int? soKhachNguoiLon;
  final int? soKhachTreEmCoPhi;
  final int? soKhachTreEmMienPhi;
  final String? loaiKhach;
  final String? loaiMenu;
  final DateTime? thoiGianBatDau;
  final DateTime? thoiGianKetThuc;
  final String? loaiThaoTac;
  final String? thongBaoThanhToan;

  PhienSuDungBan({
    this.phienId,
    this.banId,
    this.banIdGoc,
    this.khachHangId,
    this.nhanVienId,
    this.soKhachNguoiLon,
    this.soKhachTreEmCoPhi,
    this.soKhachTreEmMienPhi,
    this.loaiKhach,
    this.loaiMenu,
    this.thoiGianBatDau,
    this.thoiGianKetThuc,
    this.loaiThaoTac,
    this.thongBaoThanhToan,
  });

  Map<String, dynamic> toJson() {
    return {
      'ban_id': banId,
      'nhanvien_id': nhanVienId,
      'so_khach_nguoi_lon': soKhachNguoiLon,
      'so_khach_tre_em_co_phi': soKhachTreEmCoPhi,
      'so_khach_tre_em_mien_phi': soKhachTreEmMienPhi,
      'loai_khach': loaiKhach,
      'loai_menu': loaiMenu,
    };
  }

  factory PhienSuDungBan.fromJson(Map<String, dynamic> json) {
    return PhienSuDungBan(
      phienId: json['phien_id'],
      banId: json['ban_id'],
      banIdGoc: json['ban_id_goc'],
      khachHangId: json['khachhang_id'],
      nhanVienId: json['nhanvien_id'],
      soKhachNguoiLon: json['so_khach_nguoi_lon'],
      soKhachTreEmCoPhi: json['so_khach_tre_em_co_phi'],
      soKhachTreEmMienPhi: json['so_khach_tre_em_mien_phi'],
      loaiKhach: json['loai_khach'],
      loaiMenu: json['loai_menu'],
      thoiGianBatDau: json['thoi_gian_bat_dau'] != null ? DateTime.parse(json['thoi_gian_bat_dau']) : null,
      thoiGianKetThuc: json['thoi_gian_ket_thuc'] != null ? DateTime.parse(json['thoi_gian_ket_thuc']) : null,
      loaiThaoTac: json['loai_thao_tac'],
      thongBaoThanhToan: json['thong_bao_thanh_toan'],
    );
  }
}
