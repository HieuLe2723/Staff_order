-- Migration: Thêm bảng LichSuDonHang và trigger trg_ResetTable_AfterDeleteOrder
-- Chạy file này trong phpMyAdmin / MySQL CLI trên WAMP

-- -----------------------------------------------------
-- Table LichSuDonHang
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS LichSuDonHang (
  lichsu_id INT AUTO_INCREMENT PRIMARY KEY,
  donhang_id INT NOT NULL,
  hanh_dong VARCHAR(50) NOT NULL,
  mo_ta TEXT NULL,
  nhanvien_id INT NULL,
  thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lichsu_donhang FOREIGN KEY (donhang_id)
    REFERENCES DonHang(donhang_id) ON DELETE CASCADE,
  CONSTRAINT fk_lichsu_nhanvien FOREIGN KEY (nhanvien_id)
    REFERENCES NhanVien(nhanvien_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Trigger: Reset trạng thái bàn khi xoá đơn cuối cùng của phiên
-- -----------------------------------------------------
DELIMITER //
CREATE TRIGGER trg_ResetTable_AfterDeleteOrder
AFTER DELETE ON DonHang
FOR EACH ROW
BEGIN
  IF (SELECT COUNT(*) FROM DonHang WHERE phien_id = OLD.phien_id) = 0 THEN
    UPDATE BanNhaHang
      SET trang_thai = 'SanSang'
    WHERE ban_id = (
      SELECT ban_id FROM PhienSuDungBan WHERE phien_id = OLD.phien_id
    );
  END IF;
END//
DELIMITER ;
