const path = require('path');
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const sql = require("./config/db").sql;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============ PHỤC VỤ FRONTEND FILES ============
app.use(express.static(path.join(__dirname, '../frontend')));

let dbPool = null;
(async () => {
    dbPool = await connectDB();
})();

// ==================== ADMIN ROUTES ====================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
        });
    }
    
    // Admin accounts - should be moved to environment variables or database in production
    const adminAccounts = [
        { 
            username: 'admin', 
            password: 'admin123', 
            name: 'Quản trị viên Hệ thống'
        },
        { 
            username: 'manager', 
            password: 'manager123', 
            name: 'Quản lý Khách sạn'
        }
    ];
    
    const admin = adminAccounts.find(acc => 
        acc.username === username && acc.password === password
    );
    
    if (admin) {
        const token = `admin-token-${username}-${Date.now()}`;
        
        res.json({
            success: true,
            message: 'Đăng nhập quản trị thành công',
            token: token,
            user: {
                username: admin.username,
                name: admin.name,
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Sai tên đăng nhập hoặc mật khẩu'
        });
    }
});

app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: 'Không có token' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token && token.startsWith('admin-token-')) {
        res.json({
            success: true,
            valid: true,
            message: 'Token hợp lệ'
        });
    } else {
        res.status(401).json({
            success: false,
            valid: false,
            message: 'Token không hợp lệ'
        });
    }
});

// ==================== ROOT ENDPOINT ====================
app.get("/", (req, res) => {
    res.json({
        message: "🏨 Hotel Booking API",
        version: "1.0.0",
        status: "running",
        server_time: new Date().toLocaleString("vi-VN")
    });
});

// ==================== TEST ENDPOINT ====================
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "✅ API is working!",
        server_time: new Date().toLocaleString("vi-VN")
    });
});

// ==================== ROOM MANAGEMENT ====================
app.get("/api/rooms", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const result = await dbPool.request().query(`
            SELECT r.room_id, r.room_type, r.price_per_night, r.max_guests, r.amenities, r.is_available,
                   h.name AS hotel_name, h.city AS hotel_city
            FROM Rooms r
            LEFT JOIN Hotels h ON r.hotel_id = h.hotel_id
            ORDER BY r.price_per_night
        `);
        
        res.json({ 
            success: true, 
            data: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error("❌ Lỗi lấy phòng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

app.get("/api/rooms/:id", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const roomId = parseInt(req.params.id, 10);
        const result = await dbPool.request()
            .input('roomId', roomId)
            .query(`
                SELECT TOP 1 r.room_id, r.room_type, r.price_per_night, r.max_guests, r.amenities, r.is_available,
                       h.name AS hotel_name, h.city AS hotel_city
                FROM Rooms r
                LEFT JOIN Hotels h ON r.hotel_id = h.hotel_id
                WHERE r.room_id = @roomId
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error("❌ Lỗi lấy phòng theo ID:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

app.post("/api/rooms", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ success: false, message: "Database not connected" });
        }

        const { hotel_id, room_type, price_per_night, max_guests, amenities, is_available = true } = req.body;

        if (!room_type || price_per_night == null) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin phòng" });
        }

        const insertResult = await dbPool.request()
            .input('hotel_id', hotel_id || null)
            .input('room_type', room_type)
            .input('price_per_night', price_per_night)
            .input('max_guests', max_guests || 2)
            .input('amenities', amenities || '')
            .input('is_available', is_available ? 1 : 0)
            .query(`
                INSERT INTO Rooms (hotel_id, room_type, price_per_night, max_guests, amenities, is_available)
                OUTPUT INSERTED.room_id
                VALUES (@hotel_id, @room_type, @price_per_night, @max_guests, @amenities, @is_available)
            `);

        res.status(201).json({ success: true, room_id: insertResult.recordset[0].room_id });
    } catch (error) {
        console.error("❌ Lỗi thêm phòng:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

app.put("/api/rooms/:id", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ success: false, message: "Database not connected" });
        }

        const roomId = parseInt(req.params.id, 10);
        const { room_type, price_per_night, max_guests, amenities, is_available } = req.body;

        const result = await dbPool.request()
            .input('room_id', roomId)
            .input('room_type', room_type)
            .input('price_per_night', price_per_night)
            .input('max_guests', max_guests)
            .input('amenities', amenities)
            .input('is_available', is_available === undefined ? null : (is_available ? 1 : 0))
            .query(`
                UPDATE Rooms
                SET 
                    room_type = COALESCE(@room_type, room_type),
                    price_per_night = COALESCE(@price_per_night, price_per_night),
                    max_guests = COALESCE(@max_guests, max_guests),
                    amenities = COALESCE(@amenities, amenities),
                    is_available = COALESCE(@is_available, is_available)
                WHERE room_id = @room_id;

                SELECT room_id, room_type, price_per_night, max_guests, amenities, is_available
                FROM Rooms WHERE room_id = @room_id;
            `);

        res.json({ success: true, room: result.recordset[0] });
    } catch (error) {
        console.error("❌ Lỗi cập nhật phòng:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

// ==================== HOTEL MANAGEMENT ====================
app.get("/api/hotels", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }
        
        const result = await dbPool.request().query(`
            SELECT * FROM Hotels ORDER BY rating DESC
        `);
        
        res.json({ 
            success: true, 
            data: result.recordset,
            count: result.recordset.length 
        });
    } catch (error) {
        console.error("❌ Lỗi lấy khách sạn:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

// ==================== DATABASE STATUS ====================
app.get("/api/db-status", (req, res) => {
    res.json({
        success: true,
        database: process.env.DB_NAME || "HotelBooking",
        status: dbPool ? "connected" : "disconnected",
        server_time: new Date().toLocaleString("vi-VN")
    });
});

// ==================== DATABASE TEST ====================
app.get("/api/db-test", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Chưa kết nối database"
            });
        }

        const result = await dbPool.request().query("SELECT @@VERSION as version");
        
        res.json({
            success: true,
            message: "✅ Kết nối database thành công",
            database: process.env.DB_NAME,
            version: result.recordset[0].version.substring(0, 100)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi kết nối database", 
            error: error.message
        });
    }
});

// ==================== GET TABLES ====================
app.get("/api/tables", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Chưa kết nối database"
            });
        }

        const result = await dbPool.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            ORDER BY TABLE_NAME
        `);

        res.json({ 
            success: true, 
            tables: result.recordset, 
            count: result.recordset.length 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi truy vấn", 
            error: error.message 
        });
    }
});

// ==================== USER AUTHENTICATION ====================
app.post("/api/auth/register", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const { email, password, full_name, phone } = req.body;
        
        if (!email || !password || !full_name) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đầy đủ thông tin" 
            });
        }

        const checkResult = await dbPool.request()
            .input('email', email)
            .query(`SELECT email FROM Users WHERE email = @email`);
            
        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Email đã tồn tại" 
            });
        }

        await dbPool.request()
            .input('email', email)
            .input('password', password)
            .input('full_name', full_name)
            .input('phone', phone || null)
            .query(`
                INSERT INTO Users (email, password_hash, full_name, phone, created_at) 
                VALUES (@email, @password, @full_name, @phone, GETDATE())
            `);

        res.status(201).json({ 
            success: true, 
            message: "✅ Đăng ký thành công!"
        });
    } catch (error) {
        console.error("❌ Lỗi đăng ký:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập email và mật khẩu" 
            });
        }

        const result = await dbPool.request()
            .input('email', email)
            .input('password', password)
            .query(`
                SELECT user_id, email, full_name, phone 
                FROM Users 
                WHERE email = @email AND password_hash = @password
            `);
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: "Email hoặc mật khẩu không đúng" 
            });
        }

        const user = result.recordset[0];
        const token = `user-token-${user.user_id}-${Date.now()}`;
        
        res.json({ 
            success: true, 
            message: "✅ Đăng nhập thành công", 
            token: token, 
            user: user 
        });
    } catch (error) {
        console.error("❌ Lỗi đăng nhập:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

// ==================== BOOKING MANAGEMENT ====================
app.get("/api/bookings", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const result = await dbPool.request().query(`
            SELECT TOP 50 
                b.booking_id, b.room_id, b.user_id, b.check_in_date, b.check_out_date, 
                b.total_price, b.status, b.created_at,
                u.full_name AS guest_name, u.email AS guest_email
            FROM Bookings b
            LEFT JOIN Users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
        `);
        
        res.json({ 
            success: true, 
            bookings: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error("❌ Lỗi GET bookings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server: " + error.message 
        });
    }
});

app.post("/api/bookings", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const { room_id, check_in_date, check_out_date, guests, guest_name, guest_email, guest_phone, user_id } = req.body;
        
        if (!room_id || !check_in_date || !check_out_date || !guest_name || !guest_email) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập đầy đủ thông tin đặt phòng" 
            });
        }

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: "Ngày nhận/trả phòng không hợp lệ"
            });
        }

        const roomResult = await dbPool.request()
            .input('roomId', room_id)
            .query(`SELECT TOP 1 room_id, price_per_night FROM Rooms WHERE room_id = @roomId`);

        if (!roomResult.recordset.length) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy phòng" 
            });
        }

        const room = roomResult.recordset[0];
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * Number(room.price_per_night);

        // Map booking to existing user by email if possible
        let mappedUserId = user_id || null;
        if (!mappedUserId && guest_email) {
            const userResult = await dbPool.request()
                .input('email', guest_email)
                .query(`SELECT TOP 1 user_id FROM Users WHERE email = @email`);
            if (userResult.recordset.length) {
                mappedUserId = userResult.recordset[0].user_id;
            }
        }

        const insertResult = await dbPool.request()
            .input('userId', mappedUserId)
            .input('roomId', room.room_id)
            .input('checkIn', check_in_date)
            .input('checkOut', check_out_date)
            .input('totalPrice', totalPrice)
            .query(`
                INSERT INTO Bookings (user_id, room_id, check_in_date, check_out_date, total_price, status, created_at)
                OUTPUT INSERTED.booking_id, INSERTED.created_at
                VALUES (@userId, @roomId, @checkIn, @checkOut, @totalPrice, 'confirmed', GETDATE())
            `);

        const newBooking = insertResult.recordset[0];

        res.status(201).json({ 
            success: true, 
            message: "🎉 Đặt phòng thành công!",
            booking: {
                booking_id: newBooking.booking_id,
                room_id: room.room_id,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                guest_name,
                guest_email,
                guest_phone,
                guests: guests || 2,
                total_price: totalPrice,
                status: 'confirmed',
                created_at: newBooking.created_at
            }
        });
    } catch (error) {
        console.error("❌ Lỗi đặt phòng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

// ==================== ADMIN API ====================
app.get("/api/admin/bookings", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const result = await dbPool.request().query(`
            SELECT b.booking_id, b.room_id, b.user_id, b.check_in_date, b.check_out_date, 
                   b.total_price, b.status, b.created_at,
                   u.full_name AS guest_name, u.email AS guest_email
            FROM Bookings b
            LEFT JOIN Users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
        `);
        
        res.json({ 
            success: true, 
            bookings: result.recordset, 
            count: result.recordset.length 
        });
    } catch (error) {
        console.error("❌ Lỗi lấy tất cả booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

app.get("/api/admin/bookings/:id", async (req, res) => {
    try {
        if (!dbPool) return res.status(500).json({ success: false, message: "Database not connected" });

        const bookingId = parseInt(req.params.id, 10);
        const result = await dbPool.request()
            .input('booking_id', bookingId)
            .query(`
                SELECT b.*, u.full_name AS guest_name, u.email AS guest_email, r.room_type
                FROM Bookings b
                LEFT JOIN Users u ON b.user_id = u.user_id
                LEFT JOIN Rooms r ON b.room_id = r.room_id
                WHERE b.booking_id = @booking_id
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy booking" });
        }

        res.json({ success: true, booking: result.recordset[0] });
    } catch (error) {
        console.error("❌ Lỗi lấy booking detail:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

app.patch("/api/admin/bookings/:id/status", async (req, res) => {
    try {
        if (!dbPool) return res.status(500).json({ success: false, message: "Database not connected" });

        const bookingId = parseInt(req.params.id, 10);
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: "Thiếu trạng thái" });

        await dbPool.request()
            .input('booking_id', bookingId)
            .input('status', status)
            .query(`
                UPDATE Bookings SET status = @status WHERE booking_id = @booking_id;
            `);

        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái booking:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

app.get("/api/admin/users", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const result = await dbPool.request().query(`
            SELECT user_id, email, full_name, phone, created_at 
            FROM Users 
            ORDER BY created_at DESC
        `);
        
        res.json({ 
            success: true, 
            users: result.recordset, 
            count: result.recordset.length 
        });
    } catch (error) {
        console.error("❌ Lỗi lấy users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server", 
            error: error.message 
        });
    }
});

app.get("/api/admin/users/:id", async (req, res) => {
    try {
        if (!dbPool) return res.status(500).json({ success: false, message: "Database not connected" });

        const userId = parseInt(req.params.id, 10);
        const result = await dbPool.request()
            .input('user_id', userId)
            .query(`
                SELECT user_id, email, full_name, phone, created_at,
                       ISNULL(is_locked, 0) AS is_locked
                FROM Users
                WHERE user_id = @user_id
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        res.json({ success: true, user: result.recordset[0] });
    } catch (error) {
        console.error("❌ Lỗi lấy user detail:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

const ensureUserLockColumn = async () => {
    await dbPool.request().query(`
        IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE Name = N'is_locked' AND Object_ID = Object_ID(N'Users')
        )
        BEGIN
            ALTER TABLE Users ADD is_locked BIT NOT NULL CONSTRAINT DF_Users_is_locked DEFAULT 0;
        END
    `);
};

app.patch("/api/admin/users/:id/lock", async (req, res) => {
    try {
        if (!dbPool) return res.status(500).json({ success: false, message: "Database not connected" });

        const userId = parseInt(req.params.id, 10);
        const { locked } = req.body;
        await ensureUserLockColumn();

        await dbPool.request()
            .input('user_id', userId)
            .input('locked', locked ? 1 : 0)
            .query(`UPDATE Users SET is_locked = @locked WHERE user_id = @user_id;`);

        res.json({ success: true, message: locked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" });
    } catch (error) {
        console.error("❌ Lỗi khóa/mở khóa user:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
});

// ==================== ADMIN DASHBOARD ====================
app.get("/api/admin/dashboard", async (req, res) => {
    try {
        if (!dbPool) {
            return res.status(500).json({
                success: false,
                message: "Database not connected"
            });
        }

        const totalsQuery = await dbPool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Users) AS totalUsers,
                (SELECT COUNT(*) FROM Bookings) AS totalBookings,
                (
                    SELECT ISNULL(SUM(total_price), 0) 
                    FROM Bookings 
                    WHERE status IN ('confirmed','completed','paid','paid_out')
                ) AS totalRevenue
        `);

        const statsQuery = await dbPool.request().query(`
            SELECT 
                CONVERT(VARCHAR(10), created_at, 120) AS date,
                COUNT(*) AS bookings,
                ISNULL(SUM(total_price), 0) AS revenue
            FROM Bookings
            WHERE created_at >= DATEADD(day, -30, GETDATE())
            GROUP BY CONVERT(VARCHAR(10), created_at, 120)
            ORDER BY date
        `);

        res.json({
            success: true,
            totalUsers: totalsQuery.recordset[0].totalUsers,
            totalBookings: totalsQuery.recordset[0].totalBookings,
            totalRevenue: Number(totalsQuery.recordset[0].totalRevenue),
            bookingStats: statsQuery.recordset
        });
    } catch (error) {
        console.error("❌ Lỗi lấy dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
});

// ==================== TEST API ====================
app.get("/api/booking-test", (req, res) => {
    res.json({
        success: true,
        message: "🎯 TEST THÀNH CÔNG!",
        timestamp: new Date().toLocaleString("vi-VN"),
        status: `Server đang chạy trên port ${PORT}`
    });
});

app.post("/api/booking-test", (req, res) => {
    console.log("📦 Test booking data:", req.body);
    res.status(201).json({
        success: true,
        message: "🎉 Booking test thành công!",
        booking_id: Math.floor(Math.random() * 10000),
        data_received: req.body
    });
});

// ==================== FALLBACK ROUTES ====================
// Route cứng cho admin pages
app.get('/admin/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/login.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`
==================================================
 🚀 SERVER IS RUNNING
 http://localhost:${PORT}
 ${new Date().toLocaleString("vi-VN")}
==================================================
 ✅ ADMIN PAGES:
   http://localhost:${PORT}/admin/login.html
   http://localhost:${PORT}/admin/dashboard.html
==================================================
Press Ctrl + C to stop the server
    `);
});