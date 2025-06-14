// src/models/phienSuDungBan.model.js
const pool = require('../config/db.config');

class PhienSuDungBanModel {
  static async create({ ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan }) {
    const [result] = await pool.query(
      'INSERT INTO PhienSuDungBan (ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create table session');
    }
    return { phien_id: result.insertId, ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan };
  }

  static async findById(phien_id) {
    const [rows] = await pool.query(
      'SELECT * FROM PhienSuDungBan WHERE phien_id = ?',
      [phien_id]
    );
    return rows[0] || null;
  }

  static async update(phien_id, { ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc }) {
    const [result] = await pool.query(
      'UPDATE PhienSuDungBan SET ban_id = ?, ban_id_goc = ?, khachhang_id = ?, nhanvien_id = ?, so_khach_nguoi_lon = ?, so_khach_tre_em_co_phi = ?, so_khach_tre_em_mien_phi = ?, loai_khach = ?, loai_thao_tac = ?, thong_bao_thanh_toan = ?, thoi_gian_ket_thuc = ?, ngay_cap_nhat = NOW() WHERE phien_id = ?',
      [ban_id, ban_id_goc, khachhang_id, nhanvien_id, so_khach_nguoi_lon, so_khach_tre_em_co_phi, so_khach_tre_em_mien_phi, loai_khach, loai_thao_tac, thong_bao_thanh_toan, thoi_gian_ket_thuc, phien_id]
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
}

module.exports = PhienSuDungBanModel;