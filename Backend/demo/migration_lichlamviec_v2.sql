-- Migration script for lichlamviec table v2
-- This script migrates from old structure (timestamp) to new structure (date + time)

-- Step 1: Add new columns (nullable first to allow data migration)
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ngay_lam_viec DATE;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gio_bat_dau TIME;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gio_ket_thuc TIME;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ma_dich_vu INTEGER;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ten_khach_hang VARCHAR(255);
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS so_dien_thoai VARCHAR(20);
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS ghi_chu TEXT;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS thoi_luong INTEGER;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS gia_dich_vu DOUBLE PRECISION;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS hoa_hong DOUBLE PRECISION;
ALTER TABLE lichlamviec ADD COLUMN IF NOT EXISTS mau_sac VARCHAR(20);

-- Step 2: Migrate existing data from old columns to new columns
UPDATE lichlamviec 
SET 
  ngay_lam_viec = DATE(thoi_gian_bat_dau),
  gio_bat_dau = thoi_gian_bat_dau::TIME,
  gio_ket_thuc = thoi_gian_ket_thuc::TIME
WHERE ngay_lam_viec IS NULL;

-- Step 3: Make new columns NOT NULL after data migration
ALTER TABLE lichlamviec ALTER COLUMN ngay_lam_viec SET NOT NULL;
ALTER TABLE lichlamviec ALTER COLUMN gio_bat_dau SET NOT NULL;
ALTER TABLE lichlamviec ALTER COLUMN gio_ket_thuc SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE lichlamviec DROP COLUMN IF EXISTS thoi_gian_bat_dau;
ALTER TABLE lichlamviec DROP COLUMN IF EXISTS thoi_gian_ket_thuc;

-- Step 5: Verify the new structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'lichlamviec' 
ORDER BY ordinal_position;
