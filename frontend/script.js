// API base URL
const API_URL = 'http://localhost:3000/api';

// Hiển thị danh sách phòng
async function loadRooms() {
    try {
        const response = await fetch(`${API_URL}/rooms`);
        const rooms = await response.json();
        
        const roomList = document.getElementById('room-list');
        if (!roomList) return;
        
        roomList.innerHTML = '';
        
        rooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.innerHTML = `
                <h3>${room.room_type} - ${room.hotel_name}</h3>
                <p>📍 ${room.hotel_city}</p>
                <p>👥 Tối đa: ${room.max_guests} người</p>
                <p>🛏️ Tiện nghi: ${room.amenities}</p>
                <div class="price">${room.price_per_night.toLocaleString()} VNĐ/đêm</div>
                <button class="book-btn" onclick="bookRoom(${room.room_id})">
                    Đặt ngay
                </button>
            `;
            roomList.appendChild(roomCard);
        });
    } catch (error) {
        console.error('Lỗi tải phòng:', error);
        document.getElementById('room-list').innerHTML = 
            '<p style="color: red;">Không thể tải danh sách phòng. Vui lòng thử lại sau.</p>';
    }
}

// Đặt phòng
function bookRoom(roomId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để đặt phòng!');
        window.location.href = 'login.html';
        return;
    }
    
    window.location.href = `booking.html?roomId=${roomId}`;
}

// Kiểm tra đăng nhập
function checkLogin() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const nav = document.querySelector('nav div');
        if (nav) {
            nav.innerHTML += `
                <span style="color: white; padding: 8px 16px;">
                    Xin chào, ${JSON.parse(user).full_name}
                </span>
                <a href="#" onclick="logout()">Đăng xuất</a>
            `;
        }
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Chạy khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    loadRooms();
    checkLogin();
});