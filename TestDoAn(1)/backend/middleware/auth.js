const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Điều chỉnh đường dẫn nếu cần

// Middleware kiểm tra token và quyền của người dùng
const authMiddleware = async(req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không có token, không có quyền truy cập!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET cần được khai báo trong file .env
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Người dùng không tồn tại!' });
        }

        req.user = user; // Lưu thông tin người dùng vào req.user
        next(); // Tiếp tục với các middleware hoặc route tiếp theo
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Token không hợp lệ!' });
    }
};

module.exports = authMiddleware;