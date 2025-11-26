# Hướng dẫn test chức năng xác nhận thanh toán và trừ sản phẩm

## Chuẩn bị

### 1. Kiểm tra sản phẩm và dịch vụ

```sql
-- Xem danh sách sản phẩm
SELECT id, name, quantity, usage_count FROM products;

-- Xem danh sách dịch vụ
SELECT id, ten FROM dichvu WHERE co_san = true;

-- Xem liên kết giữa dịch vụ và sản phẩm
SELECT sp.id, sp.service_id, dv.ten as service_name, sp.product_id, p.name as product_name, sp.quantity_per_use
FROM service_products sp
JOIN dichvu dv ON sp.service_id = dv.id
JOIN products p ON sp.product_id = p.id;
```

### 2. Tạo liên kết dịch vụ - sản phẩm (nếu chưa có)

Vào trang **Quản lý kho** (Inventory Management):
1. Nhấn vào dòng "Thêm sản phẩm mới"
2. Nhập thông tin sản phẩm
3. Trong phần "Liên kết dịch vụ", chọn các dịch vụ sẽ sử dụng sản phẩm này
4. Nhấn "✓" để lưu

Hoặc sử dụng SQL:

```sql
-- Thêm liên kết dịch vụ - sản phẩm
INSERT INTO service_products (service_id, product_id, quantity_per_use)
VALUES (15, 4, 1);  -- Dịch vụ 15 sử dụng 1 đơn vị sản phẩm 4
```

## Các bước test

### Bước 1: Ghi nhận số lượng sản phẩm ban đầu

```sql
-- Lưu lại số lượng hiện tại
SELECT id, name, quantity FROM products WHERE id = 4;
```

Ví dụ kết quả:
```
 id |        name        | quantity 
----+--------------------+----------
  4 | Tinh Dầu Vitamin C |        3
```

### Bước 2: Khách hàng đặt dịch vụ

1. Đăng nhập với tài khoản khách hàng
2. Vào trang **Đặt lịch** (Booking)
3. Chọn dịch vụ (ví dụ: dịch vụ ID 15)
4. Chọn ngày giờ
5. Chọn phương thức thanh toán: **Tiền mặt**
6. Nhấn **Đặt lịch**

### Bước 3: Kiểm tra database sau khi đặt lịch

```sql
-- Lấy ID lịch hẹn mới nhất
SELECT ma_lich_hen, trang_thai, ma_dich_vu, ma_khach_hang 
FROM lichhen 
ORDER BY ma_lich_hen DESC 
LIMIT 1;
```

Ví dụ kết quả:
```
 ma_lich_hen | trang_thai  | ma_dich_vu | ma_khach_hang 
-------------+-------------+------------+---------------
          37 | CHO_XAC_NHAN|         15 |             1
```

```sql
-- Kiểm tra hóa đơn
SELECT ma_hoa_don, ma_lich_hen, trang_thai, phuong_thuc_thanh_toan 
FROM hoadon 
WHERE ma_lich_hen = 37;
```

Ví dụ kết quả:
```
 ma_hoa_don | ma_lich_hen | trang_thai | phuong_thuc_thanh_toan 
------------+-------------+------------+------------------------
         24 |          37 | unpaid     | TIEN_MAT
```

```sql
-- Kiểm tra sản phẩm (chưa trừ)
SELECT id, name, quantity FROM products WHERE id = 4;
```

Ví dụ kết quả (số lượng vẫn là 3):
```
 id |        name        | quantity 
----+--------------------+----------
  4 | Tinh Dầu Vitamin C |        3
```

### Bước 4: Nhân viên xác nhận dịch vụ

1. Đăng nhập với tài khoản nhân viên hoặc quản lý
2. Vào trang **Quản lý lịch hẹn** hoặc **Calendar**
3. Tìm lịch hẹn vừa tạo (ID 37)
4. Nhấn nút **Xác nhận** (Confirm)

### Bước 5: Kiểm tra kết quả

```sql
-- Kiểm tra trạng thái lịch hẹn (phải là DA_XAC_NHAN)
SELECT ma_lich_hen, trang_thai 
FROM lichhen 
WHERE ma_lich_hen = 37;
```

Kết quả mong đợi:
```
 ma_lich_hen | trang_thai  
-------------+-------------
          37 | DA_XAC_NHAN
```

```sql
-- Kiểm tra trạng thái hóa đơn (phải là paid)
SELECT ma_hoa_don, trang_thai 
FROM hoadon 
WHERE ma_lich_hen = 37;
```

Kết quả mong đợi:
```
 ma_hoa_don | trang_thai 
------------+------------
         24 | paid
```

```sql
-- Kiểm tra thanh toán (phải có bản ghi với trạng thái success)
SELECT id, hoa_don_id, trang_thai, nha_cung_cap 
FROM thanh_toan 
WHERE hoa_don_id = 24;
```

Kết quả mong đợi:
```
 id | hoa_don_id | trang_thai | nha_cung_cap 
----+------------+------------+--------------
  4 |         24 | success    | CASH
```

```sql
-- Kiểm tra sản phẩm (phải giảm 1 đơn vị)
SELECT id, name, quantity, usage_count 
FROM products 
WHERE id = 4;
```

Kết quả mong đợi (số lượng giảm từ 3 xuống 2):
```
 id |        name        | quantity | usage_count 
----+--------------------+----------+-------------
  4 | Tinh Dầu Vitamin C |        2 |           1
```

### Bước 6: Kiểm tra log backend

Trong terminal chạy backend, bạn sẽ thấy log như sau:

```
Appointment 37 is DA_XAC_NHAN, auto-confirming payment...
Found invoice 24 for appointment 37
Payment method is cash: TIEN_MAT
Auto-confirming cash payment for invoice 24
--> [ThanhToanService] === CASH CONFIRM STARTED for invoice 24 ===
--> [ThanhToanService] Invoice found: 24, current status: unpaid, orderId: null
--> [ThanhToanService] Payment record 4 status updated to success.
--> [ThanhToanService] Invoice 24 status updated to PAID.
--> [ThanhToanService] Calling deductProductsForInvoice...
--> [ThanhToanService] Starting product deduction for invoice 24
--> [ThanhToanService] Found service 15 from appointment.
--> [ThanhToanService] Processing deduction for service ID: 15, quantity: 1
--> [ThanhToanService] Deducting 1 of product 'Tinh Dầu Vitamin C' (ID: 4). Current stock: 3
--> [ThanhToanService] ✓ Deducted 1 units of 'Tinh Dầu Vitamin C'. New stock: 2
--> [ThanhToanService] ✓ Product deduction completed for invoice 24
--> [ThanhToanService] === CASH CONFIRM COMPLETED ===
✓ Payment auto-confirmed for appointment 37
```

## Test case 2: Hủy lịch hẹn (hoàn trả sản phẩm)

### Bước 1: Nhân viên hủy lịch hẹn đã xác nhận

1. Vào trang quản lý lịch hẹn
2. Chọn lịch hẹn đã xác nhận (ID 37)
3. Nhấn nút **Hủy** (Cancel)
4. Nhập lý do hủy
5. Xác nhận

### Bước 2: Kiểm tra kết quả

```sql
-- Kiểm tra trạng thái lịch hẹn (phải là DA_HUY)
SELECT ma_lich_hen, trang_thai, ly_do_huy 
FROM lichhen 
WHERE ma_lich_hen = 37;
```

Kết quả mong đợi:
```
 ma_lich_hen | trang_thai | ly_do_huy 
-------------+------------+-----------
          37 | DA_HUY     | Khách hủy
```

```sql
-- Kiểm tra sản phẩm (phải tăng lại 1 đơn vị)
SELECT id, name, quantity 
FROM products 
WHERE id = 4;
```

Kết quả mong đợi (số lượng tăng từ 2 lên 3):
```
 id |        name        | quantity 
----+--------------------+----------
  4 | Tinh Dầu Vitamin C |        3
```

## Test case 3: Thanh toán online (MoMo)

Với thanh toán online, việc xác nhận thanh toán và trừ sản phẩm được xử lý tự động qua webhook khi khách hàng thanh toán thành công trên MoMo. Không cần nhân viên xác nhận thủ công.

## Lưu ý

1. **Chỉ áp dụng cho thanh toán tiền mặt**: Chức năng tự động xác nhận chỉ hoạt động với phương thức thanh toán `TIEN_MAT` hoặc `cash`

2. **Kiểm tra tồn kho**: Nếu sản phẩm không đủ số lượng, hệ thống sẽ báo lỗi:
   ```
   Product 'Tinh Dầu Vitamin C' (ID: 4) has insufficient stock. Current: 0, Required: 1
   ```

3. **Không trừ 2 lần**: Nếu lịch hẹn đã được xác nhận trước đó, hệ thống sẽ không trừ sản phẩm lần nữa

4. **Hoàn trả khi hủy**: Chỉ hoàn trả sản phẩm nếu lịch hẹn đã được thanh toán (hóa đơn có trạng thái `paid`)

## Các lệnh SQL hữu ích

```sql
-- Xem tất cả lịch hẹn với thông tin đầy đủ
SELECT 
    l.ma_lich_hen,
    l.trang_thai as lich_status,
    l.ma_dich_vu,
    dv.ten as service_name,
    h.ma_hoa_don,
    h.trang_thai as hd_status,
    h.phuong_thuc_thanh_toan,
    t.trang_thai as tt_status
FROM lichhen l
LEFT JOIN dichvu dv ON l.ma_dich_vu = dv.id
LEFT JOIN hoadon h ON l.ma_lich_hen = h.ma_lich_hen
LEFT JOIN thanh_toan t ON h.ma_hoa_don = t.hoa_don_id
ORDER BY l.ma_lich_hen DESC
LIMIT 10;

-- Xem lịch sử sử dụng sản phẩm
SELECT 
    p.id,
    p.name,
    p.quantity,
    p.usage_count,
    COUNT(sp.service_id) as linked_services
FROM products p
LEFT JOIN service_products sp ON p.id = sp.product_id
GROUP BY p.id, p.name, p.quantity, p.usage_count
ORDER BY p.usage_count DESC;

-- Reset test data (nếu cần)
UPDATE lichhen SET trang_thai = 'CHO_XAC_NHAN' WHERE ma_lich_hen = 37;
UPDATE hoadon SET trang_thai = 'unpaid' WHERE ma_lich_hen = 37;
DELETE FROM thanh_toan WHERE hoa_don_id = 24;
UPDATE products SET quantity = 3 WHERE id = 4;
```

## Kết luận

Sau khi sửa lỗi, hệ thống sẽ tự động:
1. ✅ Cập nhật trạng thái lịch hẹn thành `DA_XAC_NHAN`
2. ✅ Cập nhật trạng thái hóa đơn thành `paid`
3. ✅ Tạo bản ghi thanh toán với trạng thái `success`
4. ✅ Trừ sản phẩm liên kết với dịch vụ khỏi kho
5. ✅ Tăng số lần sử dụng sản phẩm (`usage_count`)
6. ✅ Hoàn trả sản phẩm khi hủy lịch hẹn đã thanh toán
