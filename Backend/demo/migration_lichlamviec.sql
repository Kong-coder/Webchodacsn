-- Migration script for lichlamviec table
-- This script updates the table structure to support the new staff shift features

-- Step 1: Backup existing data (optional but recommended)
-- CREATE TABLE lichlamviec_backup AS SELECT * FROM lichlamviec;

-- Step 2: Drop old columns and add new ones
ALTER TABLE lichlamviec DROP COLUMN IF EXISTS thoi_gian_bat_dau;
ALTER TABLE lichlamviec DROP COLUMN IF EXISTS thoi_gian_ket_thuc;

-- Step 3: Add new columns
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ngay_lam_viec DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gio_bat_dau TIME NOT NULL DEFAULT '08:00:00';
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gio_ket_thuc TIME NOT NULL DEFAULT '17:00:00';
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ma_dich_vu INTEGER;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ten_khach_hang VARCHAR(255);
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS so_dien_thoai VARCHAR(20);
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS thoi_luong INTEGER;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gia_dich_vu DOUBLE PRECISION;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS hoa_hong DOUBLE PRECISION;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS mau_sac VARCHAR(20);

-- Step 4: Add foreign key constraint for service (optional)
-- ALTER TABLE lichlamviec ADD CONSTRAINT fk_lichlamviec_dichvu 
--   FOREIGN KEY (ma_dich_vu) REFERENCES dichvu(ma_dich_vu) ON DELETE SET NULL;

-- Step 5: Remove default constraints after initial setup
ALTER TABLE lichlamviec ALTER COLUMN ngay_lam_viec DROP DEFAULT;
ALTER TABLE lichlamviec ALTER COLUMN gio_bat_dau DROP DEFAULT;
ALTER TABLE lichlamviec ALTER COLUMN gio_ket_thuc DROP DEFAULT;

-- Verification query
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'lichlamviec' 
-- ORDER BY ordinal_position;
