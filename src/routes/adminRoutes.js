const express = require('express');
const router = express.Router();
const NhanVienModel = require('../models/nhanVien.model');
const JWTUtils = require('../utils/jwt');
const DonHangModel = require('../models/donHang.model');
const BanModel = require('../models/banNhaHang.model');
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');

const { authMiddleware } = require('../middlewares/auth');
const { adminRoleMiddleware } = require('../middlewares/role');

const employeeController = require('../controllers/Admin/employeeAdminController');
const revenueController = require('../controllers/Admin/revenueAdminController');
const inventoryController = require('../controllers/Admin/inventoryAdminController');
const dishController = require('../controllers/Admin/dishAdminController');
const dashboardController = require('../controllers/Admin/dashboardAdminController');
const AuthService = require('../services/auth.service');
const AuthController = require('../controllers/auth.controller');

// Login routes
router.get('/login', (req, res) => {
  res.render('login', {
    error: null,
    currentPath: req.path,
    title: 'Đăng Nhập - Quản Lý Nhà Hàng',
    request: req,
    loginPath: '/admin/login',
    nonce: req.nonce // Pass the nonce to the template
  });
});

router.post('/login', async (req, res) => {
  try {
    const { nhanvien_id, password } = req.body;
    
    // Call auth service directly
    const result = await AuthService.login(nhanvien_id, password);
    
    if (!result.success) {
      // If login failed, redirect back to login with error
      return res.redirect(`/admin/login?error=${encodeURIComponent(result.message)}`);
    }

    // Set token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    // Set refresh token in secure cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to dashboard
    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    // Redirect back to login with error
    return res.redirect(`/admin/login?error=${encodeURIComponent('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.')}`);
  }
});

// Protected routes
router.get('/dashboard', [authMiddleware, adminRoleMiddleware], async (req, res) => {
  try {
    // Get user info from token
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      
      // Get dashboard stats
      const stats = await getDashboardStats();
      
      res.render('dashboard', {
        title: 'Dashboard - Quản Lý Nhà Hàng',
        request: req,
        error: null,
        currentRoute: 'dashboard',
        user: user,
        stats: stats,
        recentReports: stats.recentReports
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/admin/login?error=Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.redirect('/admin/login?error=Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

// Helper function to get dashboard stats
async function getDashboardStats() {
  try {
    // Get total orders
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM DonHang');
    
    // Get total revenue
    const [totalRevenue] = await pool.query(
      'SELECT SUM(tong_tien) as total FROM DonHang WHERE trang_thai = ?',
      ['Hoàn Thành']
    );
    
    // Get active tables
    const [activeTables] = await pool.query(
      'SELECT COUNT(*) as count FROM BanNhaHang WHERE trang_thai = ?',
      ['Đang Sử Dụng']
    );
    
    // Get active employees
    const [activeEmployees] = await pool.query(
      'SELECT COUNT(*) as count FROM NhanVien WHERE hoat_dong = ?',
      [1]
    );
    
    // Get recent reports
    const [recentReports] = await pool.query(
      'SELECT * FROM BaoCaoDoanhThu ORDER BY ngay_bao_cao DESC LIMIT 7'
    );
    
    return {
      tong_don_hang: totalOrders[0]?.count || 0,
      tong_doanh_thu: totalRevenue[0]?.total || 0,
      ban_dang_su_dung: activeTables[0]?.count || 0,
      nhan_vien_hoat_dong: activeEmployees[0]?.count || 0,
      recentReports: recentReports
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      tong_don_hang: 0,
      tong_doanh_thu: 0,
      ban_dang_su_dung: 0,
      nhan_vien_hoat_dong: 0,
      recentReports: []
    };
  }
}

// Employee routes
router.get('/employees', [authMiddleware, adminRoleMiddleware], async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      
      res.render('employees', {
        title: 'Quản Lý Nhân Viên - Quản Lý Nhà Hàng',
        request: req,
        error: null,
        currentRoute: 'employees',
        user: user
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/admin/login?error=Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  } catch (error) {
    console.error('Employees error:', error);
    return res.redirect('/admin/login?error=Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

router.get('/employees/edit/:nhanvien_id', [authMiddleware, adminRoleMiddleware], (req, res) => {
  res.render('edit-employee', {
    title: 'Chỉnh Sửa Nhân Viên - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'employees'
  });
});

router.post('/employees', [authMiddleware, adminRoleMiddleware], (req, res) => {
  res.render('add-employee', {
    title: 'Thêm Mới Nhân Viên - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'employees'
  });
});

router.put('/employees', (req, res) => {
  res.render('edit-employee', {
    title: 'Chỉnh Sửa Nhân Viên - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'employees'
  });
});

router.delete('/employees', (req, res) => {
  res.redirect('/admin/employees');
});

// Revenue routes
router.get('/revenue', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      
      res.render('revenue', {
        title: 'Báo Cáo Doanh Thu - Quản Lý Nhà Hàng',
        request: req,
        error: null,
        currentRoute: 'revenue',
        user: user
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/admin/login?error=Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  } catch (error) {
    console.error('Revenue error:', error);
    return res.redirect('/admin/login?error=Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

// Inventory routes
router.get('/inventory', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      
      res.render('inventory', {
        title: 'Quản Lý Kho - Quản Lý Nhà Hàng',
        request: req,
        error: null,
        currentRoute: 'inventory',
        user: user
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/admin/login?error=Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  } catch (error) {
    console.error('Inventory error:', error);
    return res.redirect('/admin/login?error=Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

router.post('/inventory/material', (req, res) => {
  res.render('add-material', {
    title: 'Thêm Mới Nguyên Liệu - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

router.put('/inventory/material', (req, res) => {
  res.render('edit-material', {
    title: 'Chỉnh Sửa Nguyên Liệu - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

router.post('/inventory/equipment', (req, res) => {
  res.render('add-equipment', {
    title: 'Thêm Mới Thiết Bị - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

router.put('/inventory/equipment', (req, res) => {
  res.render('edit-equipment', {
    title: 'Chỉnh Sửa Thiết Bị - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

router.get('/inventory/editMaterial/:nguyenlieu_id', (req, res) => {
  res.render('edit-material', {
    title: 'Chỉnh Sửa Nguyên Liệu - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

router.get('/inventory/editEquipment/:thietbi_id', (req, res) => {
  res.render('edit-equipment', {
    title: 'Chỉnh Sửa Thiết Bị - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'inventory'
  });
});

// Dish routes
router.get('/dishes', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      
      res.render('dishes', {
        title: 'Quản Lý Món Ăn - Quản Lý Nhà Hàng',
        request: req,
        error: null,
        currentRoute: 'dishes',
        user: user
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/admin/login?error=Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  } catch (error) {
    console.error('Dishes error:', error);
    return res.redirect('/admin/login?error=Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

router.get('/dishes/edit/:monan_id', (req, res) => {
  res.render('edit-dish', {
    title: 'Chỉnh Sửa Món Ăn - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'dishes'
  });
});

router.post('/dishes', (req, res) => {
  res.render('add-dish', {
    title: 'Thêm Mới Món Ăn - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'dishes'
  });
});

router.put('/dishes', (req, res) => {
  res.render('edit-dish', {
    title: 'Chỉnh Sửa Món Ăn - Quản Lý Nhà Hàng',
    request: req,
    error: null,
    currentRoute: 'dishes'
  });
});

router.delete('/dishes', (req, res) => {
  res.redirect('/admin/dishes');
});

router.post('/dishes/toggle-lock', (req, res) => {
  res.redirect('/admin/dishes');
});

module.exports = router;