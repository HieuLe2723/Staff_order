// src/models/phienSuDungBan.model.js
const pool = require('../config/db.config');

class PhienSuDungBanModel {
  static async findAll(filter) {
    let query = 'SELECT * FROM PhienSuDungBan';
    const params = [];
    // Correctly handle the filter object to ensure ban_id is applied
    if (filter && filter.ban_id) {
      query += ' WHERE ban_id = ?';
      params.push(filter.ban_id);
    } else if (filter && filter.datban_id) {
      // Also handle finding by datban_id if needed elsewhere
      query += ' WHERE datban_id = ?';
      params.push(filter.datban_id);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async create({ ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu, loai_thao_tac, thong_bao_thanh_toan }) {
    const [result] = await pool.query(
      'INSERT INTO PhienSuDungBan (ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach,loai_menu, loai_thao_tac, thong_bao_thanh_toan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu, loai_thao_tac, thong_bao_thanh_toan]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create table session');
    }
    // Lấy lại bản ghi vừa tạo để lấy thoi_gian_bat_dau
    const [rows] = await pool.query('SELECT phien_id, thoi_gian_bat_dau FROM PhienSuDungBan WHERE phien_id = ?', [result.insertId]);
    const phien = rows[0] || {};
    return { phien_id: result.insertId, thoi_gian_bat_dau: phien.thoi_gian_bat_dau, ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan };
  }

  static async createFromDatBan(datban_id, ban_id, khachhang_id, loai_menu = 'ALaCarte') {
    const [result] = await pool.query(
      'INSERT INTO PhienSuDungBan (datban_id, ban_id, khachhang_id, loai_menu, loai_thao_tac) VALUES (?, ?, ?, ?, ?)',
      [datban_id, ban_id, khachhang_id, loai_menu, 'DatBan']
    );
    return { phien_id: result.insertId, datban_id, ban_id, khachhang_id, loai_menu, loai_thao_tac: 'DatBan' };
  }

  static async createFromDatBanMulti(datban_id, ban_ids, khachhang_id, loai_menu = 'ALaCarte') {
    // Tạo 1 phiên sử dụng bàn chung cho nhiều bàn
    const [result] = await pool.query(
      'INSERT INTO PhienSuDungBan (datban_id, khachhang_id, loai_menu, loai_thao_tac) VALUES (?, ?, ?, ?)',
      [datban_id, khachhang_id, loai_menu, 'DatBan']
    );
    const phien_id = result.insertId;
    // Lưu liên kết các bàn vào bảng phụ PhienSuDungBan_Ban
    for (const ban_id of ban_ids) {
      await pool.query('INSERT INTO PhienSuDungBan_Ban (phien_id, ban_id) VALUES (?, ?)', [phien_id, ban_id]);
    }
    return { phien_id, datban_id, ban_ids, khachhang_id, loai_menu, loai_thao_tac: 'DatBan' };
  }

  static async findById(phien_id) {
    const [rows] = await pool.query(
      'SELECT * FROM PhienSuDungBan WHERE phien_id = ?',
      [phien_id]
    );
    return rows[0] || null;
  }

  static async update(phien_id, { ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc }) {
    const [result] = await pool.query(
      'UPDATE PhienSuDungBan SET ban_id = ?, ban_id_goc = ?, khachhang_id = ?, nhanvien_id = ?, so_khach_nguoi_lon = ?, so_khach_tre_em_co_phi = ?, so_khach_tre_em_mien_phi = ?, loai_khach = ?, loai_menu = ?, loai_thao_tac = ?, thong_bao_thanh_toan = ?, thoi_gian_ket_thuc = ?, ngay_cap_nhat = NOW() WHERE phien_id = ?',
      [ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_menu, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc, phien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Table session not found');
    }
    return await this.findById(phien_id);
  }

  static async setPromotion(phien_id, khuyenmai_id) {
    const [result] = await pool.query(
      'UPDATE PhienSuDungBan SET khuyenmai_id = ? WHERE phien_id = ?',
      [khuyenmai_id, phien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Table session not found');
    }
    return await this.findById(phien_id);
  }

  static async endSession(phien_id) {
    const [result] = await pool.query(
      'UPDATE PhienSuDungBan SET thoi_gian_ket_thuc = NOW(), ngay_cap_nhat = NOW() WHERE phien_id = ?',
      [phien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Table session not found');
    }
    return await this.findById(phien_id);
  }

  static async delete(phien_id) {
    const [result] = await pool.query(
      'DELETE FROM PhienSuDungBan WHERE phien_id = ?',
      [phien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Table session not found');
    }
    return { phien_id };
  }

  static async findByDatBanId(datban_id) {
    // Lấy phiên sử dụng bàn theo datban_id (có thể có nhiều bàn)
    const [rows] = await pool.query(
      'SELECT * FROM PhienSuDungBan WHERE datban_id = ? LIMIT 1',
      [datban_id]
    );
    if (!rows[0]) return null;
    // Lấy danh sách bàn liên kết với phiên này
    const [banRows] = await pool.query(
      'SELECT ban_id FROM PhienSuDungBan_Ban WHERE phien_id = ?',
      [rows[0].phien_id]
    );
    return { ...rows[0], ban_ids: banRows.map(r => r.ban_id) };
  }
}

module.exports = PhienSuDungBanModel;