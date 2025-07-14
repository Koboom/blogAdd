const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // db.js'den veritabanı bağlantısı
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');

// <<< YENİ İMPORTLAR BAŞLANGICI >>>
const passport = require('passport'); // Passport.js eklendi
const session = require('express-session'); // express-session eklendi
const MongoStore = require('connect-mongo'); // Oturumları MongoDB'de saklamak için
const jwt = require('jsonwebtoken'); // JWT token oluşturmak için (callback'te kullanılacak)
// <<< YENİ İMPORTLAR SONU >>>

// .env dosyasındaki ortam değişkenlerini yükle
// Bu satırın require'lardan hemen sonra olması önemli.
dotenv.config();

// MongoDB bağlantısını kur
connectDB();

const app = express();

// Middleware'ler
app.use(express.json()); // JSON formatındaki istek gövdelerini ayrıştırmak için
app.use(express.urlencoded({ extended: false })); // URL-encoded istek gövdelerini ayrıştırmak için

// CORS middleware'i - Vue.js geliştirme portuna göre ayarlandı
app.use(cors({
    origin: 'http://localhost:8080', // Vue.js uygulamanızın çalışacağı port
    credentials: true // Kimlik bilgileri (çerezler, yetkilendirme başlıkları) için izin ver
}));

// <<< YENİ: Oturum (Session) Middleware'i Başlangıcı >>>
// Oturumları MongoDB'de saklamak için
app.use(session({
    secret: process.env.SESSION_SECRET, // .env'den gelen oturum gizemi (çok önemli!)
    resave: false, // Oturum değişmediyse bile yeniden kaydetme
    saveUninitialized: false, // Başlatılmamış oturumları kaydetme
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB bağlantı URI'si
        collectionName: 'sessions' // Oturumların saklanacağı koleksiyon adı
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Oturum süresi: 1 gün (milisaniye cinsinden)
        // secure: process.env.NODE_ENV === 'production', // Sadece HTTPS için üretimde açılmalı
        // httpOnly: true // Tarayıcı tarafında JavaScript ile erişimi engeller (güvenlik için iyi)
    }
}));
// <<< YENİ: Oturum (Session) Middleware'i Sonu >>>

// <<< YENİ: Passport.js Middleware'i Başlangıcı >>>
// Passport middleware'i başlat
app.use(passport.initialize()); // Passport'u başlat
app.use(passport.session()); // Oturum tabanlı kimlik doğrulama için Passport'u kullan

// Passport yapılandırma dosyasını çağır (GoogleStrategy ayarlarını yükler)
require('../config/passport'); // <<< YOL DÜZELTİLDİ: src klasöründen bir üst dizine çıkıp config'e gidiyoruz
// <<< YENİ: Passport.js Middleware'i Sonu >>>


// Test rotası
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth rotalarını kullan (mevcut kullanıcı adı/şifre ile giriş/kayıt)
app.use('/api/auth', authRoutes);

// Post rotalarını kullan
app.use('/api/posts', postRoutes);


// <<< YENİ: Google OAuth Rotları Başlangıcı >>>
// Google OAuth'a yönlendirme rotası
// Kullanıcı bu URL'ye gittiğinde, Google'ın kimlik doğrulama sayfasına yönlendirilir
app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }) // Google'dan profil ve e-posta bilgilerini iste
);

// Google OAuth Geri Çağırma (Callback) rotası
// Google, kimlik doğrulama tamamlandığında kullanıcıyı bu URL'ye geri yönlendirir
app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:8080/login' }), // Başarısız olursa Vue.js'deki login sayfasına yönlendir
    (req, res) => {
        // Başarılı kimlik doğrulama sonrası
        // req.user nesnesi, Passport tarafından kimliği doğrulanmış kullanıcıyı içerir.
        // Bu kullanıcı için bir JWT oluşturup frontend'e göndermeliyiz.
        const token = req.user.getSignedJwtToken(); // User modelindeki metodu çağırıyoruz

        // Frontend'e JWT ile birlikte yönlendir
        // Vue.js frontend'i bu token'ı URL'den alıp kendi localStorage'ına kaydedecektir
        res.redirect(`http://localhost:8080/auth-success?token=${token}`);
    }
);
// <<< YENİ: Google OAuth Rotları Sonu >>>


// Uygulamanın dinleyeceği portu belirle
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Uygulama çalışmaya başladığında konsola mesaj yazdır