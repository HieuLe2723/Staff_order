// controllers/admin/dashboardAdminController.js
const BaoCaoDoanhThuModel = require('../../models/baoCaoDoanhThu.model');
const dashboardService = require('../../services/dashboardService');

exports.getDashboard = async (req, res) => {
  try {
    const recentReports = await BaoCaoDoanhThuModel.getRecentRevenue(7); // bạn đã tạo model rồi
    const stats = await dashboardService.getQuickStats();                // tổng đơn, doanh thu, v.v.
    res.render('dashboard', {
      recentReports,
      stats
    });
  } catch (err) {
    console.error('Lỗi khi tải dashboard:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};