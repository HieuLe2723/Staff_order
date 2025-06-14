const pool = require('../../config/db.config');
const { validate, schemas } = require('../../middlewares/validate');

exports.getAllEmployees = (req, res) => {
  pool.query('SELECT * FROM NhanVien nv JOIN Role r ON nv.role_id = r.role_id', (err, employees) => {
    if (err) {
      console.error('Lỗi truy vấn nhân viên:', err);
      return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
    }
    res.render('employees', { employees, editMode: false, path: req.path });
  });
};

exports.getEditEmployee = (req, res) => {
  const { nhanvien_id } = req.params;
  pool.query('SELECT * FROM NhanVien WHERE nhanvien_id = ?', [nhanvien_id], (err, employee) => {
    if (err || !employee[0]) {
      console.error('Lỗi truy vấn nhân viên:', err);
      return res.status(500).render('error', { message: 'Nhân viên không tồn tại', path: req.path });
    }
    pool.query('SELECT * FROM Role', (err, roles) => {
      if (err) {
        console.error('Lỗi truy vấn role:', err);
        return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
      }
      res.render('employees', { employee: employee[0], roles, editMode: true, path: req.path });
    });
  });
};

exports.addEmployee = [
  validate(schemas.nhanVien),
  (req, res) => {
    const { nhanvien_id, ho_ten, role_id, mat_khau } = req.body;
    pool.query(
      'INSERT INTO NhanVien (nhanvien_id, ho_ten, role_id, mat_khau) VALUES (?, ?, ?, ?)',
      [nhanvien_id, ho_ten, role_id, mat_khau],
      (err) => {
        if (err) {
          console.error('Lỗi thêm nhân viên:', err);
          return res.status(500).render('error', { message: 'Lỗi thêm nhân viên', path: req.path });
        }
        res.redirect('/admin/employees');
      }
    );
  }
];

exports.editEmployee = [
  validate(schemas.nhanVien),
  (req, res) => {
    const { nhanvien_id, ho_ten, role_id, mat_khau } = req.body;
    pool.query(
      'UPDATE NhanVien SET ho_ten = ?, role_id = ?, mat_khau = ? WHERE nhanvien_id = ?',
      [ho_ten, role_id, mat_khau, nhanvien_id],
      (err) => {
        if (err) {
          console.error('Lỗi cập nhật nhân viên:', err);
          return res.status(500).render('error', { message: 'Lỗi cập nhật nhân viên', path: req.path });
        }
        res.redirect('/admin/employees');
      }
    );
  }
];

exports.deleteEmployee = (req, res) => {
  const { nhanvien_id } = req.body;
  pool.query('DELETE FROM NhanVien WHERE nhanvien_id = ?', [nhanvien_id], (err) => {
    if (err) {
      console.error('Lỗi xóa nhân viên:', err);
      return res.status(500).render('error', { message: 'Lỗi xóa nhân viên', path: req.path });
    }
    res.redirect('/admin/employees');
  });
};