/*const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    departure: String,
    destination: String,
    date: String,
    time: String,
    price: String
});

module.exports = mongoose.model('Trip', TripSchema);
*/

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    departure: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: String, required: true },
    bookings: [{ // Danh sách các vé đã đặt
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        bookedSeats: [{ type: String, required: true }], // Ví dụ: ['1', '2', '5']
        paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
    }]
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;