const express = require("express");
const router = express.Router();

const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const verifyAdmin = require('../middleware/verifyAdmin');

// 🔹 Danh sách tuyến đường & điểm đón/trả
const routes = {
    "Lagi - TP. Hồ Chí Minh": {
        pickupPoints: ["Chợ Lagi", "Chợ Tân An", "Công viên Bác Hồ", "Trung tâm hành chính Huyện Hàm Tân"],
        dropOffPoints: ["Bến Xe Miền Đông", "Quận 1", "Quận 2", "Bình Thạnh", "Thủ Đức"]
    },
    "TP. Hồ Chí Minh - Lagi": {
        pickupPoints: ["Bến Xe Miền Đông", "Quận 1", "Thủ Đức"],
        dropOffPoints: ["Chợ Lagi", "Công viên Bác Hồ"]
    },
    "Lagi - Đà Lạt": {
        pickupPoints: ["Chợ Lagi", "Bến xe Lagi"],
        dropOffPoints: ["Chợ Đà Lạt", "Hồ Xuân Hương"]
    },
    "Đà Lạt - Lagi": {
        pickupPoints: ["Chợ Đà Lạt", "Hồ Xuân Hương"],
        dropOffPoints: ["Bến xe Lagi", "Chợ Lagi"]
    },
    "Lagi - Nha Trang": {
        pickupPoints: ["Chợ Lagi", "Trung tâm Lagi"],
        dropOffPoints: ["Bến xe Phía Nam", "Chợ Đầm"]
    },
    "Nha Trang - Lagi": {
        pickupPoints: ["Chợ Đầm", "Vinpearl Nha Trang"],
        dropOffPoints: ["Chợ Lagi"]
    }
};

// 🔹 Danh sách mẫu tuyến và thời gian
const routeTemplates = [
    // Lagi ⇄ TP.HCM
    { route: "Lagi - TP. Hồ Chí Minh", time: "06:00", price: 200000 },
    { route: "Lagi - TP. Hồ Chí Minh", time: "12:00", price: 200000 },
    { route: "Lagi - TP. Hồ Chí Minh", time: "18:00", price: 200000 },
    { route: "TP. Hồ Chí Minh - Lagi", time: "06:00", price: 200000 },
    { route: "TP. Hồ Chí Minh - Lagi", time: "12:00", price: 200000 },
    { route: "TP. Hồ Chí Minh - Lagi", time: "18:00", price: 200000 },

    // Lagi ⇄ Đà Lạt
    { route: "Lagi - Đà Lạt", time: "06:00", price: 299000 },
    { route: "Lagi - Đà Lạt", time: "12:00", price: 299000 },
    { route: "Lagi - Đà Lạt", time: "18:00", price: 299000 },
    { route: "Đà Lạt - Lagi", time: "06:00", price: 299000 },
    { route: "Đà Lạt - Lagi", time: "12:00", price: 299000 },
    { route: "Đà Lạt - Lagi", time: "18:00", price: 299000 },

    // Lagi ⇄ Nha Trang
    { route: "Lagi - Nha Trang", time: "06:00", price: 345000 },
    { route: "Lagi - Nha Trang", time: "12:00", price: 345000 },
    { route: "Lagi - Nha Trang", time: "18:00", price: 345000 },
    { route: "Nha Trang - Lagi", time: "06:00", price: 345000 },
    { route: "Nha Trang - Lagi", time: "12:00", price: 345000 },
    { route: "Nha Trang - Lagi", time: "18:00", price: 345000 }
];

// 🔹 Sinh danh sách chuyến xe cho tháng 4/2025 (chạy một lần)
async function generateTripsIfNotExist() {
    const year = 2025;
    const month = 3; // Tháng 4 (JS bắt đầu từ 0)

    for (let day = 1; day <= 30; day++) {
        const dateStr = new Date(year, month, day).toISOString().split("T")[0];
        for (const template of routeTemplates) {
            const exists = await Trip.findOne({
                departure: template.route.split(" - ")[0],
                destination: template.route.split(" - ")[1],
                date: dateStr,
                time: template.time
            });

            if (!exists) {
                await Trip.create({
                    departure: template.route.split(" - ")[0],
                    destination: template.route.split(" - ")[1],
                    date: dateStr,
                    time: template.time,
                    price: template.price,
                    bookings: []
                });
            }
        }
    }
}

generateTripsIfNotExist(); // Gọi khi khởi động app

// 🔹 Lấy điểm đón/trả theo tuyến
router.get("/pickup-points", (req, res) => {
    const { route } = req.query;

    if (!routes[route]) {
        return res.status(404).json({ message: "Không tìm thấy tuyến đường này!" });
    }

    res.json(routes[route]);
});

// 🔹 API lấy danh sách chuyến theo tuyến & ngày (cả 2 chiều)
router.get("/", async(req, res) => {
    const { route, date } = req.query;

    if (!route || !date) {
        return res.status(400).json({ message: "Thiếu thông tin tuyến hoặc ngày!" });
    }

    const [from, to] = route.split(" - ");

    const trips = await Trip.find({
        date,
        $or: [
            { departure: from, destination: to },
            { departure: to, destination: from }
        ]
    });

    if (!trips || trips.length === 0) {
        return res.status(404).json({ message: "Không có chuyến xe nào trong ngày này!" });
    }

    res.json(trips);
});


// 🔹 API lấy ghế đã đặt
router.get("/bookings", async(req, res) => {
    const { date, time } = req.query;

    try {
        const bookings = await Booking.find({ date, time });
        const bookedSeats = bookings.map(b => b.seat);
        res.json({ bookedSeats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy ghế đã đặt" });
    }
});

// API đặt vé
router.post("/bookings", async(req, res) => {
    const { tripId, seats, customerName, customerPhone, paymentStatus } = req.body;

    try {
        // Kiểm tra chuyến xe có tồn tại không
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(400).json({ message: "Chuyến xe không tồn tại!" });
        }

        // Lưu thông tin đặt vé vào cơ sở dữ liệu
        const newBooking = new Booking({
            tripId,
            seats,
            customerName,
            customerPhone,
            paymentStatus
        });

        await newBooking.save();

        // Cập nhật ghế đã đặt vào chuyến xe
        trip.bookings.push(newBooking._id);
        await trip.save();

        res.status(201).json({ message: "Đặt vé thành công!", bookedSeats: seats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Lỗi khi đặt vé" });
    }
});


// Admin xem tất cả vé đã đặt
router.get('/bookings/admin', verifyAdmin, async(req, res) => {
    try {
        const bookings = await Booking.find().populate('tripId'); // Liên kết với chuyến xe
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu vé xe' });
    }
});


module.exports = router;