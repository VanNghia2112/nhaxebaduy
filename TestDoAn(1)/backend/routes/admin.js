const express = require('express');
const jwt = require('jsonwebtoken');
const Trip = require('../models/Trip');
const router = express.Router();

// Middleware kiểm tra quyền Admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        next(); // Tiến hành route tiếp theo nếu là Admin
    });
};

// Lấy danh sách vé đã đặt (chỉ Admin mới có thể xem)
router.get('/bookings', verifyAdmin, async(req, res) => {
    try {
        const trips = await Trip.find(); // Lấy tất cả các chuyến xe
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu vé xe' });
    }
});

module.exports = router;