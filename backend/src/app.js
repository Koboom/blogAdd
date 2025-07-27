// backend/src/app.js

require('dotenv').config({ path: '../.env' }); // .env dosyasının yolunu doğru ayarlayın

const express = require('express');
const connectDB = require('../config/db');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');
const favoriteRoutes = require('../routes/favoriteRoutes');
const userRoutes = require('../routes/userRoutes'); // YENİ: userRoutes'u içeri aktarın
const path = require('path');

const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { errorHandler } = require('../middleware/errorMiddleware'); // YENİ: Hata işleme middleware'ini içeri aktarın

// Geçici ENV değişkeni kontrol kodunu kaldırıyoruz.
// console.log('--- ENV DEĞİŞKEN KONTROLÜ ---');
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
// console.log('MONGO_URI:', process.env.MONGO_URI);
// console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
// console.log('--- ENV DEĞİŞKEN KONTROLÜ SONU ---');

connectDB(); // Veritabanı bağlantısı

const app = express();

app.use(express.json()); // JSON body'leri parse etmek için
app.use(express.urlencoded({ extended: false })); // URL-encoded body'leri parse etmek için

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL'inizi .env'den veya varsayılan olarak alır
    credentials: true // Çerezleri ve kimlik doğrulama başlıklarını göndermeyi sağlar
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey', // Oturum gizli anahtarı
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 gün
        secure: process.env.NODE_ENV === 'production', // Üretimde HTTPS için true
        httpOnly: true, // JavaScript erişimini engelle
        sameSite: 'Lax', // CSRF koruması için
    }
}));

app.use(passport.initialize());
app.use(passport.session());

require('../config/passport')(passport); // Passport yapılandırmasını içeri aktar

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Statik dosya sunumu

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Rota dosyalarını kullan
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/favorites', favoriteRoutes); // Düzeltildi: /api/favorites altında kullanın
app.use('/api/users', userRoutes); // YENİ: Kullanıcı yönetimi rotalarını ekleyin

// Google OAuth rotaları authRoutes içinde tanımlı olduğu için buradan kaldırıldı
// app.get('/api/auth/google', ...);
// app.get('/api/auth/google/callback', ...);

// Hata işleme middleware'ini tüm rotalardan sonra ekleyin
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
