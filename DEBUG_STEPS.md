# Debug Steps - Trang Quản Lý Nhân Sự

## Tình trạng hiện tại

✅ Database có cấu trúc đúng (14 cột)
✅ Database có dữ liệu mẫu (1 ca làm việc của nhân viên ID 8)
✅ Backend đã rebuild với code mới
✅ Frontend đã restart
✅ Có 2 nhân viên với vai trò NHANVIEN (ID 8 và 11)

## Vấn đề

Trang HRManagementSystem không load được danh sách ca làm việc (lỗi 500 hoặc không hiển thị data)

## Các bước debug

### Bước 1: Kiểm tra backend có nhận request không

1. Mở terminal và chạy:
```powershell
cd my-app
docker-compose logs -f backend
```

2. Refresh trang web (F5)

3. Xem có log nào về `/api/staff-shifts/search` không

### Bước 2: Kiểm tra query SQL

Trong logs backend, tìm dòng bắt đầu với `Hibernate:` và `select` để xem query SQL:

**Query đúng sẽ là:**
```sql
select 
  ss1_0.ma_lich_lam_viec,
  ss1_0.ma_nhan_vien,
  ss1_0.ngay_lam_viec,
  ss1_0.gio_bat_dau,
  ss1_0.gio_ket_thuc,
  ss1_0.trang_thai,
  ...
from lichlamviec ss1_0
```

**Query SAI sẽ là:**
```sql
select 
  ss1_0.thoi_gian_bat_dau,  <-- Cột cũ không tồn tại
  ss1_0.thoi_gian_ket_thuc, <-- Cột cũ không tồn tại
  ...
```

### Bước 3: Nếu query SAI

Backend đang dùng code cũ. Cần rebuild:

```powershell
cd my-app

# Stop backend
docker-compose stop backend

# Remove old container
docker-compose rm -f backend

# Rebuild image
docker-compose build --no-cache backend

# Start backend
docker-compose up -d backend

# Watch logs
docker-compose logs -f backend
```

### Bước 4: Kiểm tra frontend request

1. Mở Developer Console (F12)
2. Vào tab Network
3. Refresh trang
4. Tìm request `/api/staff-shifts/search`
5. Xem:
   - Request payload có đúng không?
   - Response status code (200, 500, 401?)
   - Response body có data không?

**Request đúng:**
```json
{
  "employeeId": null,
  "from": null,
  "to": null,
  "status": null
}
```

**Response đúng:**
```json
[
  {
    "id": 3,
    "employeeId": 8,
    "date": "2025-11-19",
    "startTime": "07:00",
    "endTime": "11:30",
    "status": "registered",
    ...
  }
]
```

### Bước 5: Kiểm tra employees API

Frontend cần load employees trước để map employeeId → tên nhân viên.

1. Trong Network tab, tìm request `/api/employees`
2. Xem response có nhân viên ID 8 không?

**Response đúng:**
```json
{
  "content": [
    {
      "id": 8,
      "name": "Tên nhân viên",
      ...
    }
  ]
}
```

### Bước 6: Test API trực tiếp

Nếu frontend không hoạt động, test backend trực tiếp:

```powershell
# Get employees
Invoke-WebRequest -Uri "http://localhost:8080/api/employees" -Method GET

# Search shifts (cần token)
# Lấy token từ localStorage trong browser console:
# localStorage.getItem('userToken')
```

## Các lỗi thường gặp

### Lỗi 1: Column does not exist

```
ERROR: column ss1_0.thoi_gian_bat_dau does not exist
```

**Nguyên nhân**: Backend đang dùng code cũ

**Giải pháp**: Rebuild backend (Bước 3)

### Lỗi 2: 401 Unauthorized

**Nguyên nhân**: Chưa đăng nhập hoặc token hết hạn

**Giải pháp**: Đăng nhập lại

### Lỗi 3: Empty array []

**Nguyên nhân**: 
- Không có dữ liệu trong database
- Filter không đúng

**Giải pháp**: 
- Kiểm tra database có data không
- Xem request payload có filter gì không

### Lỗi 4: Cannot read property 'name' of undefined

**Nguyên nhân**: Employees chưa load xong

**Giải pháp**: Đợi employees load xong trước khi load shifts

## Kiểm tra cuối cùng

Nếu tất cả đều OK nhưng vẫn không hiển thị:

1. Xem console có lỗi JavaScript không
2. Xem component có render không (React DevTools)
3. Xem state `shifts` có data không

```javascript
// Trong browser console
console.log('Shifts:', shifts);
console.log('Employees:', employees);
```

## Kết luận

Sau khi debug, bạn sẽ biết chính xác vấn đề ở đâu:
- Backend query sai → Rebuild
- Frontend request sai → Fix code
- Data không có → Thêm data mẫu
- Mapping sai → Fix logic
