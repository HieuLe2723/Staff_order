const MonAnModel = require('../models/monAn.model');

class MonAnService {
  static async getMonAnByLoaiId(loai_id) {
    if (!Number.isInteger(Number(loai_id)) || loai_id <= 0) {
      throw new Error('ID loại món ăn không hợp lệ');
    }
    return await MonAnModel.findByLoaiId(loai_id);
  }
  static async createMonAn({ ten_mon, loai_id, gia, hinh_anh = 'default_dish.jpg' }) {
    // Input validation - these should match the Joi schema but provide extra safety
    if (!ten_mon || typeof ten_mon !== 'string' || ten_mon.trim() === '') {
      throw new Error('Tên món ăn là bắt buộc');
    }
    if (ten_mon.length > 100) {
      throw new Error('Tên món ăn không được vượt quá 100 ký tự');
    }
    if (!Number.isInteger(Number(loai_id)) || loai_id <= 0) {
      throw new Error('ID loại món ăn không hợp lệ');
    }
    if (isNaN(Number(gia)) || Number(gia) <= 0) {
      throw new Error('Giá tiền phải là số dương');
    }
    
    // Handle optional image
    const imagePath = hinh_anh && typeof hinh_anh === 'string' && hinh_anh.trim() !== '' 
      ? hinh_anh.trim() 
      : 'default_dish.jpg';
      
    if (imagePath.length > 255) {
      throw new Error('Đường dẫn hình ảnh không được vượt quá 255 ký tự');
    }

    try {
      return await MonAnModel.create({ 
        ten_mon: ten_mon.trim(), 
        loai_id: Number(loai_id), 
        gia: Number(gia), 
        hinh_anh: hinh_anh.trim() 
      });
    } catch (error) {
      throw new Error(`Lỗi khi tạo món ăn: ${error.message}`);
    }
  }

  static async getMonAnById(monan_id) {
    if (!Number.isInteger(Number(monan_id)) || monan_id <= 0) {
      throw new Error('ID món ăn không hợp lệ');
    }

    try {
      const monAn = await MonAnModel.findById(monan_id);
      if (!monAn) {
        throw new Error('Không tìm thấy món ăn');
      }
      return monAn;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin món ăn: ${error.message}`);
    }
  }

  static async updateMonAn(monan_id, { ten_mon, loai_id, gia, hinh_anh, khoa }) {
    if (!Number.isInteger(Number(monan_id)) || monan_id <= 0) {
      throw new Error('ID món ăn không hợp lệ');
    }

    const updates = {};
    if (ten_mon !== undefined) {
      if (typeof ten_mon !== 'string' || ten_mon.trim() === '') {
        throw new Error('Tên món ăn không hợp lệ');
      }
      updates.ten_mon = ten_mon.trim();
    }
    
    if (loai_id !== undefined) {
      if (!Number.isInteger(Number(loai_id)) || loai_id <= 0) {
        throw new Error('ID loại món ăn không hợp lệ');
      }
      updates.loai_id = Number(loai_id);
    }
    
    if (gia !== undefined) {
      if (isNaN(Number(gia)) || Number(gia) < 0) {
        throw new Error('Giá tiền không hợp lệ');
      }
      updates.gia = Number(gia);
    }
    
    if (hinh_anh !== undefined) {
      if (typeof hinh_anh !== 'string' || hinh_anh.trim() === '') {
        throw new Error('Đường dẫn hình ảnh không hợp lệ');
      }
      updates.hinh_anh = hinh_anh.trim();
    }
    
    if (khoa !== undefined) {
      updates.khoa = khoa ? 1 : 0;
      if (khoa) {
        updates.ngay_khoa = new Date();
      } else {
        updates.ngay_khoa = null;
      }
    }

    try {
      return await MonAnModel.update(monan_id, updates);
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật món ăn: ${error.message}`);
    }
  }

  static async deleteMonAn(monan_id) {
    if (!Number.isInteger(Number(monan_id)) || monan_id <= 0) {
      throw new Error('ID món ăn không hợp lệ');
    }

    try {
      return await MonAnModel.delete(monan_id);
    } catch (error) {
      throw new Error(`Lỗi khi xóa món ăn: ${error.message}`);
    }
  }
}

module.exports = MonAnService;