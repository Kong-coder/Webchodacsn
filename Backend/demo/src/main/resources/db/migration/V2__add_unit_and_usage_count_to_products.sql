-- Add unit and usageCount columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'Cái';
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Update existing records to have default values
UPDATE products SET unit = 'Cái' WHERE unit IS NULL;
UPDATE products SET usage_count = 0 WHERE usage_count IS NULL;
