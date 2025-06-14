const pool = require('../../config/db.config');
const { validate, schemas } = require('../../middlewares/validate');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

exports.getAllDishes = (req, res) => {
  pool.query('SELECT * FROM LoaiMonAn', (err, loai_mon_an) => {
    if (err) {
      console.error('Lỗi truy vấn loại món ăn:', err);
      return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
    }
    pool.query(
      'SELECT ma.*, lma.ten_loai FROM MonAn ma LEFT JOIN LoaiMonAn lma ON ma.loai_id = lma.loai_id',
      (err, dishes) => {
        if (err) {
          console.error('Lỗi truy vấn món ăn:', err);
          return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
        }
        res.render('dishes', { dishes, loai_mon_an, editMode: false, path: req.path });
      }
    );
  });
};

exports.getEditDish = (req, res) => {
  const { monan_id } = req.params;
  pool.query('SELECT * FROM LoaiMonAn', (err, loai_mon_an) => {
    if (err) {
      console.error('Lỗi truy vấn loại món ăn:', err);
      return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
    }
    pool.query('SELECT * FROM MonAn WHERE monan_id = ?', [monan_id], (err, dish) => {
      if (err || !dish[0]) {
        console.error('Lỗi truy vấn món ăn:', err);
        return res.status(500).render('error', { message: 'Món ăn không tồn tại', path: req.path });
      }
      pool.query(
        'SELECT ma.*, lma.ten_loai FROM MonAn ma LEFT JOIN LoaiMonAn lma ON ma.loai_id = lma.loai_id',
        (err, dishes) => {
          if (err) {
            console.error('Lỗi truy vấn món ăn:', err);
            return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
          }
          res.render('dishes', { dishes, loai_mon_an, dish: dish[0], editMode: true, path: req.path });
        }
      );
    });
  });
};

exports.addDish = [
  upload.single('hinh_anh'),
  validate(schemas.monAn),
  (req, res) => {
    const { ten_mon, loai_id, gia } = req.body;
    const hinh_anh = req.file ? req.file.filename : null;
    pool.query(
      'INSERT INTO MonAn (ten_mon, loai_id, gia, hinh_anh) VALUES (?, ?, ?, ?)',
      [ten_mon, loai_id, gia, hinh_anh],
      (err) => {
        if (err) {
          console.error('Lỗi thêm món ăn:', err);
          return res.status(500).render('error', { message: 'Lỗi thêm món ăn', path: req.path });
        }
        res.redirect('/admin/dishes');
      }
    );
  }
];

exports.editDish = [
  upload.single('hinh_anh'),
  validate(schemas.monAn),
  (req, res) => {
    const { monan_id, ten_mon, loai_id, gia } = req.body;
    const hinh_anh = req.file ? req.file.filename : req.body.hinh_anh;
    pool.query(
      'UPDATE MonAn SET ten_mon = ?, loai_id = ?, gia = ?, hinh_anh = ? WHERE monan_id = ?',
      [ten_mon, loai_id, gia, hinh_anh, monan_id],
      (err) => {
        if (err) {
          console.error('Lỗi cập nhật món ăn:', err);
          return res.status(500).render('error', { message: 'Lỗi cập nhật món ăn', path: req.path });
        }
        res.redirect('/admin/dishes');
      }
    );
  }
];

exports.deleteDish = (req, res) => {
  const { monan_id } = req.body;
  pool.query('DELETE FROM MonAn WHERE monan_id = ?', [monan_id], (err) => {
    if (err) {
      console.error('Lỗi xóa món ăn:', err);
      return res.status(500).render('error', { message: 'Lỗi xóa món ăn', path: req.path });
    }
    res.redirect('/admin/dishes');
  });
};

exports.toggleDishLock = (req, res) => {
  const { monan_id } = req.body;
  pool.query(
    'UPDATE MonAn SET khoa = !khoa, ngay_khoa = IF(khoa = 0, NOW(), NULL) WHERE monan_id = ?',
    [monan_id],
    (err) => {
      if (err) {
        console.error('Lỗi khóa/mở món ăn:', err);
        return res.status(500).render('error', { message: 'Lỗi khóa/mở món ăn', path: req.path });
      }
      res.redirect('/admin/dishes');
    }
  );
};