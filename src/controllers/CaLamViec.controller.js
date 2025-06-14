const CaLamViecService = require('../services/CaLamViec.service');
const ResponseUtils = require('../utils/response');

class CaLamViecController {
  static async createShift(req, res, next) {
    try {
      const shift = await CaLamViecService.createShift(req.body);
      return res.status(201).json(
        ResponseUtils.success(shift, 'Tạo ca làm việc thành công', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async getShiftById(req, res, next) {
    try {
      const shift = await CaLamViecService.getShiftById(req.params.calamviec_id);
      return res.status(200).json(
        ResponseUtils.success(shift, 'Lấy thông tin ca làm việc thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAllShifts(req, res, next) {
    try {
      const shifts = await CaLamViecService.getAllShifts();
      return res.status(200).json(
        ResponseUtils.success(shifts, 'Lấy danh sách ca làm việc thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateShift(req, res, next) {
    try {
      const shift = await CaLamViecService.updateShift(req.params.calamviec_id, req.body);
      return res.status(200).json(
        ResponseUtils.success(shift, 'Cập nhật ca làm việc thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async deleteShift(req, res, next) {
    try {
      await CaLamViecService.deleteShift(req.params.calamviec_id);
      return res.status(200).json(
        ResponseUtils.success(null, 'Xóa ca làm việc thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async assignShift(req, res, next) {
    try {
      const shiftAssignment = await CaLamViecService.assignShift(req.body);
      return res.status(201).json(
        ResponseUtils.success(shiftAssignment, 'Phân ca thành công', 201)
      );
    } catch (err) {
      next(err);
    }
  }

  static async checkIn(req, res, next) {
    try {
      const result = await CaLamViecService.checkIn(req.params.phanca_id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Check-in thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async checkOut(req, res, next) {
    try {
      const result = await CaLamViecService.checkOut(req.params.phanca_id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Check-out thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeShifts(req, res, next) {
    try {
      const { nhanvien_id, startDate, endDate } = req.query;
      const shifts = await CaLamViecService.getEmployeeShifts(nhanvien_id, startDate, endDate);
      return res.status(200).json(
        ResponseUtils.success(shifts, 'Lấy lịch sử phân ca thành công')
      );
    } catch (err) {
      next(err);
    }
  }
  static async getAllEmployees(req, res, next) {
  try {
    const employees = await CaLamViecService.getAllEmployees();
    return res.status(200).json(
      ResponseUtils.success(employees, 'Lấy danh sách nhân viên thành công')
    );
  } catch (err) {
    next(err);
  }
}

  static async getSalaryByEmployee(req, res, next) {
    try {
      const { nhanvien_id, thang, nam } = req.query;
      const salaries = await CaLamViecService.getSalaryByEmployee(nhanvien_id, thang, nam);
      return res.status(200).json(
        ResponseUtils.success(salaries, 'Lấy thông tin lương thành công')
      );
    } catch (err) {
      next(err);
    }
  }

  static async markSalaryPaid(req, res, next) {
    try {
      const result = await CaLamViecService.markSalaryPaid(req.params.luong_id);
      return res.status(200).json(
        ResponseUtils.success(result, 'Cập nhật trạng thái lương thành công')
      );
    } catch (err) {
      next(err);
    }
  }
  static async editShiftAssignment(req, res, next) {
  try {
    const { phanca_id } = req.params;
    const data = req.body; // e.g., { nhanvien_id, calamviec_id, ngay_lam, ghi_chu }
    // Implement update logic in CaLamViecModel
    const updated = await CaLamViecModel.updateShiftAssignment(phanca_id, data);
    return res.status(200).json(
      ResponseUtils.success(updated, 'Cập nhật phân ca thành công')
    );
  } catch (err) {
    next(err);
  }
}

static async deleteShiftAssignment(req, res, next) {
  try {
    const { phanca_id } = req.params;
    await CaLamViecModel.deleteShiftAssignment(phanca_id);
    return res.status(200).json(
      ResponseUtils.success(null, 'Xóa phân ca thành công')
    );
  } catch (err) {
    next(err);
  }
}
}

module.exports = CaLamViecController;