# Hướng dẫn Test Trang Quản Lý Nhân Sự

## Trạng thái hiện tại

✅ Database đã migrate thành công
✅ Backend đã rebuild và restart
✅ Frontend đã restart
✅ Có 1 ca làm việc mẫu trong database (nhân viên ID 8, ngày 19/11/2025)

## Các fields trong database `lichlamviec`

### Fields cơ bản (cho HRManagementSystem - Manager):
- `ma_lich_lam_viec` (id)
- `ma_nhan_vien` (employeeId)
- `ngay_lam_viec` (date)
- `gio_bat_dau` (startTime)
- `gio_ket_thuc` (endTime)
- `trang_thai` (status)

### Fields mở rộng (cho Calendar - Staff):
- `ma_dich_vu` (serviceId) - Dịch vụ spa
- `ten_khach_hang` (customerName) - Tên khách hàng
- `so_dien_thoai` (phone) - SĐT khách
- `ghi_chu` (note) - Ghi chú
- `thoi_luong` (duration) - Thời lượng (phút)
- `gia_dich_vu` (price) - Giá dịch vụ
- `hoa_hong` (commission) - Hoa hồng nhân viên
- `mau_sac` (color) - Màu hiển thị trên calendar

## Lý do giữ các fields mở rộng

Trang **Calendar** (`/staff/calendar`) của nhân viên cần các thông tin chi tiết:
- Nhân viên cần biết dịch vụ nào họ phải làm
- Nhân viên cần biết khách hàng là ai, SĐT để liên hệ
- Nhân viên cần xem hoa hồng của mình
- Nhân viên có thể thêm ghi chú cho ca làm

Trang **HRManagementSystem** của manager chỉ cần xem tổng quan:
- Nhân viên nào làm việc
- Ngày nào, giờ nào
- Trạng thái (đã đăng ký, đã chấm công)

## Cách test

### 1. Test trang Manager

```
URL: http://localhost:3001
```

1. Đăng nhập với tài khoản Manager/Admin
2. Vào menu "Quản lý khách hàng" → "Hệ Thống Quản Lý Nhân Sự"
3. Click tab "📅 Ca Làm Việc"
4. Mở Developer Console (F12) để xem logs
5. Kiểm tra:
   - Request đến `/api/staff-shifts/search`
   - Response có data không
   - Có lỗi gì không

### 2. Kiểm tra backend logs

```powershell
cd my-app
docker-compose logs -f backend
```

Xem có lỗi gì khi request đến không.

### 3. Test API trực tiếp

Nếu vẫn lỗi, kiểm tra xem backend có query đúng không:

```powershell
cd my-app
docker-compose logs --tail=200 backend | Select-String -Pattern "select.*lichlamviec" -Context 2,2
```

## Nếu vẫn lỗi

### Kiểm tra cấu trúc bảng:
```powershell
$env:PGPASSWORD='kong'; psql -h localhost -U postgres -d webdacsn -c "\d lichlamviec"
```

### Kiểm tra dữ liệu:
```powershell
$env:PGPASSWORD='kong'; psql -h localhost -U postgres -d webdacsn -c "SELECT ma_lich_lam_viec, ma_nhan_vien, ngay_lam_viec, gio_bat_dau, gio_ket_thuc, trang_thai FROM lichlamviec;"
```

### Rebuild backend nếu cần:
```powershell
cd my-app
docker-compose build backend
docker-compose restart backend
```

## Dữ liệu mẫu hiện tại

```
 ma_lich_lam_viec | ma_nhan_vien | ngay_lam_viec | gio_bat_dau | gio_ket_thuc | trang_thai
------------------+--------------+---------------+-------------+--------------+------------
                3 |            8 | 2025-11-19    | 07:00:00    | 11:30:00     | registered
```

Khi test, bạn sẽ thấy:
- **STT**: 1
- **Nhân viên**: (Tên của nhân viên ID 8)
- **Ngày làm việc**: 19/11/2025
- **Ca**: Sáng (vì bắt đầu 07:00)
- **Giờ bắt đầu**: 07:00
- **Giờ kết thúc**: 11:30
- **Số giờ**: 4.5h
- **Trạng thái**: Đã đăng ký

## Lưu ý

- Backend đã được rebuild với code mới (sử dụng LocalDate và LocalTime)
- Database đã được migrate với cấu trúc mới
- Frontend đã được update để parse date/time string
- Tất cả đã sẵn sàng, chỉ cần test!
