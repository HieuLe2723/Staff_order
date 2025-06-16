const { verifyToken } = require('../utils/jwt');
const ResponseUtils = require('../utils/response');
const NhanVienModel = require('../models/nhanVien.model');
const RoleModel = require('../models/role.model');
const ThongTinKhachHangModel = require('../models/thongTinKhachHang.model');

const authMiddleware = async (req, res, next) => {
  // Skip authentication for login route
  if (req.path === '/login') {
    return next();
  }

  let token = null;

  // Kiểm tra header Authorization
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Kiểm tra cookie nếu không có header
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // Nếu yêu cầu là HTML (từ trình duyệt), chuyển hướng đến trang đăng nhập
    if (req.accepts('html')) {
      return res.redirect('/admin/login');
    }
    return res.status(401).json(
      ResponseUtils.error('Authorization header missing or invalid', 401)
    );
  }

  try {
    const decoded = verifyToken(token);

    if (decoded.nhanvien_id) {
      // Xác thực nhân viên
      const user = await NhanVienModel.findById(decoded.nhanvien_id);
      if (!user) {
        if (req.accepts('html')) {
          return res.redirect('/admin/login');
        }
        return res.status(404).json(ResponseUtils.error('User not found', 404));
      }
      if (!user.hoat_dong) {
        if (req.accepts('html')) {
          return res.redirect('/admin/login');
        }
        return res.status(403).json(
          ResponseUtils.error('User account is inactive', 403)
        );
      }
      const role = await RoleModel.findById(user.role_id);
      if (!role) {
        if (req.accepts('html')) {
          return res.redirect('/admin/login');
        }
        return res.status(403).json(
          ResponseUtils.error('User role not found', 403)
        );
      }

      req.user = {
        type: 'Nhan Vien',
        nhanvien_id: user.nhanvien_id,
        role_id: user.role_id,
        role_name: role.role_name,
      };
    } else if (decoded.khachhang_id) {
      // Xác thực khách hàng
      const customer = await ThongTinKhachHangModel.findById(decoded.khachhang_id);
      if (!customer) {
        if (req.accepts('html')) {
          return res.redirect('/admin/login');
        }
        return res.status(404).json(
          ResponseUtils.error('Customer not found', 404)
        );
      }
      req.user = {
        type: 'khachhang',
        khachhang_id: customer.khachhang_id,
        role_name: 'KhachHang',
      };
    } else {
      throw new Error('Invalid token payload');
    }

    next();
  } catch (err) {
    if (req.accepts('html')) {
      return res.redirect('/admin/login');
    }
    return res.status(401).json(
      ResponseUtils.error('Invalid or expired token', 401, err.message)
    );
  }
};

module.exports = { authMiddleware };