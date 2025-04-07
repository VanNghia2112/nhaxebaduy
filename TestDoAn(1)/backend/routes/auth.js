const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Đăng ký tài khoản (chỉ cho khách hàng)
router.post('/register', async(req, res) => {
    const { username, password, phone } = req.body;

    try {
        // Kiểm tra username đã tồn tại chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng' });
        }

        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user với role là 'customer'
        const newUser = new User({
            username,
            password: hashedPassword,
            phone,
            role: 'customer'
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Đăng ký thành công', token, user: newUser });
    } catch (err) {
        console.error('Lỗi đăng ký:', err.message);
        res.status(500).json({ message: 'Đăng ký thất bại. Vui lòng thử lại.' });
    }
});

// Đăng nhập cho cả admin và khách hàng
router.post('/login', async(req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Đăng nhập thành công', token, user });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err.message);
        res.status(500).json({ message: 'Đăng nhập thất bại. Vui lòng thử lại.' });
    }
});

module.exports = router;