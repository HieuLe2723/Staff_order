const pool = require('../../config/db.config');
const { validate, schemas } = require('../../middlewares/validate');

exports.getInventory = (req, res) => {
  pool.query('SELECT * FROM NguyenLieu', (err, materials) => {
    if (err) {
      console.error('Lỗi truy vấn nguyên liệu:', err);
      return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
    }
    pool.query('SELECT * FROM ThietBi', (err, equipments) => {
      if (err) {
        console.error('Lỗi truy vấn thiết bị:', err);
        return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
      }
      res.render('inventory', { materials, equipments, editMaterialMode: false, editEquipmentMode: false, path: req.path });
    });
  });
};

exports.addMaterial = [
  validate(schemas.nguyenLieu),
  (req, res) => {
    const { ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao } = req.body;
    pool.query(
      'INSERT INTO NguyenLieu (ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao) VALUES (?, ?, ?, ?)',
      [ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao],
      (err) => {
        if (err) {
          console.error('Lỗi thêm nguyên liệu:', err);
          return res.status(500).render('error', { message: 'Lỗi thêm nguyên liệu', path: req.path });
        }
        res.redirect('/admin/inventory');
      }
    );
  }
];

exports.updateMaterial = [
  validate(schemas.nguyenLieu),
  (req, res) => {
    const { nguyenlieu_id, ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao } = req.body;
    pool.query(
      'UPDATE NguyenLieu SET ten_nguyenlieu = ?, don_vi = ?, so_luong_con_lai = ?, nguong_canh_bao = ? WHERE nguyenlieu_id = ?',
      [ten_nguyenlieu, don_vi, so_luong_con_lai, nguong_canh_bao, nguyenlieu_id],
      (err) => {
        if (err) {
          console.error('Lỗi cập nhật nguyên liệu:', err);
          return res.status(500).render('error', { message: 'Lỗi cập nhật nguyên liệu', path: req.path });
        }
        res.redirect('/admin/inventory');
      }
    );
  }
];

exports.addEquipment = [
  validate(schemas.thietBi),
  (req, res) => {
    const { ten, so_luong, trang_thai } = req.body;
    pool.query(
      'INSERT INTO ThietBi (ten, so_luong, trang_thai) VALUES (?, ?, ?)',
      [ten, so_luong, trang_thai],
      (err) => {
        if (err) {
          console.error('Lỗi thêm thiết bị:', err);
          return res.status(500).render('error', { message: 'Lỗi thêm thiết bị', path: req.path });
        }
        res.redirect('/admin/inventory');
      }
    );
  }
];

exports.updateEquipment = [
  validate(schemas.thietBi),
  (req, res) => {
    const { thietbi_id, ten, so_luong, trang_thai } = req.body;
    pool.query(
      'UPDATE ThietBi SET ten = ?, so_luong = ?, trang_thai = ? WHERE thietbi_id = ?',
      [ten, so_luong, trang_thai, thietbi_id],
      (err) => {
        if (err) {
          console.error('Lỗi cập nhật thiết bị:', err);
          return res.status(500).render('error', { message: 'Lỗi cập nhật thiết bị', path: req.path });
        }
        res.redirect('/admin/inventory');
      }
    );
  }
];

exports.getEditMaterial = (req, res) => {
  const { nguyenlieu_id } = req.params;
  pool.query('SELECT * FROM NguyenLieu WHERE nguyenlieu_id = ?', [nguyenlieu_id], (err, material) => {
    if (err || !material[0]) {
      console.error('Lỗi truy vấn nguyên liệu:', err);
      return res.status(500).render('error', { message: 'Nguyên liệu không tồn tại', path: req.path });
    }
    pool.query('SELECT * FROM ThietBi', (err, equipments) => {
      if (err) {
        console.error('Lỗi truy vấn thiết bị:', err);
        return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
      }
      res.render('inventory', { material: material[0], equipments, editMaterialMode: true, editEquipmentMode: false, path: req.path });
    });
  });
};

exports.getEditEquipment = (req, res) => {
  const { thietbi_id } = req.params;
  pool.query('SELECT * FROM ThietBi WHERE thietbi_id = ?', [thietbi_id], (err, equipment) => {
    if (err || !equipment[0]) {
      console.error('Lỗi truy vấn thiết bị:', err);
      return res.status(500).render('error', { message: 'Thiết bị không tồn tại', path: req.path });
    }
    pool.query('SELECT * FROM NguyenLieu', (err, materials) => {
      if (err) {
        console.error('Lỗi truy vấn nguyên liệu:', err);
        return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
      }
      res.render('inventory', { equipment: equipment[0], materials, editMaterialMode: false, editEquipmentMode: true, path: req.path });
    });
  });
};