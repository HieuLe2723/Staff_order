// src/models/datBan.model.js
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
  static async create({ khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai = 'ChoXuLy' }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy'];
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
      'INSERT INTO DatBan (khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai) VALUES (?, ?, ?, ?, ?, ?)',
      [khachhang_id || null, ban_id || null, so_khach, thoi_gian_dat, ghi_chu || null, trang_thai]
    );
    return { datban_id: result.insertId, khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai, ngay_tao: new Date() };
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
    for (const row of rows) {
      row.ban_ids = await DatBanModel.getBanIdsByDatBanId(row.datban_id);
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
    for (const row of rows) {
      row.ban_ids = await DatBanModel.getBanIdsByDatBanId(row.datban_id);
    }
    return rows;
  }

  static async update(datban_id, { khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai }) {
    const validStatuses = ['ChoXuLy', 'DaXacNhan', 'DaHuy'];
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
      'UPDATE DatBan SET khachhang_id = ?, ban_id = ?, so_khach = ?, thoi_gian_dat = ?, ghi_chu = ?, trang_thai = ? WHERE datban_id = ?',
      [khachhang_id, ban_id, so_khach, thoi_gian_dat, ghi_chu, trang_thai, datban_id]
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
}

module.exports = DatBanModel;