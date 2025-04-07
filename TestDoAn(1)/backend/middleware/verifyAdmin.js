const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization') ? req.header('Authorization').split(' ')[1] : null;

    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Không phải quyền admin" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

module.exports = verifyAdmin;