# 🌸 Hệ Thống Quản Lý Spa

Hệ thống quản lý spa toàn diện với các chức năng đặt lịch, thanh toán, quản lý kho và báo cáo doanh thu.

## 🚀 Công Nghệ Sử Dụng

### Backend
- **Java 21** với Spring Boot 3.3.5
- **PostgreSQL** - Database
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - ORM
- **MoMo Payment Gateway** - Thanh toán online

### Frontend
- **React 18** - UI Framework
- **Bootstrap 5** - CSS Framework
- **Recharts** - Biểu đồ thống kê
- **Lucide React** - Icons

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse Proxy

## 📦 Cài Đặt

### Yêu Cầu
- Docker & Docker Compose
- Java 21 (để build)
- Node.js 18+ (để build frontend)

### Khởi Động

```bash
# Clone repository
git clone <repository-url>
cd my-app

# Khởi động tất cả services
docker-compose up --build

# Hoặc chỉ khởi động backend
docker-compose up --build backend

# Hoặc chỉ khởi động frontend
docker-compose up --build frontend
```

### URLs
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## 🔑 Tài Khoản Mặc Định

### Admin/Manager
```
Username: admin@spa.com
Password: admin123
Role: QUANLY
```

### Nhân Viên
```
Username: staff@spa.com
Password: staff123
Role: NHANVIEN
```

### Khách Hàng
```
Username: customer@spa.com
Password: customer123
Role: KHACHHANG
```

## 📱 Chức Năng Chính

### 👥 Quản Lý Khách Hàng
- Đăng ký/Đăng nhập
- Xem thông tin cá nhân
- Lịch sử đặt lịch
- Đánh giá dịch vụ

### 📅 Quản Lý Lịch Hẹn
- Đặt lịch online
- Chọn nhân viên
- Chọn thời gian
- Xác nhận/Hủy lịch hẹn
- Tự động trừ sản phẩm khi xác nhận

### 💰 Thanh Toán
- Thanh toán tiền mặt
- Thanh toán MoMo
- Tự động xác nhận thanh toán
- Webhook MoMo

### 📦 Quản Lý Kho
- Danh sách sản phẩm
- Thêm/Sửa/Xóa sản phẩm
- Liên kết sản phẩm với dịch vụ
- Phiếu nhập kho
- Phiếu xuất kho
- Cảnh báo sắp hết hàng
- Top sản phẩm dùng nhiều nhất
- Tự động trừ khi bán hàng

### 📊 Thống Kê & Báo Cáo
- Tổng doanh thu
- Số khách hàng
- Trung bình doanh thu/khách
- Biểu đồ doanh thu theo thời gian
- Biểu đồ tỷ lệ doanh thu theo dịch vụ
- Top 5 khách hàng VIP
- Thống kê dịch vụ phổ biến

### 👨‍💼 Quản Lý Nhân Viên
- Danh sách nhân viên
- Lịch làm việc
- Chấm công QR Code
- Thống kê hiệu suất

## 🗂️ Cấu Trúc Dự Án

```
my-app/
├── Backend/
│   └── demo/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/example/demo/
│       │       │   ├── controller/      # REST Controllers
│       │       │   ├── service/         # Business Logic
│       │       │   ├── repository/      # Data Access
│       │       │   ├── model/           # Entities
│       │       │   ├── dto/             # Data Transfer Objects
│       │       │   └── exception/       # Custom Exceptions
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
├── Frontend/
│   └── src/
│       ├── pages/
│       │   ├── admin/               # Admin pages
│       │   ├── staff/               # Staff pages
│       │   └── client/              # Customer pages
│       ├── components/              # Reusable components
│       ├── styles/                  # CSS files
│       └── utils/                   # Utilities
├── docker-compose.yml
└── README.md
```

## 🔄 Luồng Hoạt Động

### 1. Khách Hàng Đặt Lịch
```
Khách chọn dịch vụ → Chọn thời gian → Thanh toán
→ Tạo lịch hẹn (CHO_XAC_NHAN)
→ Tạo hóa đơn (unpaid)
```

### 2. Nhân Viên Xác Nhận
```
Nhân viên xác nhận → Cập nhật trạng thái (DA_XAC_NHAN)
→ Tự động xác nhận thanh toán (paid)
→ Tự động trừ sản phẩm (quantity ↓, usage_count ↑)
```

### 3. Hủy Lịch Hẹn
```
Nhân viên hủy → Cập nhật trạng thái (DA_HUY)
→ Tự động hoàn trả sản phẩm (quantity ↑, usage_count ↓)
```

## 🔐 Phân Quyền

| Chức năng | Admin | Manager | Staff | Customer |
|-----------|-------|---------|-------|----------|
| Đặt lịch | ✅ | ✅ | ✅ | ✅ |
| Xác nhận lịch hẹn | ✅ | ✅ | ✅ | ❌ |
| Quản lý kho | ✅ | ✅ | ✅ | ❌ |
| Phiếu nhập/xuất | ✅ | ✅ | ✅ | ❌ |
| Báo cáo doanh thu | ✅ | ✅ | ❌ | ❌ |
| Quản lý nhân viên | ✅ | ✅ | ❌ | ❌ |
| Quản lý khách hàng | ✅ | ✅ | ❌ | ❌ |

## 📊 Database Schema

### Bảng Chính

#### products
- Lưu thông tin sản phẩm
- `quantity`: Số lượng tồn kho
- `usage_count`: Số lần sử dụng

#### service_products
- Liên kết sản phẩm với dịch vụ
- `quantity_per_use`: Số lượng dùng cho 1 lần

#### stock_transactions
- Lịch sử nhập/xuất kho
- `type`: 'in' hoặc 'out'

#### lichhen
- Lịch hẹn của khách
- `trang_thai`: CHO_XAC_NHAN, DA_XAC_NHAN, DA_HUY

#### hoadon
- Hóa đơn thanh toán
- `trang_thai`: unpaid, paid, void

#### thanh_toan
- Chi tiết thanh toán
- `trang_thai`: init, success, failed

## 🛠️ Development

### Build Backend
```bash
cd Backend/demo
./mvnw clean package -DskipTests
```

### Build Frontend
```bash
cd Frontend
npm install
npm run build
```

### Run Tests
```bash
# Backend
cd Backend/demo
./mvnw test

# Frontend
cd Frontend
npm test
```

## 🐛 Debug

### Backend Logs
```bash
docker logs backend -f
```

### Frontend Logs
```bash
docker logs frontend -f
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d webdacsn

# Or use environment variable
$env:PGPASSWORD='kong'; psql -h localhost -U postgres -d webdacsn
```

## 📝 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Products
```
GET    /api/products
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

### Stock Transactions
```
GET  /api/stock-transactions
POST /api/stock-transactions
```

### Appointments
```
GET    /api/lich-hen
POST   /api/lich-hen
PATCH  /api/lich-hen/{id}/actions
```

### Payments
```
POST /api/thanh-toan/momo/create
POST /api/thanh-toan/cash/confirm
GET  /api/thanh-toan/trang-thai
```

### Revenue
```
GET /api/revenue/stats
GET /api/revenue/by-service
GET /api/revenue/by-date
GET /api/revenue/top-customers
```

## 🔧 Configuration

### Backend (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/webdacsn
spring.datasource.username=postgres
spring.datasource.password=kong

# MoMo Configuration
momo.partnerCode=YOUR_PARTNER_CODE
momo.accessKey=YOUR_ACCESS_KEY
momo.secretKey=YOUR_SECRET_KEY
```

### Frontend (proxy)
```javascript
// package.json
"proxy": "http://backend:8080"
```

## 📚 Tài Liệu

- [COMPLETED_FEATURES.md](./COMPLETED_FEATURES.md) - Tổng hợp chức năng đã hoàn thiện
- [FIX_PAYMENT_PRODUCT_DEDUCTION.md](./FIX_PAYMENT_PRODUCT_DEDUCTION.md) - Xác nhận thanh toán
- [FIX_REVENUE_DASHBOARD.md](./FIX_REVENUE_DASHBOARD.md) - Thống kê doanh thu
- [FIX_USAGE_COUNT.md](./FIX_USAGE_COUNT.md) - Số lần sử dụng sản phẩm
- [FIX_STOCK_TRANSACTION.md](./FIX_STOCK_TRANSACTION.md) - Phiếu nhập/xuất

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- MoMo Payment Gateway
- Bootstrap
- Recharts

---

**Version:** 1.0.0  
**Last Updated:** November 24, 2025  
**Status:** ✅ Production Ready
