const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'HotelBooking',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log(' KẾT NỐI SQL SERVER THÀNH CÔNG');
        console.log(` Database: ${config.database}`);
        console.log(` Server: ${config.server}:${config.port}`);
        return pool;
    } catch (err) {
        console.error(' LỖI KẾT NỐI DATABASE:', err.message);
        console.log(' Đang chạy ở chế độ không database...');
        return null;
    }
};

module.exports = { connectDB, sql };
