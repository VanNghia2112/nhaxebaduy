const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error("❌ Lỗi: MONGO_URI không được tìm thấy trong .env");
            process.exit(1);
        }

        await mongoose.connect(mongoURI); // Không cần các options cũ nữa
        console.log('✅ MongoDB đã kết nối thành công!');
    } catch (err) {
        console.error('❌ Lỗi kết nối MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;