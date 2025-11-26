# Hướng dẫn Migration cho bảng lichlamviec

## Vấn đề đã được fix

Đã sửa lỗi mapping giữa Frontend và Backend cho tính năng quản lý ca làm việc của nhân viên:

### Các thay đổi chính:

1. **Model (StaffShift.java)**
   - Thay đổi từ `OffsetDateTime` sang `LocalDate` và `LocalTime`
   - Thêm các fields: `serviceId`, `customerName`, `phone`, `note`, `duration`, `price`, `commission`, `color`

2. **DTOs**
   - Cập nhật `StaffShiftRequest`, `StaffShiftResponse`, `StaffShiftSearchRequest`
   - Sử dụng String cho date/time để dễ dàng mapping với frontend

3. **Service & Repository**
   - Cập nhật logic xử lý date/time parsing
   - Thêm filter theo status trong search

## Cách áp dụng Migration

### Bước 1: Backup database (khuyến nghị)
```bash
docker exec -it my-app-db-1 pg_dump -U postgres webdacsn > backup_before_migration.sql
```

### Bước 2: Chạy migration script
```bash
docker exec -i my-app-db-1 psql -U postgres -d webdacsn < migration_lichlamviec.sql
```

Hoặc kết nối vào database và chạy trực tiếp:
```bash
docker exec -it my-app-db-1 psql -U postgres -d webdacsn
```

Sau đó copy nội dung file `migration_lichlamviec.sql` và paste vào.

### Bước 3: Restart backend
```bash
cd my-app
docker-compose restart backend
```

### Bước 4: Kiểm tra logs
```bash
docker-compose logs -f backend
```

## Kiểm tra sau khi migration

1. Đăng nhập với tài khoản nhân viên
2. Vào trang Calendar
3. Thử tạo ca làm mới với đầy đủ thông tin
4. Kiểm tra filter theo trạng thái
5. Kiểm tra hiển thị thông tin dịch vụ, khách hàng, hoa hồng

## Rollback (nếu cần)

Nếu có vấn đề, restore từ backup:
```bash
docker exec -i my-app-db-1 psql -U postgres -d webdacsn < backup_before_migration.sql
```

## Lưu ý

- Migration script sử dụng `IF NOT EXISTS` và `IF EXISTS` để tránh lỗi nếu chạy nhiều lần
- Các cột mới sẽ có giá trị NULL cho dữ liệu cũ
- Frontend đã được thiết kế để xử lý các trường hợp này
