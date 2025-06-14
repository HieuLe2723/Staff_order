// src/models/role.model.js
const pool = require('../config/db.config');

class RoleModel {
  static async create({ role_name }) {
    const [result] = await pool.query(
      'INSERT INTO Role (role_name) VALUES (?)',
      [role_name]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to create role');
    }
    return { role_id: result.insertId, role_name };
  }

  static async findById(role_id) {
    const [rows] = await pool.query(
      'SELECT * FROM Role WHERE role_id = ?',
      [role_id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM Role');
    return rows;
  }

  static async update(role_id, { role_name }) {
    const [result] = await pool.query(
      'UPDATE Role SET role_name = ?, ngay_cap_nhat = NOW() WHERE role_id = ?',
      [role_name, role_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Role not found');
    }
    return await this.findById(role_id);
  }

  static async delete(role_id) {
    const [result] = await pool.query(
      'DELETE FROM Role WHERE role_id = ?',
      [role_id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Role not found');
    }
    return { role_id };
  }
}

module.exports = RoleModel;