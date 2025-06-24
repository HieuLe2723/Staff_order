
const pool = require('../config/db.config');

class DatBanModel {
  // Thêm bàn vào đơn đặt bàn (group)
  static async addBanToDatBan(datban_id, ban_id) {
    await pool.query('INSERT INTO DatBan_Ban (datban_id, ban_id) VALUES (?, ?)', [datban_id, ban_id]);
  }

  // Lấy danh sách ban_id theo datban_id
  static async getBanIdsByDatBanId(datban_id) {
    const [rows] = await pool.query('SELECT ban_id FROM DatBan_Ban WHERE datban_id = ?', [datban_id]);
    return rows.map(r => r.ban_id);
  }
  // Tạo đơn đặt bàn (chỉ cho 1 bàn, dùng cho group sẽ xử lý ở service)
  static async create({ khachhang_id, ban_id, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai = 'ChoXuLy' }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy', 'DaDat'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: ChoXuLy, DaXacNhan, DaHuy');
    }
    if (khachhang_id) {
      const [khachHang] = await pool.query('SELECT 1 FROM ThongTinKhachHang WHERE khachhang_id = ?', [khachhang_id]);
      if (!khachHang[0]) throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    }
    // Nếu ban_id là null (group), cho phép tạo đơn không gán bàn cụ thể
    if (ban_id) {
      const [ban] = await pool.query('SELECT 1 FROM BanNhaHang WHERE ban_id = ?', [ban_id]);
      if (!ban[0]) throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }
    const [result] = await pool.query(
      'INSERT INTO DatBan (khachhang_id, ban_id, so_khach, so_tien_coc, thoi_gian_dat, ghi_chu, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [khachhang_id || null, ban_id || null, so_khach, so_tien_coc, thoi_gian_dat, ghi_chu || null, trang_thai]
    );
    return { datban_id: result.insertId, khachhang_id, ban_id, so_khach, so_tien_coc, thoi_gian_dat, ghi_chu, trang_thai, ngay_tao: new Date() };
  }

  static async findById(datban_id) {
    const [rows] = await pool.query(
      'SELECT * FROM DatBan WHERE datban_id = ?',
      [datban_id]
    );
    if (!rows[0]) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    // Lấy danh sách bàn cho group
    const ban_ids = await DatBanModel.getBanIdsByDatBanId(datban_id);
    return { ...rows[0], ban_ids };
  }

  static async findAll({ khachhang_id, ban_id, trang_thai } = {}) {
    let query = `
      SELECT d.*, k.ho_ten, k.so_dien_thoai
      FROM DatBan d
      LEFT JOIN ThongTinKhachHang k ON d.khachhang_id = k.khachhang_id
      WHERE 1=1
    `;
    const params = [];
    if (khachhang_id) { query += ' AND d.khachhang_id = ?'; params.push(khachhang_id); }
    if (ban_id) { query += ' AND d.ban_id = ?'; params.push(ban_id); }
    if (trang_thai) { query += ' AND d.trang_thai = ?'; params.push(trang_thai); }
    const [rows] = await pool.query(query, params);
    // Lấy ban_ids cho từng datban
    const BanNhaHangModel = require('./banNhaHang.model');
    for (const row of rows) {
      row.ban_ids = await DatBanModel.getBanIdsByDatBanId(row.datban_id);
      // Lấy danh sách tên bàn tương ứng
      if (row.ban_ids && row.ban_ids.length > 0) {
        const placeholders = row.ban_ids.map(() => '?').join(',');
        const [banRows] = await pool.query(`SELECT ten_ban FROM BanNhaHang WHERE ban_id IN (${placeholders})`, row.ban_ids);
        row.ban_ten_list = banRows.map(b => b.ten_ban);
      } else {
        row.ban_ten_list = [];
      }
    }
    return rows;
  }

  static async findAllWithSearch({ khachhang_id, ban_id, trang_thai, search }) {
    let query = `
      SELECT d.*, k.ho_ten, k.so_dien_thoai
      FROM DatBan d
      LEFT JOIN ThongTinKhachHang k ON d.khachhang_id = k.khachhang_id
      WHERE 1=1
    `;
    const params = [];
    if (khachhang_id) { query += ' AND d.khachhang_id = ?'; params.push(khachhang_id); }
    if (ban_id) { query += ' AND d.ban_id = ?'; params.push(ban_id); }
    if (trang_thai) { query += ' AND d.trang_thai = ?'; params.push(trang_thai); }
    if (search) {
      query += ' AND (k.ho_ten LIKE ? OR k.so_dien_thoai LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(query, params);
    // Lấy ban_ids cho từng datban
    const BanNhaHangModel = require('./banNhaHang.model');
    for (const row of rows) {
      row.ban_ids = await DatBanModel.getBanIdsByDatBanId(row.datban_id);
      // Lấy danh sách tên bàn tương ứng
      if (row.ban_ids && row.ban_ids.length > 0) {
        const placeholders = row.ban_ids.map(() => '?').join(',');
        const [banRows] = await pool.query(`SELECT ten_ban FROM BanNhaHang WHERE ban_id IN (${placeholders})`, row.ban_ids);
        row.ban_ten_list = banRows.map(b => b.ten_ban);
      } else {
        row.ban_ten_list = [];
      }
    }
    return rows;
  }

  static async update(datban_id, { khachhang_id, ban_id, so_khach, so_tien_coc = 0, thoi_gian_dat, ghi_chu, trang_thai }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy', 'DaDat'];
    if (trang_thai && !validStatuses.includes(trang_thai)) {
      throw new Error('Giá trị trang_thai không hợp lệ. Chỉ chấp nhận: ChoXuLy, DaXacNhan, DaHuy');
    }
    if (khachhang_id) {
      const [khachHang] = await pool.query('SELECT 1 FROM ThongTinKhachHang WHERE khachhang_id = ?', [khachhang_id]);
      if (!khachHang[0]) throw new Error('Không tìm thấy khách hàng với khachhang_id cung cấp');
    }
    if (ban_id) {
      const [ban] = await pool.query('SELECT 1 FROM BanNhaHang WHERE ban_id = ?', [ban_id]);
      if (!ban[0]) throw new Error('Không tìm thấy bàn với ban_id cung cấp');
    }

    const [result] = await pool.query(
      'UPDATE DatBan SET khachhang_id = ?, ban_id = ?, so_khach = ?, so_tien_coc = ?, thoi_gian_dat = ?, ghi_chu = ?, trang_thai = ? WHERE datban_id = ?',
      [khachhang_id, ban_id, so_khach, so_tien_coc, thoi_gian_dat, ghi_chu, trang_thai, datban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    return await this.findById(datban_id);
  }

  static async delete(datban_id) {
    const [result] = await pool.query(
      'DELETE FROM DatBan WHERE datban_id = ?',
      [datban_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy đặt bàn với datban_id cung cấp');
    }
    return { datban_id };
  }

  // Thêm các trường mới vào model
  static async updateTrangThai(datban_id, trang_thai) {
    await pool.query('UPDATE DatBan SET trang_thai = ? WHERE datban_id = ?', [trang_thai, datban_id]);
    // Nếu chuyển sang SanSang thì xóa các bàn đã đặt khỏi DatBan_Ban
    if (trang_thai === 'SanSang') {
      await pool.query('DELETE FROM DatBan_Ban WHERE datban_id = ?', [datban_id]);
    }
  }

  static async updateTienDatCoc(datban_id, so_tien_coc) {
    await pool.query('UPDATE DatBan SET so_tien_coc = ? WHERE datban_id = ?', [so_tien_coc, datban_id]);
  }

  static async updateThoiGianDatCoc(datban_id, thoi_gian_dat_coc) {
    await pool.query('UPDATE DatBan SET thoi_gian_dat_coc = ? WHERE datban_id = ?', [thoi_gian_dat_coc, datban_id]);
  }
}

module.exports = DatBanModel;