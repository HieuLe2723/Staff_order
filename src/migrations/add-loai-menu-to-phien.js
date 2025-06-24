// src/migrations/add-loai-menu-to-phien.js
const pool = require('../config/db.config');

async function addLoaiMenuToPhienSuDungBan() {
  try {
    console.log('Bắt đầu thêm cột loai_menu vào bảng PhienSuDungBan...');
    
    // Kiểm tra xem cột đã tồn tại chưa
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'PhienSuDungBan' 
      AND COLUMN_NAME = 'loai_menu'
    `);
    
    if (columns.length === 0) {
      // Nếu cột chưa tồn tại, thêm vào
      await pool.query(`
        ALTER TABLE PhienSuDungBan 
        ADD COLUMN loai_menu VARCHAR(50) DEFAULT 'ALaCarte'
      `);
      console.log('Đã thêm cột loai_menu vào bảng PhienSuDungBan thành công!');
    } else {
      console.log('Cột loai_menu đã tồn tại trong bảng PhienSuDungBan.');
    }
  } catch (error) {
    console.error('Lỗi khi thêm cột loai_menu:', error);
    throw error;
  }
}

// Chạy migration
addLoaiMenuToPhienSuDungBan()
  .then(() => {
    console.log('Migration hoàn tất.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration thất bại:', error);
    process.exit(1);
  });
