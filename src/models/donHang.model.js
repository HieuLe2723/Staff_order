const pool = require('../config/db.config');

class DonHangModel {
  static async findAll({ phien_id } = {}) {
    let query = 'SELECT * FROM DonHang';
    const params = [];
    if (phien_id) {
      query += ' WHERE phien_id = ?';
      params.push(phien_id);
    }
    const [rows] = await require('../config/db.config').query(query, params);
    return rows;
  }

  static async create({ phien_id, khuyenmai_id, loai_menu, hanh_dong, mo_ta_hanh_dong, so_nguoi_lon, so_tre_em_co_phi, so_tre_em_khong_phi }) {
    try {
      const validActions = ['ThemMon', 'XoaMon', 'HuyMon', 'HoanTat', null];
      const [phien] = await pool.query('SELECT 1 FROM PhienSuDungBan WHERE phien_id = ?', [phien_id]);
      if (!phien[0]) throw new Error('Không tìm thấy phiên sử dụng bàn với phien_id cung cấp');
      if (khuyenmai_id) {
        const [khuyenMai] = await pool.query('SELECT 1 FROM KhuyenMai WHERE khuyenmai_id = ?', [khuyenmai_id]);
        if (!khuyenMai[0]) throw new Error('Không tìm thấy khuyến mãi với khuyenmai_id cung cấp');
      }
      if (hanh_dong && !validActions.includes(hanh_dong)) {
        throw new Error('Giá trị hanh_dong không hợp lệ. Chỉ chấp nhận: ThemMon, XoaMon, HuyMon, HoanTat');
      }

      const [result] = await pool.query(
        'INSERT INTO DonHang (phien_id, loai_menu, khuyenmai_id, hanh_dong, mo_ta_hanh_dong, so_nguoi_lon, so_tre_em_co_phi, so_tre_em_khong_phi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [phien_id, loai_menu || 'Alacarte', khuyenmai_id || null, hanh_dong || null, mo_ta_hanh_dong || null, so_nguoi_lon || 0, so_tre_em_co_phi || 0, so_tre_em_khong_phi || 0]
      );
      return { donhang_id: result.insertId, phien_id, loai_menu, khuyenmai_id, gia_tri_giam: 0, tong_tien: 0, trang_thai: 'ChoXuLy', ngay_tao: new Date(), hanh_dong, mo_ta_hanh_dong, so_nguoi_lon, so_tre_em_co_phi, so_tre_em_khong_phi };
    } catch (error) {
      throw error;
    }
  }

  static async findById(donhang_id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM DonHang WHERE donhang_id = ?',
        [donhang_id]
      );
      if (!rows[0]) {
        const err = new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
        err.statusCode = 404;
        throw err;
      }
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(donhang_id, updateData) {
    try {
      const { phien_id, loai_menu, khuyenmai_id, gia_tri_giam, tong_tien, trang_thai, hanh_dong, mo_ta_hanh_dong } = updateData;

      const fields = [];
      const params = [];

      if (phien_id !== undefined) { fields.push('phien_id = ?'); params.push(phien_id); }
      if (loai_menu !== undefined) { fields.push('loai_menu = ?'); params.push(loai_menu); }
      if (khuyenmai_id !== undefined) { fields.push('khuyenmai_id = ?'); params.push(khuyenmai_id); }
      if (gia_tri_giam !== undefined) { fields.push('gia_tri_giam = ?'); params.push(gia_tri_giam); }
      if (tong_tien !== undefined) { fields.push('tong_tien = ?'); params.push(tong_tien); }
      if (trang_thai !== undefined) { fields.push('trang_thai = ?'); params.push(trang_thai); }
      if (hanh_dong !== undefined) { 
          fields.push('hanh_dong = ?'); params.push(hanh_dong); 
          fields.push('thoi_gian_hanh_dong = ?'); params.push(new Date());
      }
      if (mo_ta_hanh_dong !== undefined) { fields.push('mo_ta_hanh_dong = ?'); params.push(mo_ta_hanh_dong); }

      if (fields.length === 0) {
        return await this.findById(donhang_id);
      }
      
      params.push(donhang_id);
      const query = `UPDATE DonHang SET ${fields.join(', ')} WHERE donhang_id = ?`;

      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
      }
      return await this.findById(donhang_id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(donhang_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM DonHang WHERE donhang_id = ?',
        [donhang_id]
      );
      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy đơn hàng với donhang_id cung cấp');
      }
      return { donhang_id };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DonHangModel;