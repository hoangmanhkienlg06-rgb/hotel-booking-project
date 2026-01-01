-- FILE: 02_sample_data.sql
-- CHÈN DỮ LIỆU MẪU

-- Users
INSERT INTO Users (email, password_hash, full_name, phone) VALUES
('john@email.com', 'hashed_password_1', 'John Doe', '0912345678'),
('jane@email.com', 'hashed_password_2', 'Jane Smith', '0987654321');

-- Hotels
INSERT INTO Hotels (name, address, city, rating) VALUES
('Grand Hotel', '123 Main Street', 'Hanoi', 4.5),
('Sea View Resort', '456 Beach Road', 'Da Nang', 4.7);

-- Rooms
INSERT INTO Rooms (hotel_id, room_type, price_per_night, max_guests, amenities) VALUES
(1, 'Standard', 500000, 2, 'TV, WiFi, AC'),
(1, 'Deluxe', 800000, 3, 'TV, WiFi, AC, Mini Bar'),
(2, 'Suite', 1200000, 4, 'TV, WiFi, AC, Mini Bar, Ocean View');

PRINT '✅ Sample data inserted successfully';