# 🏨 Hotel Booking Website

![Hotel Booking](https://img.shields.io/badge/Project-Hotel%20Booking-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![SQL Server](https://img.shields.io/badge/Database-SQL%20Server-red)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)

## 📖 Giới thiệu
Website đặt phòng khách sạn là đồ án học phần **"Đồ án I"** tại Trường Quốc tế - Đại học Quốc gia Hà Nội. Hệ thống cho phép người dùng tìm kiếm, đặt phòng khách sạn trực tuyến và quản trị viên quản lý thông tin phòng, đơn đặt.

## ✨ Tính năng chính

### 👤 Cho người dùng
- ✅ Đăng ký và đăng nhập tài khoản
- ✅ Tìm kiếm phòng theo ngày, địa điểm, giá
- ✅ Xem chi tiết phòng (hình ảnh, tiện nghi)
- ✅ Đặt phòng trực tuyến
- ✅ Xem lịch sử đặt phòng

### 👨‍💼 Cho quản trị viên
- ✅ Quản lý thông tin khách sạn và phòng
- ✅ Quản lý đơn đặt (duyệt/hủy)
- ✅ Quản lý người dùng
- ✅ Xem báo cáo doanh thu

## 🛠 Công nghệ sử dụng

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | Microsoft SQL Server |
| **API** | RESTful API |
| **Tools** | Git, VS Code, Postman, SQL Server Management Studio |

## 📁 Cấu trúc dự án

```bash
hotel-booking-project/
├── .vscode/                    # VS Code configuration
│   └── launch.json
├── backend/                    # Server-side application
│   ├── config/                # Configuration files
│   ├── routes/                # API route handlers
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies
│   ├── package-lock.json      # Lock file
│   └── server.js              # Main server file
├── database/                  # Database scripts
│   ├── 01_create_tables.sql  # Create database tables
│   ├── 02_sample_data.sql    # Sample data insertion
│   └── 03_backup_script.sql  # Backup script
├── documentation/             # Project documentation
└── frontend/                  # Client-side application
    ├── admin/                 # Admin panel
    │   ├── dashboard.html    # Admin dashboard
    │   └── login.html        # Admin login
    ├── booking.html          # Room booking page
    ├── index.html           # Homepage
    ├── login.html           # User login
    ├── register.html        # User registration
    ├── script.js            # JavaScript logic
    └── style.css            # CSS styling
```

text

## 🚀 Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (v18+)
- SQL Server (2019+)
- Git

### Bước 1: Clone repository
```bash
git clone https://github.com/hoangmanhkienlg06-rgb/hotel-booking-project.git
cd hotel-booking-project
Bước 2: Cài đặt backend
bash
cd backend
npm install
Bước 3: Cấu hình database
Mở SQL Server Management Studio

Chạy file database/create_tables.sql

Chạy file database/sample_data.sql

Bước 4: Cấu hình environment
Tạo file .env trong thư mục backend/:

env
DB_SERVER=localhost
DB_NAME=HotelBooking
DB_USER=sa
DB_PASSWORD=your_password
PORT=3000
JWT_SECRET=your_secret_key
Bước 5: Khởi chạy server
bash
npm start
# Hoặc cho development
npm run dev
Bước 6: Mở frontend
Mở file frontend/index.html trong trình duyệt

🔗 API Endpoints
Method	Endpoint	Mô tả
POST	/api/auth/register	Đăng ký người dùng
POST	/api/auth/login	Đăng nhập
GET	/api/rooms	Lấy danh sách phòng
POST	/api/bookings	Tạo đơn đặt
GET	/api/admin/bookings	Lấy tất cả đơn đặt (Admin)
PUT	/api/admin/rooms/:id	Cập nhật phòng (Admin)
🗄️ Database Schema
Các bảng chính
Users - Thông tin người dùng

Hotels - Thông tin khách sạn

Rooms - Thông tin phòng

Bookings - Thông tin đặt phòng

Sơ đồ quan hệ
text
Users (1) ──── (M) Bookings
                    │
                    │
Rooms  (1) ──── (M) Bookings
                    │
                    │
Hotels (1) ──── (M) Rooms
📸 Hình ảnh demo
Trang chủ
https://via.placeholder.com/800x400/3498db/ffffff?text=Homepage+-+Hotel+Booking

Trang đặt phòng
https://via.placeholder.com/800x400/2ecc71/ffffff?text=Booking+Page

Trang quản trị
https://via.placeholder.com/800x400/e74c3c/ffffff?text=Admin+Dashboard

👥 Thành viên nhóm
Tên	Vai trò	Công việc chính
Hoàng Mạnh Kiên	Full-stack Developer	Backend API, Database, Integration
Trần Đức Minh	Full-stack Developer	Frontend UI, Design, Testing
🎓 Thông tin học phần
Môn học: Đồ án I

Trường: Trường Quốc tế - Đại học Quốc gia Hà Nội

Giảng viên hướng dẫn: Đỗ Tiến Thành

Thời gian thực hiện: Tháng 11/2025 - Tháng 12/2025

📞 Liên hệ
Email: hoangmanhkienlg06@gmail.com

GitHub: @hoangmanhkienlg06-rgb

Repository: hotel-booking-project
