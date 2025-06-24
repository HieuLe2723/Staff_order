const ThanhToanModel = require('../models/thanhToan.model');
const PhienSuDungBanModel = require('../models/phienSuDungBan.model');
const DatBanModel = require('../models/datBan.model');
const KhuyenMaiModel = require('../models/khuyenMai.model');
const BaoCaoDoanhThuModel = require('../models/baoCaoDoanhThu.model');
const PhienSuDungBanService = require('./phienSuDungBan.service');
const DateUtils = require('../utils/date');
const crypto = require('crypto');
const vnpayConfig = require('../config/vnpay.config');

class ThanhToanService {
  static async createThanhToan({ phien_id, so_tien, khuyenmai_id, phuong_thuc, ma_giao_dich, ma_phan_hoi, trang_thai = 'ChoXuLy', la_giao_dich_demo = 0 }) {
    if (!phien_id || so_tien === undefined || !phuong_thuc) {
      throw new Error('Thiếu các trường bắt buộc: phien_id, so_tien, phuong_thuc');
    }

    const phien = await PhienSuDungBanModel.findById(phien_id);
    if (!phien) {
      throw new Error('Không tìm thấy phiên sử dụng bàn');
    }

    let tien_coc = 0;
    if (phien.datban_id) {
      const datBan = await DatBanModel.findById(phien.datban_id);
      if (datBan && datBan.so_tien_coc > 0) {
        tien_coc = parseFloat(datBan.so_tien_coc);
      }
    }

    const so_tien_thuc_thu = Math.max(0, parseFloat(so_tien) - tien_coc);

    if (khuyenmai_id) {
      const khuyenMai = await KhuyenMaiModel.findById(khuyenmai_id);
      if (!khuyenMai || new Date(khuyenMai.ngay_ket_thuc) < new Date()) {
        throw new Error('Khuyến mãi không hợp lệ hoặc đã hết hạn');
      }
    }

    if (!['TienMat', 'VNPay', 'Momo', 'ZaloPay'].includes(phuong_thuc)) {
      throw new Error('Phương thức thanh toán không hợp lệ');
    }

    const payment = await ThanhToanModel.create({
      phien_id,
      so_tien: so_tien_thuc_thu,
      khuyenmai_id,
      phuong_thuc,
      ma_giao_dich,
      ma_phan_hoi,
      trang_thai,
      la_giao_dich_demo
    });

    if (trang_thai === 'HoanTat') {
      await this.updateRevenueReport(so_tien_thuc_thu);
      await PhienSuDungBanService.closePhien(phien_id); // Đóng phiên ngay khi thanh toán tiền mặt hoàn tất
    }

    return payment;
  }

  static async getThanhToanById(thanhtoan_id) {
    const thanhToan = await ThanhToanModel.findById(thanhtoan_id);
    if (!thanhToan) {
      throw new Error('Không tìm thấy thanh toán');
    }
    return thanhToan;
  }

  static async updateThanhToan(thanhtoan_id, updateData) {
    await this.getThanhToanById(thanhtoan_id); // Check if payment exists
    return await ThanhToanModel.update(thanhtoan_id, updateData);
  }

  static async updateThanhToanStatus(thanhtoan_id, status, phuong_thuc) {
    const validStatuses = ['DaTao', 'ChoThanhToan', 'HoanTat', 'ThatBai', 'DaHuy'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    const thanhToan = await this.getThanhToanById(thanhtoan_id);
    const old_status = thanhToan.trang_thai;

    const dataToUpdate = {};
    if (status) dataToUpdate.trang_thai = status;
    if (phuong_thuc) dataToUpdate.phuong_thuc = phuong_thuc;

    if (Object.keys(dataToUpdate).length === 0) {
      return thanhToan; // Không có gì để cập nhật
    }

    const updatedPayment = await ThanhToanModel.update(thanhtoan_id, dataToUpdate);

    // Khi thanh toán hoàn tất, thực hiện các tác vụ liên quan
    if (old_status !== 'HoanTat' && status === 'HoanTat') {
      // 1. Cập nhật báo cáo doanh thu
      await this.updateRevenueReport(parseFloat(thanhToan.so_tien));
      
      // 2. Đóng phiên sử dụng bàn tương ứng
      await PhienSuDungBanService.closePhien(thanhToan.phien_id);
    }

    return updatedPayment;
  }

  static async deleteThanhToan(thanhtoan_id) {
    await this.getThanhToanById(thanhtoan_id); // Check if payment exists
    return await ThanhToanModel.delete(thanhtoan_id);
  }

  static async updateRevenueReport(amount) {
    const today = DateUtils.formatDate(new Date(), 'YYYY-MM-DD');
    let baoCao = await BaoCaoDoanhThuModel.findByDate(today);

    if (!baoCao) {
      await BaoCaoDoanhThuModel.create({
        ngay_bao_cao: today,
        loai_bao_cao: 'Ngay',
        tong_doanh_thu: amount,
        tong_don_hang: 1, // Note: This might need adjustment, represents payments now
      });
    } else {
      await BaoCaoDoanhThuModel.update(baoCao.baocao_id, {
        tong_doanh_thu: (parseFloat(baoCao.tong_doanh_thu) || 0) + amount,
        tong_don_hang: (parseInt(baoCao.tong_don_hang) || 0) + 1,
      });
    }
  }

  static async createVnPayUrlForSession(phien_id, ipAddr) {
    // 1. Tính toán hóa đơn
    const bill = await PhienSuDungBanService.calculateBill(phien_id);
    const amount = bill.tong_tien_thanh_toan;

    if (amount <= 0) {
      throw new Error('Không có gì để thanh toán.');
    }

    // 2. Lấy thông tin cấu hình VNPay
    const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = vnpayConfig;

    // 3. Tạo mã giao dịch duy nhất và các thông tin cần thiết
    const date = new new Date();
    const createDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    const txnRef = `${phien_id}-${createDate}`;

    // 4. Tạo một bản ghi thanh toán đang chờ xử lý
    await this.createThanhToan({
      phien_id,
      so_tien: amount,
      khuyenmai_id: bill.promotion ? bill.promotion.khuyenmai_id : null,
      phuong_thuc: 'VNPay',
      ma_giao_dich: txnRef,
      trang_thai: 'ChoXuLy',
    });

    // 5. Chuẩn bị các tham số cho VNPay
    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan hoa don cho phien ${phien_id}`,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount * 100, // VNPay yêu cầu đơn vị là đồng
      vnp_ReturnUrl: vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // 6. Sắp xếp và tạo chữ ký
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => { sortedParams[key] = vnp_Params[key]; });

    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    sortedParams['vnp_SecureHash'] = vnp_SecureHash;

    // 7. Tạo URL thanh toán cuối cùng
    const paymentUrl = `${vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;

    return { paymentUrl };
  }

  static async handleVnPayReturn(vnp_Params) {
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa hash và hash type khỏi params để xác thực
    const paramsForSign = { ...vnp_Params };
    delete paramsForSign['vnp_SecureHash'];
    delete paramsForSign['vnp_SecureHashType'];

    // Sắp xếp và tạo chuỗi để ký
    const sortedKeys = Object.keys(paramsForSign).sort();
    const sortedParams = {};
    sortedKeys.forEach(key => { sortedParams[key] = paramsForSign[key]; });
    const signData = new URLSearchParams(sortedParams).toString();

    // Tạo chữ ký dự kiến
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // 1. Xác thực chữ ký
    if (secureHash !== expectedHash) {
      throw new Error('Chữ ký không hợp lệ');
    }

    const txnRef = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const amountFromVnpay = parseInt(vnp_Params['vnp_Amount']) / 100;

    // 2. Tìm thanh toán trong DB
    const payment = await ThanhToanModel.findByTxnRef(txnRef);
    if (!payment) {
      throw new Error('Không tìm thấy giao dịch');
    }

    // 3. Kiểm tra trạng thái và số tiền
    if (payment.trang_thai !== 'ChoXuLy') {
      // Nếu đã xử lý rồi thì trả về kết quả luôn, tránh xử lý lại
      return { code: '00', message: 'Giao dịch đã được xử lý trước đó.' };
    }

    if (payment.so_tien != amountFromVnpay) {
        await this.updateThanhToanStatus(payment.thanhtoan_id, 'ThatBai');
        throw new Error('Số tiền không khớp');
    }

    // 4. Cập nhật trạng thái thanh toán
    if (responseCode === '00') {
      await this.updateThanhToanStatus(payment.thanhtoan_id, 'HoanTat');
      return { code: '00', message: 'Thanh toán thành công' };
    } else {
      await this.updateThanhToanStatus(payment.thanhtoan_id, 'ThatBai');
      return { code: responseCode, message: 'Thanh toán thất bại' };
    }
  }
}

module.exports = ThanhToanService;