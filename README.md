🏨 Hotel Booking Website - Đồ án I
📖 1. Giới thiệu
Dự án được thực hiện trong khuôn khổ học phần "Đồ án I" tại Trường Quốc tế - Đại học Quốc gia Hà Nội (VNU-IS). Mục tiêu là xây dựng một nền tảng quản lý lưu trú trực tuyến, giúp tối ưu hóa toàn bộ quy trình tương tác giữa khách hàng và bộ phận quản lý khách sạn.

✨ 2. Tính năng chính
👤 Cho khách hàng
Hệ thống tài khoản: Đăng ký, đăng nhập với bảo mật JWT.

Tìm kiếm thông minh: Lọc phòng theo ngày trống, địa điểm và ngân sách.

Quy trình đặt phòng: Xem chi tiết phòng, chọn ngày và gửi yêu cầu đặt phòng thời gian thực.

Cá nhân hóa: Quản lý lịch sử đặt phòng và theo dõi trạng thái đơn.

👨‍💼 Cho quản trị viên (Dashboard)
Quản lý khách sạn: Thêm, sửa, xóa thông tin khách sạn và các loại phòng.

Xử lý giao dịch: Duyệt hoặc hủy đơn đặt phòng của khách hàng.

Thống kê & Báo cáo: Theo dõi doanh thu, phân tích biểu đồ tăng trưởng người dùng.

🛠 3. Công nghệ sử dụng
Hệ thống được xây dựng theo mô hình Client-Server:

Phần	Công nghệ
Frontend	HTML5, CSS3 (Flexbox/Grid), JavaScript ES6, Fetch API
Backend	Node.js, Express.js
Database	Microsoft SQL Server (sử dụng Stored Procedures)
Bảo mật	JWT (JSON Web Token) & Bcrypt
📁 4. Cấu trúc dự án
```bash
hotel-booking-project/
├── .vscode/
│   └── launch.json
├── backend/                  # Server-side application
│   ├── config/              # Kết nối Database
│   ├── routes/              # Định nghĩa các API Endpoints
│   ├── .env                 # Biến môi trường
│   ├── package.json         # Dependencies
│   ├── package-lock.json    # Lock file
│   └── server.js            # Điểm khởi chạy ứng dụng
├── database/                # Script quản lý dữ liệu
│   ├── 01_create_tables.sql # Tạo bảng và ràng buộc
│   ├── 02_sample_data.sql   # Dữ liệu mẫu để demo
│   └── 03_backup_script.sql # Script backup
└── frontend/                # Client-side (Giao diện người dùng)
    ├── admin/               # Giao diện dành cho quản trị
    │   ├── dashboard.html   # Admin dashboard
    │   └── login.html       # Admin login
    ├── booking.html         # Trang đặt phòng
    ├── index.html           # Trang chủ
    ├── login.html           # User login
    ├── register.html        # User registration
    ├── script.js            # Logic xử lý phía người dùng
    └── style.css            # CSS styling
🚀 5. Hướng dẫn cài đặt
Bước 1: Cài đặt Database
Mở SQL Server Management Studio (SSMS)

Chạy lần lượt các file trong thư mục /database:

01_schema.sql

02_procedures.sql

03_seed_data.sql

Bước 2: Cấu hình Backend
Di chuyển vào thư mục backend:

bash
cd backend
Cài đặt dependencies:

bash
npm install
Tạo file .env và cấu hình:

env
PORT=3000
DB_SERVER=localhost
DB_NAME=HotelBooking
DB_USER=sa
DB_PASSWORD=your_password
JWT_SECRET=hotel_booking_secret_2025
Bước 3: Khởi chạy ứng dụng
Chạy server backend:

bash
npm start
Mở trình duyệt và truy cập:

Frontend: Mở file frontend/index.html

Backend API: http://localhost:3000

🗄️ 6. Mô hình cơ sở dữ liệu
Các bảng chính trong hệ thống:

Users: Thông tin người dùng và phân quyền (User/Admin)

Hotels: Thông tin khách sạn

Rooms: Thông tin các phòng trong khách sạn

Bookings: Lưu trữ giao dịch đặt phòng (ngày nhận/trả, tổng tiền)

(Chi tiết quan hệ giữa các bảng có trong file 01_schema.sql)

👥 7. Thành viên nhóm
Họ và tên	Vai trò	Công việc phụ trách
Hoàng Mạnh Kiên	Nhóm trưởng	Thiết kế Database, Xây dựng API Backend, Bảo mật hệ thống
Trần Đức Minh	Thành viên	Phát triển giao diện (UI/UX), Kết nối API Frontend
