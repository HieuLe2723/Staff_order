import 'package:flutter/material.dart';

class BanPhimSoDinhDang extends StatelessWidget {
  final Function(String) onKeyPressed;
  final String giaTriHienTai;

  const BanPhimSoDinhDang({
    super.key,
    required this.onKeyPressed,
    required this.giaTriHienTai,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var row in [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [-1, 0, -2] // -1: dot, -2: backspace
        ])
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: row.map((num) {
              if (num == -1) {
                return _buildKey('•', () => onKeyPressed('•'));
              } else if (num == -2) {
                return _buildKey('x', () {
                  if (giaTriHienTai.isNotEmpty) {
                    onKeyPressed(giaTriHienTai.substring(0, giaTriHienTai.length - 1));
                  }
                });
              } else {
                return _buildKey(num.toString(), () => onKeyPressed(num.toString()));
              }
            }).toList(),
          ),
      ],
    );
  }

  Widget _buildKey(String label, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: InkWell(
        onTap: onTap,
        child: CircleAvatar(
          radius: 30,
          backgroundColor: Colors.lightBlue[100],
          child: Text(label, style: const TextStyle(fontSize: 20)),
        ),
      ),
    );
  }
}