-- Trigger to auto-update invoice and deduct products when appointment is confirmed

-- Function to handle appointment confirmation
CREATE OR REPLACE FUNCTION auto_confirm_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status changed to DA_XAC_NHAN
    IF NEW.trang_thai = 'DA_XAC_NHAN' AND (OLD.trang_thai IS NULL OR OLD.trang_thai != 'DA_XAC_NHAN') THEN
        -- Update invoice to paid
        UPDATE hoadon 
        SET trang_thai = 'paid'
        WHERE ma_lich_hen = NEW.ma_lich_hen
        AND trang_thai = 'unpaid'
        AND phuong_thuc_thanh_toan = 'TIEN_MAT';
        
        -- Deduct products
        UPDATE products p
        SET quantity = quantity - (sp.quantity_per_use * 1)
        FROM service_products sp
        WHERE sp.service_id = NEW.ma_dich_vu
        AND sp.product_id = p.id;
        
        RAISE NOTICE 'Auto-confirmed payment for appointment %', NEW.ma_lich_hen;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_confirm_payment ON lichhen;
CREATE TRIGGER trigger_auto_confirm_payment
    AFTER INSERT OR UPDATE ON lichhen
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_payment();

-- Test the trigger
SELECT 'Trigger created successfully!' AS status;
