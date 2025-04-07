require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Mô hình User
const Booking = require('./models/Booking');
const Trip = require('./models/Trip');
const tripRoutes = require('./routes/trips'); // Đảm bảo chỉ khai báo một lần
const authRoutes = require('./routes/auth'); // Đảm bảo chỉ khai báo một lần
const verifyAdmin = require('./middleware/verifyAdmin'); // Import middleware verifyAdmin
const authMiddleware = require('./middleware/auth');
const router = express.Router();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kiểm tra biến môi trường
console.log("🔍 Đang kiểm tra biến môi trường...");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

// Kết nối MongoDB
const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/banvexe';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB đã kết nối thành công!');
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
};

// Tạo tài khoản Admin mặc định nếu chưa có
const createAdminAccount = async() => {
    try {
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10); // Băm mật khẩu
            const adminUser = new User({
                username: 'admin',
                password: hashedPassword, // Đảm bảo mật khẩu đã được băm
                phone: '0123456789',
                role: 'admin'
            });
            await adminUser.save();
            console.log('✅ Tài khoản Admin đã được tạo (username: admin / password: admin123)');
        } else {
            console.log('ℹ️ Admin đã tồn tại');
        }
    } catch (err) {
        console.error('❌ Lỗi tạo tài khoản admin:', err.message);
    }
};

// Gọi hàm khởi tạo DB và Admin
connectDB().then(createAdminAccount);

// Routes
app.use('/api/trips', tripRoutes); // Dùng tripRoutes cho các API chuyến xe
app.use('/api/auth', authRoutes); // Dùng authRoutes cho các API đăng nhập/đăng ký

// API lấy danh sách ghế đã đặt cho chuyến xe
app.get("/api/trips/bookings", async(req, res) => {
    const { tripId } = req.query;

    try {
        // Tìm tất cả các booking cho chuyến xe với tripId
        const bookings = await Booking.find({ tripId });

        // Lấy tất cả ghế đã đặt từ các booking
        const bookedSeats = bookings.flatMap(booking => booking.seats);

        // Trả về danh sách ghế đã đặt
        res.json({ bookedSeats });
    } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu ghế đã đặt", err);
        res.status(500).json({ error: true, message: "Lỗi khi lấy dữ liệu ghế đã đặt" });
    }
});

// API để lưu thông tin đặt vé
app.post('/api/bookings', async(req, res) => {
    const { tripId, customerName, customerPhone, bookedSeats, paymentStatus } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!tripId || !customerName || !customerPhone || !bookedSeats || bookedSeats.length === 0) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    try {
        // Tạo một booking mới
        const newBooking = new Booking({
            tripId,
            customerName,
            customerPhone,
            bookedSeats,
            paymentStatus: paymentStatus || 'pending' // Nếu không có trạng thái thanh toán, mặc định là 'pending'
        });

        // Lưu vào MongoDB
        await newBooking.save();

        // Cập nhật chuyến xe với thông tin booking mới
        const tripData = await Trip.findById(tripId);
        if (tripData) {
            tripData.bookings.push(newBooking._id);
            await tripData.save();
        }

        res.status(201).json({ message: 'Đặt vé thành công', booking: newBooking });
    } catch (err) {
        console.error('❌ Lỗi khi lưu thông tin đặt vé:', err);
        res.status(500).json({ message: 'Lỗi khi lưu thông tin đặt vé' });
    }
});


// API để lấy danh sách vé đã đặt cho admin
router.get('/api/bookings', authMiddleware, async(req, res) => {
    try {
        // Kiểm tra nếu người dùng là admin
        const user = req.user;
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
        }

        // Lấy tất cả booking của chuyến xe và thông tin chuyến xe thông qua populate
        const bookings = await Booking.find()
            .populate('tripId', 'departure destination date time price'); // Lấy các thông tin cần thiết của chuyến xe

        // Trả về danh sách booking
        res.status(200).json(bookings);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách vé:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách vé đã đặt' });
    }
});




// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});