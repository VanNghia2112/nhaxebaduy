const mongoose = require('mongoose');
const Trip = require('./models/Trip');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const seedTrips = [
    { departure: 'Lagi', destination: 'TP. Hồ Chí Minh', date: '2025-03-10', time: '08:00', price: '200,000 VND' },
    { departure: 'Lagi', destination: 'TP. Hồ Chí Minh', date: '2025-03-10', time: '14:00', price: '200,000 VND' },
    { departure: 'TP. Hồ Chí Minh', destination: 'Lagi', date: '2025-03-11', time: '09:00', price: '200,000 VND' }
];

const seedDB = async() => {
    await Trip.deleteMany({});
    await Trip.insertMany(seedTrips);
    console.log("✅ Dữ liệu chuyến xe đã được thêm!");
    mongoose.connection.close();
};

seedDB();