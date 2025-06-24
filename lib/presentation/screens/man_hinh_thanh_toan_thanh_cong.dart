import 'package:flutter/material.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_khu_vuc.dart';

class ManHinhThanhToanThanhCong extends StatelessWidget {
  const ManHinhThanhToanThanhCong({super.key});

  void _navigateToHome(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const ManHinhKhuVuc()),
      (Route<dynamic> route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              color: Colors.white,
              size: 100.0,
            ),
            const SizedBox(height: 24.0),
            const Text(
              'Thanh toán thành công!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 48.0),
            ElevatedButton(
              onPressed: () => _navigateToHome(context),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                textStyle: const TextStyle(fontSize: 18),
              ),
              child: const Text('Quay về Màn hình chính'),
            ),
          ],
        ),
      ),
    );
  }
}
