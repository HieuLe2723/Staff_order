-- Drop database if it exists
DROP DATABASE IF EXISTS StaffOrder;

-- Create database
CREATE DATABASE StaffOrder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE StaffOrder;

-- 1. Role table
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. NhanVien (Employee) table
CREATE TABLE NhanVien (
    nhanvien_id VARCHAR(10) PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    matkhau_hash VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    role_id INT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    hoat_dong TINYINT(1) DEFAULT 1,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. KhuVuc (Zone) table
CREATE TABLE KhuVuc (
    khuvuc_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_khuvuc VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. BanNhaHang (Table) table
CREATE TABLE BanNhaHang (
    ban_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ban VARCHAR(50) NOT NULL,
    khuvuc_id INT,
    trang_thai VARCHAR(20) DEFAULT 'SanSang', -- SanSang | DangSuDung | DaDat
    qr_code_url VARCHAR(255), -- Added for QR code
    FOREIGN KEY (khuvuc_id) REFERENCES KhuVuc(khuvuc_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. ThongTinKhachHang (Customer Info) table
CREATE TABLE ThongTinKhachHang (
    khachhang_id INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100),
    so_dien_thoai VARCHAR(15),
    email VARCHAR(100),
    quoc_tich VARCHAR(50),
    nhom_tuoi VARCHAR(50), -- TreEm | NguoiLon | NguoiGia
    loai_nhom VARCHAR(50), -- GiaDinh | BanBe | CapDoi
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. DatBan (Reservation) table
CREATE TABLE DatBan (
    datban_id INT AUTO_INCREMENT PRIMARY KEY,
    khachhang_id INT,
    ban_id INT,
    so_khach INT,
    thoi_gian_dat DATETIME NOT NULL,
    ghi_chu VARCHAR(255),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(20) DEFAULT 'ChoXuLy', -- ChoXuLy | DaXacNhan | DaHuy
    FOREIGN KEY (khachhang_id) REFERENCES ThongTinKhachHang(khachhang_id),
    FOREIGN KEY (ban_id) REFERENCES BanNhaHang(ban_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. PhienSuDungBan (Table Session) table
CREATE TABLE PhienSuDungBan (
    phien_id INT AUTO_INCREMENT PRIMARY KEY,
    ban_id INT,
    ban_id_goc INT, -- Original table for merge/split/transfer tracking
    khachhang_id INT,
    nhanvien_id VARCHAR(10),
    so_khach_nguoi_lon INT,
    so_khach_tre_em_co_phi INT,
    so_khach_tre_em_mien_phi INT,
    loai_khach VARCHAR(50),
    thoi_gian_bat_dau DATETIME DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_ket_thuc DATETIME,
    loai_thao_tac VARCHAR(20), -- GopBan | TachBan | ChuyenBan | NULL
    thong_bao_thanh_toan VARCHAR(255), -- Payment notification
    FOREIGN KEY (ban_id) REFERENCES BanNhaHang(ban_id),
    FOREIGN KEY (ban_id_goc) REFERENCES BanNhaHang(ban_id),
    FOREIGN KEY (khachhang_id) REFERENCES ThongTinKhachHang(khachhang_id),
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 8. LoaiMonAn (Dish Category) table
CREATE TABLE LoaiMonAn (
    loai_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_loai VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 9. MonAn (Dish) table
CREATE TABLE MonAn (
    monan_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_mon VARCHAR(100) NOT NULL,
    loai_id INT,
    gia DECIMAL(10,2) NOT NULL,
    khoa TINYINT(1) DEFAULT 0,
    ngay_khoa DATETIME,
    hinh_anh VARCHAR(255),
    FOREIGN KEY (loai_id) REFERENCES LoaiMonAn(loai_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 10. DonHang (Order) table
CREATE TABLE DonHang (
    donhang_id INT AUTO_INCREMENT PRIMARY KEY,
    phien_id INT,
    loai_menu VARCHAR(50),
    khuyenmai_id INT,
    gia_tri_giam DECIMAL(10,2) DEFAULT 0,
    tong_tien DECIMAL(10,2) DEFAULT 0,
    trang_thai VARCHAR(20) DEFAULT 'ChoXuLy', -- ChoXuLy | DangNau | DaPhucVu | DaThanhToan | DaHuy
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    hanh_dong VARCHAR(50), -- ThemMon | XoaMon | HuyMon | HoanTat
    mo_ta_hanh_dong VARCHAR(255),
    thoi_gian_hanh_dong DATETIME,
    FOREIGN KEY (phien_id) REFERENCES PhienSuDungBan(phien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 11. ChiTietDonHang (Order Detail) table
CREATE TABLE ChiTietDonHang (
    chitiet_id INT AUTO_INCREMENT PRIMARY KEY,
    donhang_id INT,
    monan_id INT,
    so_luong INT NOT NULL,
    ghi_chu VARCHAR(255),
    thoi_gian_phuc_vu DATETIME,
    trang_thai_phuc_vu VARCHAR(20) DEFAULT 'ChoNau', -- ChoNau | DangNau | DaPhucVu
    FOREIGN KEY (donhang_id) REFERENCES DonHang(donhang_id),
    FOREIGN KEY (monan_id) REFERENCES MonAn(monan_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 12. KhuyenMai (Promotion) table
CREATE TABLE KhuyenMai (
    khuyenmai_id INT AUTO_INCREMENT PRIMARY KEY,
    ma_code VARCHAR(50) UNIQUE NOT NULL,
    mo_ta VARCHAR(255),
    phan_tram_giam INT,
    ngay_het_han DATE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 13. DanhGia (Evaluation) table
CREATE TABLE DanhGia (
    danhgia_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    khachhang_id INT,
    phien_id INT,
    diem_so INT CHECK (diem_so BETWEEN 1 AND 5),
    binh_luan VARCHAR(255),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id),
    FOREIGN KEY (khachhang_id) REFERENCES ThongTinKhachHang(khachhang_id),
    FOREIGN KEY (phien_id) REFERENCES PhienSuDungBan(phien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 14. NguyenLieu (Raw Material) table
CREATE TABLE NguyenLieu (
    nguyenlieu_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_nguyenlieu VARCHAR(100) NOT NULL,
    don_vi VARCHAR(20),
    so_luong_con_lai DECIMAL(10,2) DEFAULT 0,
    nguong_canh_bao DECIMAL(10,2),
    trang_thai_canh_bao TINYINT(1) DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 15. PhieuNhapHang (Inventory Receipt) table
CREATE TABLE PhieuNhapHang (
    phieunhap_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    ngay_nhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    tong_so_luong DECIMAL(10,2),
    ghi_chu VARCHAR(255),
    trang_thai VARCHAR(20) DEFAULT 'ChoXacNhan', -- ChoXacNhan | DaXacNhan | DaHuy
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 16. ChiTietPhieuNhap (Inventory Receipt Detail) table
CREATE TABLE ChiTietPhieuNhap (
    chitiet_phieunhap_id INT AUTO_INCREMENT PRIMARY KEY,
    phieunhap_id INT,
    nguyenlieu_id INT,
    so_luong DECIMAL(10,2) NOT NULL,
    don_vi VARCHAR(20),
    ghi_chu VARCHAR(255),
    FOREIGN KEY (phieunhap_id) REFERENCES PhieuNhapHang(phieunhap_id),
    FOREIGN KEY (nguyenlieu_id) REFERENCES NguyenLieu(nguyenlieu_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 17. PhieuXuatHang (Inventory Issue) table
CREATE TABLE PhieuXuatHang (
    phieuxuat_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    ngay_xuat DATETIME DEFAULT CURRENT_TIMESTAMP,
    tong_so_luong DECIMAL(10,2),
    ghi_chu VARCHAR(255),
    trang_thai VARCHAR(20) DEFAULT 'ChoXacNhan', -- ChoXacNhan | DaXacNhan | DaHuy
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 18. ChiTietPhieuXuat (Inventory Issue Detail) table
CREATE TABLE ChiTietPhieuXuat (
    chitiet_phieuxuat_id INT AUTO_INCREMENT PRIMARY KEY,
    phieuxuat_id INT,
    nguyenlieu_id INT,
    so_luong DECIMAL(10,2) NOT NULL,
    don_vi VARCHAR(20),
    ghi_chu VARCHAR(255),
    FOREIGN KEY (phieuxuat_id) REFERENCES PhieuXuatHang(phieuxuat_id),
    FOREIGN KEY (nguyenlieu_id) REFERENCES NguyenLieu(nguyenlieu_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 19. ThietBi (Equipment) table
CREATE TABLE ThietBi (
    thietbi_id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100),
    so_luong INT DEFAULT 1,
    trang_thai VARCHAR(50) DEFAULT 'HoatDong' -- HoatDong | DangSuaChua | HuHong
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 20. MonAnNguyenLieu (Dish-Raw Material Link) table
CREATE TABLE MonAnNguyenLieu (
    monan_id INT,
    nguyenlieu_id INT,
    so_luong_can DECIMAL(10,2),
    PRIMARY KEY (monan_id, nguyenlieu_id),
    forEIGN KEY (monan_id) REFERENCES MonAn(monan_id),
    FOREIGN KEY (nguyenlieu_id) REFERENCES NguyenLieu(nguyenlieu_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 21. ThanhToan (Payment) table
CREATE TABLE ThanhToan (
    thanhtoan_id INT AUTO_INCREMENT PRIMARY KEY,
    donhang_id INT,
    so_tien DECIMAL(10,2),
    khuyenmai_id INT,
    phuong_thuc VARCHAR(50), -- TienMat | VNPay | Momo | ZaloPay
    ma_giao_dich VARCHAR(100),
    ma_phan_hoi VARCHAR(10),
    trang_thai VARCHAR(20) DEFAULT 'ChoXuLy', -- ChoXuLy | HoanTat | ThatBai
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    la_giao_dich_demo TINYINT(1) DEFAULT 0, -- 1: Demo, 0: Thực tế
    FOREIGN KEY (donhang_id) REFERENCES DonHang(donhang_id),
    FOREIGN KEY (khuyenmai_id) REFERENCES KhuyenMai(khuyenmai_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 22. LichSuBaoTri (Equipment Maintenance History) table
CREATE TABLE LichSuBaoTri (
    lichsu_id INT AUTO_INCREMENT PRIMARY KEY,
    thietbi_id INT,
    mo_ta VARCHAR(255),
    ngay_bao_tri DATE,
    trang_thai VARCHAR(50), -- DaSua | DangXuLy | KhongSuaDuoc
    FOREIGN KEY (thietbi_id) REFERENCES ThietBi(thietbi_id)
) CHARACTER SET utf Driven by Grok, created by xAI.mb4 COLLATE utf8mb4_unicode_ci;

-- 23. BaoCaoDoanhThu (Revenue Report) table
CREATE TABLE BaoCaoDoanhThu (
    baocao_id INT AUTO_INCREMENT PRIMARY KEY,
    ngay_bao_cao DATE,
    loai_bao_cao VARCHAR(20), -- Ngay | Tuan | Thang | Quy | Nam
    thang INT,
    quy INT,
    nam INT,
    tong_doanh_thu DECIMAL(15,2),
    tong_don_hang INT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 24. BaoCaoChiTietMonAn (Dish Revenue Detail) table
CREATE TABLE BaoCaoChiTietMonAn (
    baocao_monan_id INT AUTO_INCREMENT PRIMARY KEY,
    baocao_id INT,
    monan_id INT,
    so_luong INT,
    tong_doanh_thu_mon DECIMAL(10,2),
    FOREIGN KEY (baocao_id) REFERENCES BaoCaoDoanhThu(baocao_id),
    FOREIGN KEY (monan_id) REFERENCES MonAn(monan_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 25. DanhGiaNhanVien (Employee Monthly Evaluation) table
CREATE TABLE DanhGiaNhanVien (
    danhgia_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    thang INT,
    nam INT,
    diem_so INT,
    binh_luan VARCHAR(255),
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 26. CaiDatNgonNgu (Language Settings) table
CREATE TABLE CaiDatNgonNgu (
    ma_ngon_ngu VARCHAR(10) PRIMARY KEY,
    ten_ngon_ngu VARCHAR(100)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 27. KhachHangThanThiet (Loyal Customer) table
CREATE TABLE KhachHangThanThiet (
    thanthiet_id INT AUTO_INCREMENT PRIMARY KEY,
    khachhang_id INT,
    diem_so INT DEFAULT 0,
    cap_bac VARCHAR(50), -- Bac | Vang | BachKim
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khachhang_id) REFERENCES ThongTinKhachHang(khachhang_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 28. LichSuDongBo (Sync History) table
CREATE TABLE LichSuDongBo (
    dongbo_id INT AUTO_INCREMENT PRIMARY KEY,
    thoi_gian_dong_bo DATETIME DEFAULT CURRENT_TIMESTAMP,
    loai_du_lieu VARCHAR(50),
    trang_thai VARCHAR(20), -- ThanhCong | ThatBai
    mo_ta VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 30. CaLamViec (Shift) table
CREATE TABLE CaLamViec (
    calamviec_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ca VARCHAR(50) NOT NULL, -- e.g., Ca Sáng, Ca Tối
    thoi_gian_bat_dau TIME NOT NULL, -- Start time of the shift
    thoi_gian_ket_thuc TIME NOT NULL, -- End time of the shift
    mo_ta VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 31. PhanCaNhanVien (Employee Shift Assignment) table
CREATE TABLE PhanCaNhanVien (
    phanca_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    calamviec_id INT,
    ngay_lam DATE NOT NULL,
    thoi_gian_check_in DATETIME,
    thoi_gian_check_out DATETIME,
    trang_thai VARCHAR(20) DEFAULT 'ChuaCheckIn', -- ChuaCheckIn | DaCheckIn | DaCheckOut | Nghi
    ghi_chu VARCHAR(255),
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id),
    FOREIGN KEY (calamviec_id) REFERENCES CaLamViec(calamviec_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 32. LuongNhanVien (Employee Salary) table
CREATE TABLE LuongNhanVien (
    luong_id INT AUTO_INCREMENT PRIMARY KEY,
    nhanvien_id VARCHAR(10),
    phanca_id INT,
    thang INT,
    nam INT,
    so_gio_lam DECIMAL(5,2), -- Total hours worked
    luong DECIMAL(15,2), -- Calculated salary (hours * 25000 VND)
    ngay_tinh_luong DATETIME DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(20) DEFAULT 'ChuaThanhToan', -- ChuaThanhToan | DaThanhToan
    FOREIGN KEY (nhanvien_id) REFERENCES NhanVien(nhanvien_id),
    FOREIGN KEY (phanca_id) REFERENCES PhanCaNhanVien(phanca_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- Triggers
DELIMITER //

-- Trigger to update table status when a reservation is created
CREATE TRIGGER trg_CapNhatTrangThaiBan_DatBan
AFTER INSERT ON DatBan
FOR EACH ROW
BEGIN
    UPDATE BanNhaHang
    SET trang_thai = 'DaDat'
    WHERE ban_id = NEW.ban_id;
END//

-- Trigger to update table status when an order is created
CREATE TRIGGER trg_CapNhatTrangThaiBan_DonHang
AFTER INSERT ON DonHang
FOR EACH ROW
BEGIN
    UPDATE BanNhaHang
    SET trang_thai = 'DangSuDung'
    WHERE ban_id = (SELECT ban_id FROM PhienSuDungBan WHERE phien_id = NEW.phien_id);
END//

-- Trigger to update total order amount when a dish is added to ChiTietDonHang
CREATE TRIGGER trg_CapNhatTongTien
AFTER INSERT ON ChiTietDonHang
FOR EACH ROW
BEGIN
    UPDATE DonHang
    SET tong_tien = (
        SELECT SUM(m.gia * ctdh.so_luong)
        FROM ChiTietDonHang ctdh
        JOIN MonAn m ON ctdh.monan_id = m.monan_id
        WHERE ctdh.donhang_id = NEW.donhang_id
    )
    WHERE donhang_id = NEW.donhang_id;
END//

-- Trigger to update raw material inventory when a dish is added to an order
CREATE TRIGGER trg_CapNhatTonKho
AFTER INSERT ON ChiTietDonHang
FOR EACH ROW
BEGIN
    -- Insert into PhieuXuatHang
    INSERT INTO PhieuXuatHang (nhanvien_id, tong_so_luong, ghi_chu, trang_thai)
    SELECT 
        ps.nhanvien_id,
        SUM(mn.so_luong_can * NEW.so_luong),
        CONCAT('Xuất kho cho món ', m.ten_mon, ' trong đơn hàng ', NEW.donhang_id),
        'DaXacNhan'
    FROM PhienSuDungBan ps
    JOIN DonHang dh ON ps.phien_id = dh.phien_id
    JOIN MonAn m ON NEW.monan_id = m.monan_id
    JOIN MonAnNguyenLieu mn ON m.monan_id = mn.monan_id
    WHERE dh.donhang_id = NEW.donhang_id
    GROUP BY ps.nhanvien_id, m.ten_mon;

    -- Insert into ChiTietPhieuXuat
    INSERT INTO ChiTietPhieuXuat (phieuxuat_id, nguyenlieu_id, so_luong, don_vi, ghi_chu)
    SELECT 
        LAST_INSERT_ID(),
        mn.nguyenlieu_id,
        mn.so_luong_can * NEW.so_luong,
        nl.don_vi,
        CONCAT('Xuất kho cho món ', m.ten_mon)
    FROM MonAnNguyenLieu mn
    JOIN MonAn m ON mn.monan_id = m.monan_id
    JOIN NguyenLieu nl ON mn.nguyenlieu_id = nl.nguyenlieu_id
    WHERE mn.monan_id = NEW.monan_id;

    -- Update NguyenLieu inventory
    UPDATE NguyenLieu nl
    INNER JOIN MonAnNguyenLieu mn ON nl.nguyenlieu_id = mn.nguyenlieu_id
    SET nl.so_luong_con_lai = nl.so_luong_con_lai - (mn.so_luong_can * NEW.so_luong)
    WHERE mn.monan_id = NEW.monan_id;
END//

-- Trigger to update raw material inventory when a receipt is confirmed
CREATE TRIGGER trg_CapNhatTonKhoNhap
AFTER UPDATE ON PhieuNhapHang
FOR EACH ROW
BEGIN
    IF NEW.trang_thai = 'DaXacNhan' AND OLD.trang_thai != 'DaXacNhan' THEN
        UPDATE NguyenLieu nl
        JOIN ChiTietPhieuNhap ctp ON nl.nguyenlieu_id = ctp.nguyenlieu_id
        SET nl.so_luong_con_lai = nl.so_luong_con_lai + ctp.so_luong
        WHERE ctp.phieunhap_id = NEW.phieunhap_id;
    END IF;
END//

-- Trigger to lock dish when raw material is insufficient
CREATE TRIGGER trg_KhoaMonAn
AFTER UPDATE ON NguyenLieu
FOR EACH ROW
BEGIN
    UPDATE MonAn
    SET khoa = 1, ngay_khoa = NOW()
    WHERE monan_id IN (
        SELECT monan_id
        FROM MonAnNguyenLieu
        WHERE nguyenlieu_id = NEW.nguyenlieu_id AND NEW.so_luong_con_lai < so_luong_can
    );
END//

-- Trigger to log order actions when dish status is updated
CREATE TRIGGER trg_GhiHanhDongDonHang
AFTER UPDATE ON ChiTietDonHang
FOR EACH ROW
BEGIN
    IF NEW.trang_thai_phuc_vu != OLD.trang_thai_phuc_vu THEN
        UPDATE DonHang
        SET 
            hanh_dong = 'CapNhatPhucVu',
            mo_ta_hanh_dong = CONCAT('Cập nhật trạng thái phục vụ món ', m.ten_mon, ' thành ', NEW.trang_thai_phuc_vu),
            thoi_gian_hanh_dong = NOW()
        FROM MonAn m
        WHERE donhang_id = NEW.donhang_id AND m.monan_id = NEW.monan_id;
    END IF;
END//

-- Trigger to update table status after merge/split/transfer
CREATE TRIGGER trg_CapNhatTrangThaiBan_Phien
AFTER UPDATE ON PhienSuDungBan
FOR EACH ROW
BEGIN
    IF NEW.loai_thao_tac IS NOT NULL THEN
        IF NEW.loai_thao_tac = 'ChuyenBan' THEN
            UPDATE BanNhaHang
            SET trang_thai = 'SanSang'
            WHERE ban_id = OLD.ban_id;

            UPDATE BanNhaHang
            SET trang_thai = 'DangSuDung'
            WHERE ban_id = NEW.ban_id;
        ELSEIF NEW.loai_thao_tac = 'GopBan' THEN
            UPDATE BanNhaHang
            SET trang_thai = 'SanSang'
            WHERE ban_id = OLD.ban_id;

            UPDATE BanNhaHang
            SET trang_thai = 'DangSuDung'
            WHERE ban_id = NEW.ban_id;
        ELSEIF NEW.loai_thao_tac = 'TachBan' THEN
            UPDATE BanNhaHang
            SET trang_thai = 'DangSuDung'
            WHERE ban_id IN (OLD.ban_id, NEW.ban_id);
        END IF;
    END IF;
END//

-- Trigger to create notification when payment is completed
CREATE TRIGGER trg_ThongBaoThanhToan
AFTER UPDATE ON ThanhToan
FOR EACH ROW
BEGIN
    IF NEW.trang_thai = 'HoanTat' AND OLD.trang_thai != 'HoanTat' THEN
        UPDATE PhienSuDungBan
        SET thong_bao_thanh_toan = CONCAT(
            'Bàn ', bn.ten_ban, ' (ID: ', bn.ban_id, ') đã hoàn tất thanh toán cho đơn hàng ', NEW.donhang_id,
            IF(NEW.la_giao_dich_demo = 1, ' (Giao dịch Demo)', '')
        )
        FROM DonHang dh
        JOIN BanNhaHang bn ON PhienSuDungBan.ban_id = bn.ban_id
        WHERE PhienSuDungBan.phien_id = dh.phien_id AND dh.donhang_id = NEW.donhang_id;

        UPDATE BanNhaHang
        SET trang_thai = 'SanSang'
        WHERE ban_id = (
            SELECT ps.ban_id
            FROM DonHang dh
            JOIN PhienSuDungBan ps ON dh.phien_id = ps.phien_id
            WHERE dh.donhang_id = NEW.donhang_id
        );
    END IF;
END//

-- Trigger to create revenue report when payment is completed
CREATE TRIGGER trg_TaoBaoCaoDoanhThu
AFTER UPDATE ON ThanhToan
FOR EACH ROW
BEGIN
    DECLARE v_ngay DATE;
    DECLARE v_thang INT;
    DECLARE v_quy INT;
    DECLARE v_nam INT;
    DECLARE v_baocao_id INT;

    IF NEW.trang_thai = 'HoanTat' AND OLD.trang_thai != 'HoanTat' AND NEW.la_giao_dich_demo = 0 THEN
        SET v_ngay = DATE(NEW.ngay_tao);
        SET v_thang = MONTH(NEW.ngay_tao);
        SET v_quy = QUARTER(NEW.ngay_tao);
        SET v_nam = YEAR(NEW.ngay_tao);

        -- Daily report
        SELECT baocao_id INTO v_baocao_id
        FROM BaoCaoDoanhThu
        WHERE ngay_bao_cao = v_ngay AND loai_bao_cao = 'Ngay'
        LIMIT 1;

        IF v_baocao_id IS NULL THEN
            INSERT INTO BaoCaoDoanhThu (ngay_bao_cao, loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang)
            VALUES (v_ngay, 'Ngay', v_thang, v_quy, v_nam, NEW.so_tien, 1);
            SET v_baocao_id = LAST_INSERT_ID();
        ELSE
            UPDATE BaoCaoDoanhThu
            SET tong_doanh_thu = tong_doanh_thu + NEW.so_tien,
                tong_don_hang = tong_don_hang + 1
            WHERE baocao_id = v_baocao_id;
        END IF;

        -- Insert dish details
        INSERT INTO BaoCaoChiTietMonAn (baocao_id, monan_id, so_luong, tong_doanh_thu_mon)
        SELECT 
            v_baocao_id,
            ctdh.monan_id,
            ctdh.so_luong,
            ctdh.so_luong * m.gia
        FROM ChiTietDonHang ctdh
        JOIN MonAn m ON ctdh.monan_id = m.monan_id
        WHERE ctdh.donhang_id = NEW.donhang_id;

        -- Monthly report
        SET v_baocao_id = NULL;
        SELECT baocao_id INTO v_baocao_id
        FROM BaoCaoDoanhThu
        WHERE thang = v_thang AND nam = v_nam AND loai_bao_cao = 'Thang'
        LIMIT 1;

        IF v_baocao_id IS NULL THEN
            INSERT INTO BaoCaoDoanhThu (loai_bao_cao, thang, quy, nam, tong_doanh_thu, tong_don_hang)
            VALUES ('Thang', v_thang, v_quy, v_nam, NEW.so_tien, 1);
        ELSE
            UPDATE BaoCaoDoanhThu
            SET tong_doanh_thu = tong_doanh_thu + NEW.so_tien,
                tong_don_hang = tong_don_hang + 1
            WHERE baocao_id = v_baocao_id;
        END IF;

        -- Quarterly report
        SET v_baocao_id = NULL;
        SELECT baocao_id INTO v_baocao_id
        FROM BaoCaoDoanhThu
        WHERE quy = v_quy AND nam = v_nam AND loai_bao_cao = 'Quy'
        LIMIT 1;

        IF v_baocao_id IS NULL THEN
            INSERT INTO BaoCaoDoanhThu (loai_bao_cao, quy, nam, tong_doanh_thu, tong_don_hang)
            VALUES ('Quy', v_quy, v_nam, NEW.so_tien, 1);
        ELSE
            UPDATE BaoCaoDoanhThu
            SET tong_doanh_thu = tong_doanh_thu + NEW.so_tien,
                tong_don_hang = tong_don_hang + 1
            WHERE baocao_id = v_baocao_id;
        END IF;

        -- Yearly report
        SET v_baocao_id = NULL;
        SELECT baocao_id INTO v_baocao_id
        FROM BaoCaoDoanhThu
        WHERE nam = v_nam AND loai_bao_cao = 'Nam'
        LIMIT 1;

        IF v_baocao_id IS NULL THEN
            INSERT INTO BaoCaoDoanhThu (loai_bao_cao, nam, tong_doanh_thu, tong_don_hang)
            VALUES ('Nam', v_nam, NEW.so_tien, 1);
        ELSE
            UPDATE BaoCaoDoanhThu
            SET tong_doanh_thu = tong_doanh_thu + NEW.so_tien,
                tong_don_hang = tong_don_hang + 1
            WHERE baocao_id = v_baocao_id;
        END IF;
    END IF;
END//

-- Trigger to create notification when raw material is low
CREATE TRIGGER trg_CanhBaoNguyenLieu
AFTER UPDATE ON NguyenLieu
FOR EACH ROW
BEGIN
    IF NEW.so_luong_con_lai <= NEW.nguong_canh_bao AND NEW.trang_thai_canh_bao = 0 THEN
        INSERT INTO PhienSuDungBan (
            nhanvien_id,
            thong_bao_thanh_toan,
            thoi_gian_bat_dau
        )
        SELECT 
            nv.nhanvien_id,
            CONCAT('Cảnh báo nguyên liệu: ', NEW.ten_nguyenlieu, ' chỉ còn ', NEW.so_luong_con_lai, ' ', NEW.don_vi, ', dưới ngưỡng cảnh báo.'),
            NOW()
        FROM NhanVien nv
        WHERE nv.role_id = (SELECT role_id FROM Role WHERE role_name = 'QuanLy');

        UPDATE NguyenLieu
        SET trang_thai_canh_bao = 1
        WHERE nguyenlieu_id = NEW.nguyenlieu_id;
    END IF;

    IF NEW.so_luong_con_lai > NEW.nguong_canh_bao AND NEW.trang_thai_canh_bao = 1 THEN
        UPDATE NguyenLieu
        SET trang_thai_canh_bao = 0
        WHERE nguyenlieu_id = NEW.nguyenlieu_id;
    END IF;
END//

DELIMITER ;

-- Indexes
CREATE INDEX idx_nhanvien_email ON NhanVien(email);
CREATE INDEX idx_donhang_phien ON DonHang(phien_id);
CREATE INDEX idx_chitiet_donhang ON ChiTietDonHang(donhang_id);
CREATE INDEX idx_ban_khuvuc ON BanNhaHang(khuvuc_id);
CREATE INDEX idx_datban_ban ON DatBan(ban_id);	
CREATE INDEX idx_datban_khachhang ON DatBan(khachhang_id);
CREATE INDEX idx_monan_nguyenlieu_mon ON MonAnNguyenLieu(monan_id);
CREATE INDEX idx_monan_nguyenlieu_nguyenlieu ON MonAnNguyenLieu(nguyenlieu_id);
CREATE INDEX idx_thongtin_khachhang_email ON ThongTinKhachHang(email);
CREATE INDEX idx_baocao_ngay ON BaoCaoDoanhThu(ngay_bao_cao);
CREATE INDEX idx_baocao_thang ON BaoCaoDoanhThu(thang, nam);
CREATE INDEX idx_baocao_quy ON BaoCaoDoanhThu(quy, nam);
CREATE INDEX idx_baocao_nam ON BaoCaoDoanhThu(nam);
CREATE INDEX idx_baocao_monan ON BaoCaoChiTietMonAn(baocao_id, monan_id);
CREATE INDEX idx_nguyenlieu_so_luong ON NguyenLieu(so_luong_con_lai);
CREATE INDEX idx_thietbi_trang_thai ON ThietBi(trang_thai);
CREATE INDEX idx_phieunhap_nguyenlieu ON ChiTietPhieuNhap(nguyenlieu_id);
CREATE INDEX idx_phieuxuat_nguyenlieu ON ChiTietPhieuXuat(nguyenlieu_id);

-- Indexes for new tables
CREATE INDEX idx_phanca_nhanvien ON PhanCaNhanVien(nhanvien_id);
CREATE INDEX idx_phanca_calamviec ON PhanCaNhanVien(calamviec_id);
CREATE INDEX idx_luong_nhanvien ON LuongNhanVien(nhanvien_id);
CREATE INDEX idx_luong_phanca ON LuongNhanVien(phanca_id);
CREATE INDEX idx_luong_thang_nam ON LuongNhanVien(thang, nam);

-- Triggers
DELIMITER //

-- Trigger to calculate salary when employee checks out
CREATE TRIGGER trg_TinhLuongNhanVien
AFTER UPDATE ON PhanCaNhanVien
FOR EACH ROW
BEGIN
    DECLARE so_gio DECIMAL(5,2);
    DECLARE luong_gio DECIMAL(10,2) DEFAULT 25000.00; -- 25,000 VND per hour

    IF NEW.trang_thai = 'DaCheckOut' AND OLD.trang_thai != 'DaCheckOut' THEN
        -- Calculate hours worked
        SET so_gio = TIMESTAMPDIFF(MINUTE, NEW.thoi_gian_check_in, NEW.thoi_gian_check_out) / 60.0;

        -- Insert into LuongNhanVien
        INSERT INTO LuongNhanVien (
            nhanvien_id,
            phanca_id,
            thang,
            nam,
            so_gio_lam,
            luong,
            trang_thai
        )
        VALUES (
            NEW.nhanvien_id,
            NEW.phanca_id,
            MONTH(NEW.ngay_lam),
            YEAR(NEW.ngay_lam),
            so_gio,
            so_gio * luong_gio,
            'ChuaThanhToan'
        );
    END IF;
END//

DELIMITER ;