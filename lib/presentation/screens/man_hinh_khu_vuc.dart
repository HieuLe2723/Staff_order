// lib/presentation/screens/man_hinh_khu_vuc.dart
import 'package:flutter/material.dart';
import '../../domain/entities/khu_vuc.dart';
import 'man_hinh_dat_ban.dart';
import 'man_hinh_ca_lam_viec.dart';
import '../../domain/entities/ban_nha_hang.dart';
import 'route_observer.dart';
import 'man_hinh_nhap_thong_tin_khach.dart';
import 'man_hinh_order_mon_an.dart';
import '../../data/services/dat_ban_service.dart';
import '../../data/services/ban_nha_hang_service.dart';
import '../../data/services/don_hang_service.dart';

class ManHinhKhuVuc extends StatefulWidget {
  const ManHinhKhuVuc({super.key});

  @override
  _ManHinhKhuVucState createState() => _ManHinhKhuVucState();
}

class _ManHinhKhuVucState extends State<ManHinhKhuVuc> with RouteAware {
  late Future<List<KhuVuc>> _khuVucFuture;
  bool _isShowingTables = false;
  KhuVuc? _selectedKhuVuc;
  final DatBanService _banService = DatBanService();
    final BanNhaHangService _banNhaHangService = BanNhaHangService();
  final DonHangService _donHangService = DonHangService();

  // Hàm định dạng thởi gian dạng h:m:s
  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return '${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds';
  }

  @override
  void initState() {
    super.initState();
    _khuVucFuture = _banNhaHangService.getDanhSachKhuVuc();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      routeObserver.subscribe(this, route);
    }
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  void didPopNext() {
    // Khi quay lại màn hình này từ màn khác, luôn reload lại danh sách khu vực và bàn từ backend
    _refreshData();
    setState(() {}); // ép rebuild lại UI để cập nhật trạng thái bàn
  }

  void _refreshData() {
    setState(() {
      // Luôn gọi API backend để lấy dữ liệu mới nhất, tránh lấy cache
      _khuVucFuture = _banNhaHangService.getDanhSachKhuVuc();
    });
  }

  Future<void> _capNhatTrangThaiBan(int banId, String trangThai) async {
    await _banService.capNhatTrangThai(banId, trangThai);
    _refreshData();
  }

  void _capNhatTrangThaiBanRealTime() {
    // Logic cập nhật trạng thái bàn real-time
    // Có thể sử dụng WebSocket hoặc các giải pháp real-time khác để cập nhật trạng thái bàn
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh Sách Bàn'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: Colors.blue),
            tooltip: 'Đồng bộ dữ liệu',
            onPressed: () async {
              _refreshData();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã đồng bộ dữ liệu hoàn tất!')),
              );
            },
          ),
        ],
      ),
      body: Row(
        children: [
          Container(
            width: 80,
            height: MediaQuery.of(context).size.height,
            color: Colors.grey[100],
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildIconWithLabel(
                  icon: const Icon(Icons.notifications, color: Colors.blue),
                  label: 'Thông báo',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.work, color: Colors.blue),
                  label: 'Ca làm',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ManHinhCaLamViec()),
                    );
                  },
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.event_available, color: Colors.blue),
                  label: 'Đặt bàn',
                  onPressed: () async {
                    // Luôn lấy lại danh sách khu vực mới nhất từ backend
                    final khuVucs = await _banNhaHangService.getDanhSachKhuVuc();
                    if (khuVucs.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Không có khu vực nào để đặt bàn.')),
                      );
                      return;
                    }
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DatBanScreen(khuVucs: khuVucs),
                      ),
                    );
                    if (result == true) {
                      _refreshData();
                    }
                  },

                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.support_agent, color: Colors.blue),
                  label: 'Gọi nhân viên',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.star, color: Colors.blue),
                  label: 'Racing S',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.sync, color: Colors.blue),
                  label: 'Đồng bộ',
                  onPressed: _refreshData,
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.receipt_long, color: Colors.blue),
                  label: 'Order',
                  onPressed: () {},
                ),
                _buildIconWithLabel(
                  icon: const Icon(Icons.settings, color: Colors.blue),
                  label: 'Cài đặt',
                  onPressed: () {},
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<KhuVuc>>(
              future: _khuVucFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  if (snapshot.error.toString().contains('Phiên đăng nhập đã hết hạn')) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      Navigator.pushReplacementNamed(context, '/login');
                    });
                    return const Center(child: Text('Đang chuyển hướng về đăng nhập...'));
                  } else if (snapshot.error.toString().contains('403')) {
                    return const Center(child: Text('Bạn không có quyền truy cập khu vực này. Vui lòng liên hệ quản lý.'));
                  }
                  return Center(child: Text('Lỗi: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('Không có dữ liệu khu vực'));
                }

                final khuVucs = snapshot.data!;
                print('KhuVucs: $khuVucs');
                return _isShowingTables && _selectedKhuVuc != null
                    ? _buildTableGrid(context, _selectedKhuVuc!)
                    : _buildAreaGrid(context, khuVucs);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconWithLabel({
    required Icon icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: icon,
          onPressed: onPressed,
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.black),
          textAlign: TextAlign.center,
          softWrap: true,
        ),
      ],
    );
  }

  Widget _buildAreaGrid(BuildContext context, List<KhuVuc> khuVucs) {
    return GridView.builder(
      padding: const EdgeInsets.all(10),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.0,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: khuVucs.length,
      itemBuilder: (context, index) {
        final khuVuc = khuVucs[index];
        print('Selected KhuVuc: ${khuVuc.tenKhuvuc}, soBan: ${khuVuc.soBan}');
        return GestureDetector(
          onTap: () {
            setState(() {
              _isShowingTables = true;
              _selectedKhuVuc = khuVuc;
              print('Tapped: $_selectedKhuVuc');
            });
          },
          child: Card(
            color: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: Colors.blue, width: 2),
            ),
            child: Center(
              child: Text(
                khuVuc.tenKhuvuc,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTableGrid(BuildContext context, KhuVuc khuVuc) {
    print('Building Table Grid for ${khuVuc.tenKhuvuc}, soBan: ${khuVuc.soBan}');
    if (khuVuc.soBan <= 0) {
      return const Center(child: Text('Không có bàn trong khu vực này.'));
    }
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Danh sách bàn - ${khuVuc.tenKhuvuc}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () {
                  setState(() {
                    _isShowingTables = false;
                    _selectedKhuVuc = null;
                  });
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(6),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 1.5,
              crossAxisSpacing: 6,
              mainAxisSpacing: 6,
            ),
            itemCount: khuVuc.soBan,
            itemBuilder: (context, index) {
              String areaLetter = khuVuc.tenKhuvuc.replaceAll('Khu ', '');
              final banList = khuVuc.banList;
              BanNhaHang? ban;
              if (banList.isNotEmpty && index < banList.length) {
                ban = banList[index];
              }
              return InkWell(
                onTap: () async {
                  final tenBan = 'Bàn $areaLetter${index + 1}';
                  final banId = ban?.banId;

                  if (banId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Lỗi: Không xác định được ID bàn.')),
                    );
                    return;
                  }

                  if (ban?.trangThai == 'DaGoiMon') {
                    // Bàn đang sử dụng: tìm phiên và chuyển sang màn hình order
                    try {
                      final donHangData = await _donHangService.layPhienHoatDongTheoBan(banId);
                      if (!mounted) return;

                      final phienId = donHangData?['phien_id'] as int?;

                      if (phienId != null) {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ManHinhOrderMonAn(

                              banId: banId.toString(),
                              tenBan: tenBan,
                              phienId: phienId.toString(),
                            ),
                          ),
                        );
                        if (result == true) {
                          _refreshData();
                        }
                      } else {
                        // Trạng thái không nhất quán: Bàn 'DangSuDung' nhưng không có phiên/đơn hàng
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Lỗi: Không tìm thấy phiên làm việc của bàn này. Vui lòng đồng bộ lại.')),
                        );
                      }
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Lỗi khi lấy thông tin đơn hàng: $e')),
                      );
                    }
                  } else {
                    // Bàn trống, sẵn sàng hoặc đã đặt: chuyển sang màn hình nhập thông tin để tạo phiên mới
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ManHinhNhapThongTinKhach(
                          banId: banId,
                          tenBan: tenBan,
                        ),
                      ),
                    );
                    if (result == true) {
                      _refreshData();
                    }
                  }
                },
                child: Card(
                  color: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: const BorderSide(color: Colors.blue, width: 1),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Bàn $areaLetter${index + 1}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 3),
                        if (ban != null && ban.trangThai == 'DaDat')
                          Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.event_busy, size: 16, color: Colors.red),
                                  SizedBox(width: 4),
                                  Text('Đã đặt', style: TextStyle(fontSize: 12, color: Colors.red)),
                                ],
                              ),
                              if (ban.thoiGianBatDau != null)
                                Text(
                                  _formatDuration(DateTime.now().difference(ban.thoiGianBatDau!)),
                                  style: TextStyle(fontSize: 10, color: Colors.red),
                                ),
                            ],
                          )
                        else if (ban != null && ban.trangThai == 'DaGoiMon')
                          Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.people, size: 16, color: Colors.orange),
                                  SizedBox(width: 4),
                                  Text('Đã gọi món', style: TextStyle(fontSize: 12, color: Colors.orange)),
                                ],
                              ),
                              if (ban.thoiGianBatDau != null)
                                Text(
                                  _formatDuration(DateTime.now().difference(ban.thoiGianBatDau!)),
                                  style: TextStyle(fontSize: 10, color: Colors.orange),
                                ),
                            ],
                          )
                        else
                          const Text(
                            'Trống',
                            style: TextStyle(fontSize: 12, color: Colors.black54),
                          ),
                        // Không cần hiển thị thời gian ở đây vì đã được hiển thị trong các trường hợp cụ thể ở trên
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}