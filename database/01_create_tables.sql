-- FILE: 01_create_tables.sql
-- TẠO CÁC BẢNG CHO DATABASE HOTELBOOKING

-- 1. BẢNG USERS
CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

-- 2. BẢNG HOTELS
CREATE TABLE Hotels (
    hotel_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(500),
    city NVARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.0
);

-- 3. BẢNG ROOMS
CREATE TABLE Rooms (
    room_id INT PRIMARY KEY IDENTITY(1,1),
    hotel_id INT FOREIGN KEY REFERENCES Hotels(hotel_id),
    room_type NVARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INT DEFAULT 2,
    amenities NVARCHAR(500),
    is_available BIT DEFAULT 1
);

-- 4. BẢNG BOOKINGS
CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT FOREIGN KEY REFERENCES Users(user_id),
    room_id INT FOREIGN KEY REFERENCES Rooms(room_id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE()
);

PRINT ' 4 tables created successfully';
