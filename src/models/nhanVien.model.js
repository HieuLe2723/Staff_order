// src/models/nhanVien.model.js
const pool = require('../config/db.config');

class NhanVienModel {
  static async create({ nhanvien_id, ho_ten, email, matkhau_hash, role_id }) {
    const [result] = await pool.query(
      'INSERT INTO NhanVien (nhanvien_id, ho_ten, email, matkhau_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [nhanvien_id, ho_ten, email, matkhau_hash, role_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create employee');
    }
    return { nhanvien_id, ho_ten, email, matkhau_hash, role_id, hoat_dong: 1 };
  }

  static async findById(nhanvien_id) {
    const [rows] = await pool.query(
      'SELECT * FROM NhanVien WHERE nhanvien_id = ?',
      [nhanvien_id]
    );
    return rows[0] || null;
  }
  static async findAll() {
    const query = `SELECT nhanvien_id, ho_ten, role FROM NhanVien`; // Adjust fields as needed
    const [rows] = await pool.query(query);
    return rows;
  }

  static async update(nhanvien_id, { ho_ten, email, matkhau_hash, role_id, hoat_dong }) {
    const [result] = await pool.query(
      'UPDATE NhanVien SET ho_ten = ?, email = ?, matkhau_hash = ?, role_id = ?, hoat_dong = ?, ngay_cap_nhat = NOW() WHERE nhanvien_id = ?',
      [ho_ten, email, matkhau_hash, role_id, hoat_dong, nhanvien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Employee not found');
    }
    return await this.findById(nhanvien_id);
  }

  static async delete(nhanvien_id) {
    const [result] = await pool.query(
      'DELETE FROM NhanVien WHERE nhanvien_id = ?',
      [nhanvien_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Employee not found');
    }
    return { nhanvien_id };
  }
}

module.exports = NhanVienModel;