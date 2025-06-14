import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:staff_order_restaurant/presentation/screens/man_hinh_dang_nhap.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Ensure Flutter bindings are initialized for async operations
  // Clear the token on app startup
  final prefs = await SharedPreferences.getInstance();
  await prefs.remove('jwt_token');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dang Nhap Nhan Vien',
      theme: ThemeData(primarySwatch: Colors.blue),
      debugShowCheckedModeBanner: false,
      home: const ManHinhDangNhap(),
    );
  }
}