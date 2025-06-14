const pool = require('../config/db.config');

class KhuVucModel {
  static async create({ ten_khuvuc, so_ban }) {
    try {
      if (!ten_khuvuc || typeof ten_khuvuc !== 'string' || ten_khuvuc.length > 100) {
        throw new Error('ten_khuvuc is required and must be a string with max length 100');
      }
      if (!Number.isInteger(so_ban) || so_ban < 0) {
        throw new Error('soban must be a non-negative integer');
      }
      const [result] = await pool.query(
        'INSERT INTO KhuVuc (ten_khuvuc, so_ban) VALUES (?, ?)',
        [ten_khuvuc, so_ban]
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to create zone');
      }
      return { khuvuc_id: result.insertId, ten_khuvuc, so_ban };
    } catch (error) {
      throw new Error(`Failed to create zone: ${error.message}`);
    }
  }

  static async findById(khuvuc_id) {
    try {
      if (!Number.isInteger(Number(khuvuc_id))) {
        throw new Error('khuvuc_id must be an integer');
      }
      const [rows] = await pool.query(
        'SELECT * FROM KhuVuc WHERE khuvuc_id = ?',
        [khuvuc_id]
      );
      if (!rows[0]) {
        throw new Error('Zone not found');
      }
      return rows[0];
    } catch (error) {
      throw new Error(`Failed to find zone: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.query(
        'SELECT khuvuc_id, ten_khuvuc, so_ban FROM KhuVuc'
      );
      console.log('Fetched KhuVuc data from DB:', rows); // Log dữ liệu từ DB
      return rows.map(khuVuc => ({
        khuvuc_id: khuVuc.khuvuc_id,
        ten_khuvuc: khuVuc.ten_khuvuc,
        so_ban: khuVuc.so_ban || 0
      }));
    } catch (error) {
      throw new Error(`Failed to fetch zones: ${error.message}`);
    }
  }

  static async update(khuvuc_id, { ten_khuvuc, so_ban }) {
    try {
      if (!Number.isInteger(Number(khuvuc_id))) {
        throw new Error('khuvuc_id must be an integer');
      }
      if (!ten_khuvuc || typeof ten_khuvuc !== 'string' || ten_khuvuc.length > 100) {
        throw new Error('ten_khuvuc is required and must be a string with max length 100');
      }
      if (!Number.isInteger(so_ban) || so_ban < 0) {
        throw new Error('so_ban must be a non-negative integer');
      }
      const [result] = await pool.query(
        'UPDATE KhuVuc SET ten_khuvuc = ?, so_ban = ? WHERE khuvuc_id = ?',
        [ten_khuvuc, so_ban, khuvuc_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Zone not found');
      }
      return { khuvuc_id, ten_khuvuc, so_ban };
    } catch (error) {
      throw new Error(`Failed to update zone: ${error.message}`);
    }
  }

  static async delete(khuvuc_id) {
    try {
      if (!Number.isInteger(Number(khuvuc_id))) {
        throw new Error('khuvuc_id must be an integer');
      }
      const [result] = await pool.query(
        'DELETE FROM KhuVuc WHERE khuvuc_id = ?',
        [khuvuc_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Zone not found');
      }
      return { khuvuc_id };
    } catch (error) {
      throw new Error(`Failed to delete zone: ${error.message}`);
    }
  }
}

module.exports = KhuVucModel;