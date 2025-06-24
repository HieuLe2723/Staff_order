// src/services/baoCaoDoanhThu.service.js
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');
const pool = require('../config/db.config');
const DateUtils = require('../utils/date');

class BaoCaoDoanhThuService {
  static async createBaoCao({ ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang }) {
    // Kiểm tra logic báo cáo
    if (loai_bao_cao === 'Ngay' && !ngay_bao_cao) {
      throw new Error('Báo cáo ngày yêu cầu ngày báo cáo');
    }
    if (loai_bao_cao === 'Thang' && (!thang || !nam)) {
      throw new Error('Báo cáo tháng yêu cầu tháng và năm');
    }
    if (loai_bao_cao === 'Quy' && (!quy || !nam)) {
      throw new Error('Báo cáo quý yêu cầu quý và năm');
    }
    if (loai_bao_cao === 'Nam' && !nam) {
      throw new Error('Báo cáo năm yêu cầu năm');
    }

    return await BaoCaoDoanhThuModel.create({
      ngay_bao_cao,
      loai_bao_cao,
      thang,
      quy,
      nam,
      tong_doanh_thu,
      tong_don_hang,
    });
  }

  static async getBaoCaoById(baocao_id) {
    return await BaoCaoDoanhThuModel.findById(baocao_id);
  }

  static async getAllBaoCao({ loai_bao_cao, thang, quy, nam, ngay_bao_cao }) {
    return await BaoCaoDoanhThuModel.findAll({ loai_bao_cao, thang, quy, nam, ngay_bao_cao });
  }

  static async deleteBaoCao(baocao_id) {
    // Kiểm tra xem báo cáo có chi tiết món ăn không
    const chiTiet = await BaoCaoChiTietMonAnModel.findAll({ baocao_id });
    if (chiTiet.length > 0) {
      throw new Error('Không thể xóa báo cáo có chi tiết món ăn liên quan');
    }
    return await BaoCaoDoanhThuModel.delete(baocao_id);
  }

  static async getSummary() {
    try {
      const today = DateUtils.formatDate(new Date(), 'YYYY-MM-DD');
      const firstDayOfMonth = DateUtils.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'YYYY-MM-DD');
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      
      console.log(`Fetching summary for date: ${today}, month: ${currentMonth}, year: ${currentYear}`);
      
      // Get today's revenue from BaoCaoDoanhThu
      const [todayReport] = await pool.query(
        `SELECT tong_doanh_thu as revenue, tong_don_hang as order_count
         FROM BaoCaoDoanhThu 
         WHERE loai_bao_cao = 'Ngay' 
           AND ngay_bao_cao = ?
         ORDER BY ngay_tao DESC
         LIMIT 1`,
        [today]
      );

      // Get monthly report
      const [monthlyReport] = await pool.query(
        `SELECT SUM(tong_doanh_thu) as total_revenue, 
                SUM(tong_don_hang) as total_orders
         FROM BaoCaoDoanhThu 
         WHERE loai_bao_cao = 'Ngay' 
           AND YEAR(ngay_bao_cao) = ? 
           AND MONTH(ngay_bao_cao) = ?`,
        [currentYear, currentMonth]
      );

      // Get table status summary
      const [tableSummary] = await pool.query(
        `SELECT trang_thai, COUNT(*) as count
         FROM BanNhaHang
         GROUP BY trang_thai`
      );
      
      // Count active tables (in use)
      const [activeTables] = await pool.query(
        `SELECT COUNT(*) as total 
         FROM BanNhaHang 
         WHERE trang_thai = 'DangSuDung'`
      );
      
      // Count total tables
      const [totalTables] = await pool.query(
        `SELECT COUNT(*) as total FROM BanNhaHang`
      );
      
      console.log(`Tổng số bàn: ${totalTables[0].total}, Số bàn đang sử dụng: ${activeTables[0].total}`);

      // Calculate today's values
      const todayRevenue = todayReport[0]?.revenue || 0;
      const todayOrders = todayReport[0]?.order_count || 0;
      const monthRevenue = monthlyReport[0]?.total_revenue || 0;
      const monthOrders = monthlyReport[0]?.total_orders || 0;

      const result = {
        todayRevenue: parseFloat(todayRevenue),
        monthRevenue: parseFloat(monthRevenue),
        todayOrders: parseInt(todayOrders),
        monthOrders: parseInt(monthOrders),
        activeTables: parseInt(activeTables[0]?.total) || 0,
        // Add debug info
        _debug: {
          tableSummary: tableSummary,
          queryDate: today,
          currentMonth: currentMonth,
          currentYear: currentYear
        }
      };

      console.log('Summary result from BaoCaoDoanhThu:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy tổng quan doanh thu:', error);
      // Return default values on error
      return {
        todayRevenue: 0,
        monthRevenue: 0,
        todayOrders: 0,
        activeTables: 0,
        _error: error.message
      };
    }
  }
}

module.exports = BaoCaoDoanhThuService;