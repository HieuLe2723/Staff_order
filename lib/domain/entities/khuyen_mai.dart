class KhuyenMai {
  final int? khuyenMaiId;
  final String? maCode;
  final String? moTa;
  final int? phanTramGiam;
  final DateTime? ngayHetHan;

  KhuyenMai({
    this.khuyenMaiId,
    this.maCode,
    this.moTa,
    this.phanTramGiam,
    this.ngayHetHan,
  });

  factory KhuyenMai.fromJson(Map<String, dynamic> json) {
    return KhuyenMai(
      khuyenMaiId: json['khuyenmai_id'],
      maCode: json['ma_code'],
      moTa: json['mo_ta'],
      phanTramGiam: json['phan_tram_giam'],
      ngayHetHan: json['ngay_het_han'] != null ? DateTime.parse(json['ngay_het_han']) : null,
    );
  }
}
