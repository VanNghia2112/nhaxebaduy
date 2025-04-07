const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// 🔐 Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

// ✅ Hàm tiện ích để kiểm tra mật khẩu (dùng trong login)
userSchema.methods.comparePassword = function(inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;