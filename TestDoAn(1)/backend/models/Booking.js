const mongoose = require('mongoose');

// Khai báo schema cho đặt vé
const bookingSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }, // Liên kết với chuyến xe
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    bookedSeats: [{ type: String, required: true }], // Mảng ghế đã đặt
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }, // Trạng thái thanh toán
    createdAt: { type: Date, default: Date.now } // Ngày tạo
});

// Tạo model từ schema
const Booking = mongoose.model('Booking', bookingSchema);

// Export model Booking để sử dụng ở các file khác
module.exports = Booking;