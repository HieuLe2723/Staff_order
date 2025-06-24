// src/services/chiTietDonHang.service.js
const ChiTietDonHangModel = require('../models/chiTietDonHang.model');
const MonAnModel = require('../models/monAn.model'); // Giả sử model MonAn đã được tạo
const DonHangModel = require('../models/donHang.model');
const pool = require('../config/db.config'); // Giả sử đã cấu hình kết nối database

class ChiTietDonHangService {
  static async createChiTietDonHang({ donhang_id, monan_id, so_luong, ghi_chu }) {
    // Kiểm tra món ăn có bị khóa không
    const monAn = await MonAnModel.findById(monan_id);
    if (!monAn) {
      throw new Error('Món ăn không tồn tại.');
    }
    if (monAn.khoa) {
      throw new Error('Món ăn này hiện đang bị khóa do thiếu nguyên liệu');
    }

    // TODO: Implement ingredient check logic when ingredient models are available.
    // The following code is commented out because MonAnNguyenLieuModel and NguyenLieuModel do not exist yet.
    /*
    const nguyenLieu = await MonAnNguyenLieuModel.findByMonAnId(monan_id);
    for (const nl of nguyenLieu) {
      const nguyenLieuData = await NguyenLieuModel.findById(nl.nguyenlieu_id);
      if (nguyenLieuData.so_luong_con_lai < nl.so_luong_can * so_luong) {
        throw new Error(`Nguyên liệu ${nguyenLieuData.ten_nguyenlieu} không đủ`);
      }
    }
    */

    return await ChiTietDonHangModel.create({ donhang_id, monan_id, so_luong, ghi_chu });
  }

  static async getChiTietDonHangById(chitiet_id) {
    return await ChiTietDonHangModel.findById(chitiet_id);
  }

    static async getChiTietDonHangBySessionId(sessionId) {
    const query = `
      SELECT 
        ctdh.chitiet_id,
        ctdh.donhang_id,
        COALESCE(ctdh.so_luong, 0) AS so_luong,
        COALESCE(ctdh.so_luong_da_ra, 0) AS so_luong_da_ra,
        ctdh.ghi_chu,
        ctdh.trang_thai_phuc_vu as trang_thai,
        ctdh.monan_id,
        COALESCE(ma.ten_mon, 'Món đã bị xóa') AS ten_mon,
        ma.gia,
        nv.ho_ten,
        nv.nhanvien_id,
        dh.ngay_tao as thoi_gian_tao_don_hang
      FROM ChiTietDonHang AS ctdh
      JOIN DonHang AS dh ON ctdh.donhang_id = dh.donhang_id
      LEFT JOIN MonAn AS ma ON ctdh.monan_id = ma.monan_id
      LEFT JOIN PhienSuDungBan AS psdb ON dh.phien_id = psdb.phien_id
      LEFT JOIN NhanVien AS nv ON psdb.nhanvien_id = nv.nhanvien_id
      WHERE dh.phien_id = ?
      ORDER BY dh.ngay_tao ASC, ctdh.chitiet_id ASC;
    `;
    const [rows] = await pool.query(query, [sessionId]);
    // Transform data to match frontend's expected nested structure
    return rows.map(row => ({
      chi_tiet_id: row.chitiet_id,
      donhang_id: row.donhang_id,
      so_luong: row.so_luong,
      so_luong_da_ra: row.so_luong_da_ra,
      ghi_chu: row.ghi_chu,
      trang_thai: row.trang_thai,
      ho_ten: row.ho_ten,
      nhanvien_id: row.nhanvien_id,
      thoi_gian_tao_don_hang: row.thoi_gian_tao_don_hang,
      mon_an: {
        monan_id: row.monan_id,
        ten_mon: row.ten_mon,
        gia: row.gia
      }
    }));
  }

  static async updateChiTietDonHang(chitiet_id, { donhang_id, monan_id, so_luong, ghi_chu, thoi_gian_phuc_vu, trang_thai_phuc_vu }) {
    return await ChiTietDonHangModel.update(chitiet_id, {
      donhang_id,
      monan_id,
      so_luong,
      ghi_chu,
      thoi_gian_phuc_vu,
      trang_thai_phuc_vu,
    });
  }



  // Ra món
  static async serveDish(chitiet_id) {
    const item = await ChiTietDonHangModel.findById(chitiet_id);
    if (!item) {
      throw new Error('Không tìm thấy chi tiết đơn hàng.');
    }
    if (item.trang_thai_phuc_vu !== 'ChoNau') {
      throw new Error(`Không thể phục vụ món ăn ở trạng thái '${item.trang_thai_phuc_vu}'.`);
    }
    return await ChiTietDonHangModel.update(chitiet_id, {
      trang_thai_phuc_vu: 'DaPhucVu',
      thoi_gian_phuc_vu: new Date(),
    });
  }

  // Cập nhật trạng thái phục vụ cho nhiều món
  static async serveDishesBulk(item_ids) {
    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      throw new Error('Danh sách món ăn không hợp lệ.');
    }

    const results = [];
    const errors = [];

    for (const id of item_ids) {
      try {
        const updatedItem = await this.serveDish(id); // Tái sử dụng logic của serveDish
        results.push(updatedItem);
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    if (errors.length > 0) {
      // Nếu có lỗi, có thể quyết định ném ra lỗi chung hoặc trả về kết quả chi tiết
      throw new Error(`Cập nhật thất bại cho một số món: ${JSON.stringify(errors)}`);
    }

    return results;
  }

  // Hủy món
  static async cancelDish(chitiet_id) {
    const item = await ChiTietDonHangModel.findById(chitiet_id);
    if (!item) {
      throw new Error('Không tìm thấy chi tiết đơn hàng.');
    }

    // Chỉ cho phép hủy món khi đang ở trạng thái 'ChoNau'
    if (item.trang_thai_phuc_vu !== 'ChoNau') {
      throw new Error(`Không thể hủy món ăn ở trạng thái '${item.trang_thai_phuc_vu}'.`);
    }

    return await ChiTietDonHangModel.update(chitiet_id, {
      trang_thai_phuc_vu: 'DaHuy',
    });
  }

  static async updateSoLuongDaRa(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Dữ liệu không hợp lệ.');
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        for (const item of items) {
            const { chi_tiet_id, so_luong_ra } = item;

            if (!chi_tiet_id || !so_luong_ra || so_luong_ra <= 0) {
                continue; // Bỏ qua các mục không hợp lệ
            }
            
            // Lấy chi tiết đơn hàng hiện tại và khóa dòng để cập nhật
            const [rows] = await connection.query('SELECT * FROM ChiTietDonHang WHERE chitiet_id = ? FOR UPDATE', [chi_tiet_id]);
            const chiTiet = rows[0];

            if (!chiTiet) {
                throw new Error(`Không tìm thấy chi tiết đơn hàng với ID ${chi_tiet_id}.`);
            }
            
            const soLuongMoiDaRa = (chiTiet.so_luong_da_ra || 0) + so_luong_ra;
            if (soLuongMoiDaRa > chiTiet.so_luong) {
                throw new Error(`Số lượng ra món của món ăn có ID ${chi_tiet_id} vượt quá số lượng còn lại.`);
            }

            let newTrangThai = chiTiet.trang_thai_phuc_vu;
            if (soLuongMoiDaRa >= chiTiet.so_luong) {
                newTrangThai = 'DaPhucVu'; // Sử dụng trạng thái đã có
            } else {
                newTrangThai = 'DangPhucVu'; // Trạng thái mới cho ra món một phần
            }

            // Cập nhật chi tiết đơn hàng
            await connection.query(
                'UPDATE ChiTietDonHang SET so_luong_da_ra = ?, trang_thai_phuc_vu = ? WHERE chitiet_id = ?',
                [soLuongMoiDaRa, newTrangThai, chi_tiet_id]
            );
        }

        await connection.commit();
        return { message: 'Cập nhật số lượng ra món thành công.' };
    } catch (error) {
        await connection.rollback();
        // Ném lỗi để controller có thể bắt và xử lý
        throw new Error(error.message || 'Không thể cập nhật số lượng ra món.');
    } finally {
        connection.release(); // Trả connection về pool
    }
  }
}

module.exports = ChiTietDonHangService;