const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


let dbPool = null;
(async () => {
    dbPool = await connectDB();
})();

// ==================== ROUTES ====================


app.get("/", (req, res) => {
    res.json({
        message: " Hotel Booking API",
        version: "1.0.0",
        status: "running",
        database: process.env.DB_NAME || "not connected",
        endpoints: [
            "GET /",
            "GET /api/test",
            "GET /api/rooms",
            "GET /api/hotels",
            "GET /api/db-status",
            "GET /api/db-test",
            "GET /api/db-info",
            "GET /api/tables"
        ]
    });
});

// 2. TEST ENDPOINT
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working!",
        time: new Date().toISOString()
    });
});

// 3. GET ROOMS FROM DATABASE
app.get("/api/rooms", async (req, res) => {
    try {
        if (!dbPool) {
            return res.json({ 
                success: false, 
                message: "Database not connected" 
            });
        }

        const result = await dbPool.request().query(`
            SELECT * FROM Rooms 
            WHERE is_available = 1
            ORDER BY price_per_night
        `);
        
        res.json({ 
            success: true, 
            data: result.recordset,
            count: result.recordset.length,
            message: "Dữ liệu từ SQL Server database"
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server",
            error: error.message 
        });
    }
});

// 4. GET HOTELS FROM DATABASE
app.get("/api/hotels", async (req, res) => {
    try {
        if (!dbPool) {
            return res.json({ success: false, message: "Database not connected" });
        }
        
        const result = await dbPool.request().query(`
            SELECT * FROM Hotels 
            ORDER BY rating DESC
        `);
        
        res.json({ 
            success: true, 
            data: result.recordset 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server",
            error: error.message 
        });
    }
});

// 5. DATABASE STATUS
app.get("/api/db-status", (req, res) => {
    res.json({
        success: true,
        message: "Database status checked",
        database: process.env.DB_NAME || "HotelBooking",
        status: dbPool ? "connected" : "disconnected",
        time: new Date().toISOString(),
        server_time: new Date().toLocaleString("vi-VN")
    });
});

// 6. DATABASE TEST CONNECTION
app.get("/api/db-test", async (req, res) => {
    try {
        if (!dbPool) {
            return res.json({
                success: false,
                message: " Chưa kết nối được database",
                connection: "disconnected"
            });
        }

        const result = await dbPool.request().query("SELECT @@VERSION as version");
        
        res.json({
            success: true,
            message: " Kết nối database thành công",
            database: process.env.DB_NAME,
            server: process.env.DB_HOST,
            port: process.env.DB_PORT,
            version: result.recordset[0].version.substring(0, 100),
            connection: "connected",
            time: new Date().toLocaleString("vi-VN")
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: " Lỗi kết nối database",
            error: error.message
        });
    }
});

// 7. DATABASE INFO DETAILS
app.get("/api/db-info", async (req, res) => {
    try {
        if (!dbPool) {
            return res.json({ success: false, message: "Database not connected" });
        }
        
        const tables = await dbPool.request().query(`
            SELECT 
                TABLE_NAME,
                (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_NAME = t.TABLE_NAME) as column_count
            FROM INFORMATION_SCHEMA.TABLES t
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        const dbInfo = await dbPool.request().query(`
            SELECT 
                DB_NAME() as database_name,
                @@VERSION as sql_version,
                GETDATE() as server_time
        `);
        
        res.json({
            success: true,
            database: dbInfo.recordset[0],
            tables: tables.recordset,
            connection: {
                server: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                status: "connected"
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server",
            error: error.message 
        });
    }
});

// 8. GET TABLES LIST
app.get("/api/tables", async (req, res) => {
    try {
        if (!dbPool) {
            return res.json({
                success: false,
                message: "Chưa kết nối database"
            });
        }

        const result = await dbPool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
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

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`
==================================================
 SERVER IS RUNNING
 http://localhost:${PORT}
 ${new Date().toLocaleString("vi-VN")}
==================================================
 AVAILABLE ENDPOINTS:
   1. GET  /              - API Information
   2. GET  /api/test      - Test API
   3. GET  /api/rooms     - Danh sách phòng (FROM DATABASE)
   4. GET  /api/hotels    - Danh sách khách sạn
   5. GET  /api/db-status - Database status
   6. GET  /api/db-test   - Test database connection
   7. GET  /api/db-info   - Database details
   8. GET  /api/tables    - List all tables
==================================================
 Press Ctrl + C to stop the server
    `);
});
