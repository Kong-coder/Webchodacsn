# Script to sync payments for confirmed appointments
$env:PGPASSWORD='kong'

Write-Host "=== SYNCING PAYMENTS ===" -ForegroundColor Green

# Find unpaid confirmed appointments
$query = @"
SELECT lh.ma_lich_hen, lh.ma_dich_vu, hd.ma_hoa_don 
FROM lichhen lh 
JOIN hoadon hd ON lh.ma_lich_hen = hd.ma_lich_hen 
WHERE lh.trang_thai = 'DA_XAC_NHAN' 
AND hd.trang_thai = 'unpaid' 
AND hd.phuong_thuc_thanh_toan = 'TIEN_MAT'
ORDER BY lh.ma_lich_hen DESC;
"@

$result = psql -h localhost -U postgres -d webdacsn -t -A -F"," -c $query

if ($result) {
    $appointments = $result -split "`n" | Where-Object { $_ -ne "" }
    
    Write-Host "Found $($appointments.Count) appointments to sync" -ForegroundColor Yellow
    
    foreach ($line in $appointments) {
        $parts = $line -split ","
        $appointmentId = $parts[0]
        $serviceId = $parts[1]
        $invoiceId = $parts[2]
        
        Write-Host "`nProcessing appointment $appointmentId (service $serviceId, invoice $invoiceId)..." -ForegroundColor Cyan
        
        # Update invoice to paid
        psql -h localhost -U postgres -d webdacsn -c "UPDATE hoadon SET trang_thai = 'paid' WHERE ma_hoa_don = $invoiceId;" | Out-Null
        Write-Host "  ✓ Invoice $invoiceId marked as paid" -ForegroundColor Green
        
        # Find products linked to this service
        $productQuery = "SELECT product_id, quantity_per_use FROM service_products WHERE service_id = $serviceId;"
        $products = psql -h localhost -U postgres -d webdacsn -t -A -F"," -c $productQuery
        
        if ($products) {
            $productLines = $products -split "`n" | Where-Object { $_ -ne "" }
            foreach ($productLine in $productLines) {
                $productParts = $productLine -split ","
                $productId = $productParts[0]
                $quantityPerUse = $productParts[1]
                
                # Deduct product quantity
                psql -h localhost -U postgres -d webdacsn -c "UPDATE products SET quantity = quantity - $quantityPerUse WHERE id = $productId;" | Out-Null
                Write-Host "  ✓ Deducted $quantityPerUse units from product $productId" -ForegroundColor Green
            }
        } else {
            Write-Host "  ⚠ No products linked to service $serviceId" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n=== SYNC COMPLETED ===" -ForegroundColor Green
} else {
    Write-Host "No appointments to sync" -ForegroundColor Yellow
}
