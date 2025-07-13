const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes'); // postRoutes'u import et <--- YENİ SATIR

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısını kur
connectDB();

const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Geliştirme ortamında CORS'a izin ver
app.use(cors({
    origin: 'http://localhost:80', // Frontend'inizin adresi
    credentials: true
}));

// Test rotası
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth rotalarını kullan
app.use('/api/auth', authRoutes);

// Post rotalarını kullan <--- YENİ SATIR
app.use('/api/posts', postRoutes);

// Uygulamanın dinleyeceği portu belirle
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Bu dosya, Express uygulamasını başlatır ve gerekli rotaları tanımlar.