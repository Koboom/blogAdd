const User = require('../models/User'); // User modelini import et
const jwt = require('jsonwebtoken'); // JWT (JSON Web Token) oluşturmak için

// JWT token oluşturma yardımcı fonksiyonu
const generateToken = (id) => {
    // process.env.JWT_SECRET ortam değişkeninden token anahtarını alır
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token'ın geçerlilik süresi (örneğin 1 saat)
    });
};

// @desc    Yeni kullanıcı kaydı (register)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Kullanıcı adı veya e-posta zaten mevcut mu kontrol et
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Kullanıcı adı veya e-posta zaten kullanımda.' });
        }

        // Yeni kullanıcı oluştur (şifre, User modelinin pre-save hook'unda otomatik hash'lenecek)
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            // Başarılı kayıt: Kullanıcı bilgilerini ve bir JWT token'ı geri döndür
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Kullanıcıya kimlik doğrulama token'ı gönder
            });
        } else {
            res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
        }
    } catch (error) {
        console.error(error); // Hataları konsola yazdır
        res.status(500).json({ message: 'Sunucu hatası.' }); // Genel sunucu hatası mesajı
    }
};

// @desc    Kullanıcı girişi (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // E-posta ile kullanıcıyı bul
        const user = await User.findOne({ email }).select('+password'); // Şifre alanını da dahil et (varsayılan olarak select: false)

        // Kullanıcı yoksa veya şifre eşleşmiyorsa hata döndür
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        // Başarılı giriş: JWT token döndür
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error); // Hataları konsola yazdır
        res.status(500).json({ message: 'Sunucu hatası.' }); // Genel sunucu hatası mesajı
    }
};

module.exports = {
    registerUser,
    loginUser
};