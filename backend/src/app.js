const express = require('express');
const dotenv = require('dotenv'); // Ortam değişkenlerini yüklemek için (Docker Compose kullanıldığı için burada pek etkili değil ama tutmak zarar vermez)
const connectDB = require('../config/db'); // MongoDB bağlantı fonksiyonu
const cors = require('cors'); // CORS middleware'i
const authRoutes = require('../routes/authRoutes'); // AUTH rotalarını import et

// .env dosyasındaki ortam değişkenlerini yükle (Docker Compose'da belirtildiği için bu kısım opsiyoneldir)
dotenv.config();

// MongoDB bağlantısını kur
connectDB();

const app = express(); // Express uygulamasını başlat

// Middleware'ler
app.use(express.json()); // JSON formatındaki istek gövdelerini (request body) ayrıştırmak için
app.use(express.urlencoded({ extended: false })); // URL-encoded form verilerini ayrıştırmak için

// CORS (Cross-Origin Resource Sharing) middleware'i
// Frontend ve backend farklı portlarda çalıştığında (geliştirme aşamasında) çapraz kaynak isteklerine izin verir.
app.use(cors({
    origin: 'http://localhost:80', // Frontend'inizin adresi (Docker ortamında 80 portu varsayılan)
    credentials: true // Çerezleri veya kimlik doğrulama başlıklarını göndermeye izin verir
}));

// Test rotası
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth rotalarını '/api/auth' ön eki altında kullan
app.use('/api/auth', authRoutes);

// Uygulamanın dinleyeceği portu belirle (Docker Compose'da 5000'e eşleniyor)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
