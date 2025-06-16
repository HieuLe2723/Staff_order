// lib/presentation/screens/man_hinh_khu_vuc.dart
import 'package:flutter/material.dart';
import '../../data/services/khu_vuc_ban.dart';
import '../../domain/entities/khu_vuc.dart';
import '../../data/services/lay_khu_vuc_trinh_tu.dart';
import 'man_hinh_dat_ban.dart';
import 'man_hinh_ca_lam_viec.dart';
import '../../domain/entities/ban_nha_hang.dart';
import 'route_observer.dart';

class ManHinhKhuVuc extends StatefulWidget {
  const ManHinhKhuVuc({super.key});

  @override
  _ManHinhKhuVucState createState() => _ManHinhKhuVucState();
}

class _ManHinhKhuVucState extends State<ManHinhKhuVuc> with RouteAware {
  late Future<List<KhuVuc>> _khuVucFuture;
  bool _isShowingTables = false;
  KhuVuc? _selectedKhuVuc;

  @override
  void initState() {
    super.initState();
    _khuVucFuture = LayKhuVucTrinhTu(KhuVucKho()).call();
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
      _khuVucFuture = LayKhuVucTrinhTu(KhuVucKho()).call();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh Sách Bàn'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
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
                    final khuVucs = await LayKhuVucTrinhTu(KhuVucKho()).call();
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
                  return const Center(child: Text('Không có khu vực nào'));
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
              final banList = khuVuc.banList ?? [];
              BanNhaHang? ban;
              if (banList.isNotEmpty && index < banList.length) {
                ban = banList[index];
              }
              return Card(
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
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.event_busy, size: 18, color: Colors.red),
                            SizedBox(width: 4),
                            Text('Đã đặt', style: TextStyle(fontSize: 12, color: Colors.red)),
                          ],
                        )
                      else if (ban != null && ban.trangThai == 'DangSuDung')
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.lock, size: 16, color: Colors.orange),
                            SizedBox(width: 4),
                            Text('Đang dùng', style: TextStyle(fontSize: 12, color: Colors.orange)),
                          ],
                        )
                      else
                        const Text(
                          'Trống',
                          style: TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                    ],
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