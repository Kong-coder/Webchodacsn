# Simple script to sync payments
$env:PGPASSWORD='kong'

Write-Host "=== SYNCING PAYMENTS ===" -ForegroundColor Green

# Update all unpaid invoices for confirmed appointments to paid
$updateQuery = @"
UPDATE hoadon 
SET trang_thai = 'paid' 
WHERE ma_lich_hen IN (
    SELECT ma_lich_hen 
    FROM lichhen 
    WHERE trang_thai = 'DA_XAC_NHAN'
) 
AND trang_thai = 'unpaid' 
AND phuong_thuc_thanh_toan = 'TIEN_MAT';
"@

Write-Host "Updating invoices to paid..." -ForegroundColor Yellow
psql -h localhost -U postgres -d webdacsn -c $updateQuery

# Deduct products for each confirmed appointment
$query = @"
SELECT DISTINCT lh.ma_dich_vu, sp.product_id, sp.quantity_per_use, COUNT(*) as appointment_count
FROM lichhen lh
JOIN hoadon hd ON lh.ma_lich_hen = hd.ma_lich_hen
JOIN service_products sp ON lh.ma_dich_vu = sp.service_id
WHERE lh.trang_thai = 'DA_XAC_NHAN'
AND hd.trang_thai = 'paid'
AND hd.phuong_thuc_thanh_toan = 'TIEN_MAT'
GROUP BY lh.ma_dich_vu, sp.product_id, sp.quantity_per_use;
"@

Write-Host "Deducting products..." -ForegroundColor Yellow
$result = psql -h localhost -U postgres -d webdacsn -t -A -F"," -c $query

if ($result) {
    $lines = $result -split "`n" | Where-Object { $_.Trim() -ne "" }
    foreach ($line in $lines) {
        $parts = $line -split ","
        if ($parts.Length -ge 4) {
            $productId = $parts[1]
            $quantityPerUse = $parts[2]
            $count = $parts[3]
            $totalDeduct = [int]$quantityPerUse * [int]$count
            
            psql -h localhost -U postgres -d webdacsn -c "UPDATE products SET quantity = quantity - $totalDeduct WHERE id = $productId;" | Out-Null
            Write-Host "  Deducted $totalDeduct units from product $productId" -ForegroundColor Green
        }
    }
}

Write-Host "=== SYNC COMPLETED ===" -ForegroundColor Green
