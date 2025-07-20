const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB bağlantı dizesini .env dosyasından al
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.name}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        // Bağlantı hatası durumunda uygulamayı kapat
        process.exit(1);
    }
};

module.exports = connectDB;
// backend/config/db.js
// MongoDB bağlantısını sağlayan fonksiyon