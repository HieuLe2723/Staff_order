import 'package:flutter/material.dart';
import 'package:staff_order_restaurant/data/services/danh_gia_service.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_lua_chon_thanh_toan.dart';

class ManHinhDanhGia extends StatefulWidget {
  final int phienId;
  final String tenBan;

  const ManHinhDanhGia({super.key, required this.phienId, required this.tenBan});

  @override
  State<ManHinhDanhGia> createState() => _ManHinhDanhGiaState();
}

class _ManHinhDanhGiaState extends State<ManHinhDanhGia> {
  final DanhGiaService _danhGiaService = DanhGiaService();
  final TextEditingController _commentController = TextEditingController();

  int _rating = 0;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn ít nhất 1 sao để đánh giá.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _danhGiaService.submitDanhGia(
        phienId: widget.phienId,
        diemSo: _rating,
        binhLuan: _commentController.text,
      );

      if (!mounted) return;
      // Navigate to the payment selection screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => ManHinhLuaChonThanhToan(
            phienId: widget.phienId,
            tenBan: widget.tenBan,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: ${e.toString()}'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đánh giá của khách hàng'),
        centerTitle: true,
        automaticallyImplyLeading: false, // Hide back button
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Thanh toán thành công!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green),
              ),
              const SizedBox(height: 16),
              const Text(
                'Vui lòng đánh giá trải nghiệm của bạn tại nhà hàng.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < _rating ? Icons.star : Icons.star_border,
                      size: 40,
                    ),
                    color: Colors.amber,
                    onPressed: () => setState(() => _rating = index + 1),
                  );
                }),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _commentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Để lại bình luận của bạn (không bắt buộc)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 32),
              _isSubmitting
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _submitReview,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                        textStyle: const TextStyle(fontSize: 16),
                      ),
                      child: const Text('Hoàn tất & Gửi đánh giá'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
