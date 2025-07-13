const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // db.js dosyasını import et
const cors = require('cors'); // CORS middleware'ini import et

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısını kur
connectDB();

const app = express();

// Middleware'ler
app.use(express.json()); // JSON formatındaki request body'leri parse etmek için
app.use(express.urlencoded({ extended: false })); // URL-encoded form data'yı parse etmek için

// Geliştirme ortamında CORS'a izin ver
app.use(cors({
    origin: 'http://localhost:80', // Frontend'inizin adresi
    credentials: true
}));

// Test rotası
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Uygulamanın dinleyeceği portu belirle
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
