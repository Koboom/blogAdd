const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Hataları yakalamak için
const User = require('../models/User'); // Kullanıcı modelini import et

// @desc    Token'ı doğrula ve kullanıcıyı request objesine ekle
const protect = async (req, res, next) => {
    let token;

    // Authorization başlığında Bearer token var mı kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı başlıkta "Bearer TOKEN_STRING" formatından al
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token'daki ID ile kullanıcıyı bul ve parola hariç bilgilerini request objesine ekle
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Kullanıcı bulunamadı, yetkilendirme reddedildi.' });
            }

            next(); // Sonraki middleware'e veya rotaya geç
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Yetkilendirme reddedildi, token geçersiz.' });
            throw new Error('Yetkilendirme başarısız, token geçersiz.');
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Yetkilendirme reddedildi, token yok.' });
        throw new Error('Yetkilendirme başarısız, token bulunamadı.');
    }
};

// @desc    Kullanıcının yönetici (admin) rolüne sahip olup olmadığını kontrol et
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Yönetici ise devam et
    } else {
        res.status(403).json({ message: 'Bu işleme yetkiniz yok, yönetici değilsiniz.' });
    }
};

module.exports = { protect, admin };
// Bu middleware, korunan rotalarda kullanılır ve kullanıcıyı doğrular
// Ayrıca, kullanıcının yönetici olup olmadığını kontrol eder.