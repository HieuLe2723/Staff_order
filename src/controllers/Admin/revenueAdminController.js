const pool = require('../../config/db.config');

exports.getRevenueReport = (req, res) => {
  const { filter = 'all' } = req.query;
  let query = 'SELECT loai_bao_cao, ngay_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang FROM BaoCaoDoanhThu';
  let params = [];

  if (filter !== 'all') {
    query += ' WHERE loai_bao_cao = ?';
    params.push(filter.charAt(0).toUpperCase() + filter.slice(1));
  }

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn báo cáo doanh thu:', err);
      return res.status(500).render('error', { message: 'Lỗi server', path: req.path });
    }
    const reports = {};
    results.forEach(report => {
      const key =
        report.loai_bao_cao === 'Ngay' ? report.ngay_bao_cao :
        report.loai_bao_cao === 'Thang' ? `Tháng ${report.thang}/${report.nam}` :
        report.loai_bao_cao === 'Quy' ? `Quý ${report.quy}/${report.nam}` :
        `Năm ${report.nam}`;
      reports[key] = { ...report, key };
    });
    res.render('revenue', { reports, path: req.path });
  });
};