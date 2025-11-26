-- Create QR Attendance Tokens table
CREATE TABLE IF NOT EXISTS qr_attendance_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by INTEGER REFERENCES nguoi_dung(ma_nguoi_dung),
    CONSTRAINT unique_active_token_per_day UNIQUE (created_date, is_active)
);

-- Create indexes for performance
CREATE INDEX idx_qr_token ON qr_attendance_tokens(token);
CREATE INDEX idx_qr_date ON qr_attendance_tokens(created_date);
CREATE INDEX idx_qr_active ON qr_attendance_tokens(is_active);

-- Verify cham_cong table exists (should already exist)
-- If not, create it
CREATE TABLE IF NOT EXISTS cham_cong (
    ma_cham_cong SERIAL PRIMARY KEY,
    ma_nhan_vien INTEGER NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
    ngay_cham_cong DATE NOT NULL,
    gio_vao TIME,
    gio_ra TIME,
    tong_gio DOUBLE PRECISION,
    ghi_chu TEXT,
    CONSTRAINT unique_employee_date UNIQUE (ma_nhan_vien, ngay_cham_cong)
);

-- Create indexes for cham_cong
CREATE INDEX IF NOT EXISTS idx_cham_cong_employee ON cham_cong(ma_nhan_vien);
CREATE INDEX IF NOT EXISTS idx_cham_cong_date ON cham_cong(ngay_cham_cong);
