const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Tài khoản admin mẫu
const adminAccounts = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@hotel.com',
        password: 'admin123',
        fullName: 'Quản trị viên',
        role: 'admin',
        permissions: ['all']
    },
    {
        id: 2,
        username: 'manager',
        email: 'manager@hotel.com',
        password: 'manager123',
        fullName: 'Quản lý',
        role: 'admin',
        permissions: ['view', 'edit', 'manage_bookings']
    }
];

// ==================== ĐĂNG NHẬP ADMIN ====================
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
        }
        
        // Tìm tài khoản admin (có thể nhập username hoặc email)
        const admin = adminAccounts.find(account => 
            account.username === username || 
            account.email === username
        );
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại'
            });
        }
        
        // Kiểm tra mật khẩu (trong thực tế nên dùng bcrypt)
        if (password !== admin.password) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }
        
        // Tạo JWT token
        const token = jwt.sign(
            {
                userId: admin.id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: 'admin'
            },
            'admin-secret-key-123456', // Nên lưu trong .env
            { expiresIn: '8h' }
        );
        
        // Trả về kết quả thành công
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: 'admin'
            }
        });
        
    } catch (error) {
        console.error('Lỗi đăng nhập admin:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
});

// ==================== KIỂM TRA TOKEN ====================
router.get('/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'Không có token' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token không hợp lệ' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, 'admin-secret-key-123456');
        
        // Kiểm tra role admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Không có quyền truy cập' 
            });
        }
        
        res.json({
            success: true,
            user: decoded
        });
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token đã hết hạn' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token không hợp lệ' 
            });
        }
        
        console.error('Lỗi verify token:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ' 
        });
    }
});

// ==================== ĐĂNG XUẤT ====================
router.post('/logout', (req, res) => {
    // Trong thực tế có thể thêm token vào blacklist
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

// ==================== LẤY THÔNG TIN ADMIN ====================
router.get('/profile', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ success: false });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'admin-secret-key-123456');
        
        // Tìm admin từ database
        const admin = adminAccounts.find(acc => acc.id === decoded.userId);
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy tài khoản' 
            });
        }
        
        res.json({
            success: true,
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role
            }
        });
        
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

module.exports = router;