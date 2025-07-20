const asyncHandler = require('express-async-handler'); // Hataları yakalamak için
const User = require('../models/User'); // User modelini import et
const jwt = require('jsonwebtoken'); // JWT (JSON Web Token) oluşturmak için

// JWT token oluşturma yardımcı fonksiyonu
const generateToken = (id) => {
    // process.env.JWT_SECRET ortam değişkeninden token anahtarını alır
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h' // Token'ın geçerlilik süresi (örneğin 1 saat)
    });
};

// @desc    Yeni kullanıcı kaydı (register)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => { // asyncHandler ile sarıldı
    const { username, email, password } = req.body;

    // Kullanıcı adı veya e-posta zaten mevcut mu kontrol et
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        res.status(400);
        throw new Error('Kullanıcı adı veya e-posta zaten kullanımda.');
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
        res.status(400);
        throw new Error('Geçersiz kullanıcı verisi.');
    }
});

// @desc    Kullanıcı girişi (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => { // asyncHandler ile sarıldı
    const { email, password } = req.body;

    // E-posta ile kullanıcıyı bul ve password'u da GETİR
    const user = await User.findOne({ email }).select('+password'); // Şifre alanını da dahil et (varsayılan olarak select: false)

    // Kullanıcı yoksa veya şifre eşleşmiyorsa hata döndür
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Geçersiz e-posta veya şifre.');
    }

    // Başarılı giriş: JWT token döndür
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    });
});

// @desc    Google OAuth Callback sonrası kullanıcıyı işle
// @route   GET /api/auth/google/callback
// @access  Public (Passport.js tarafından yönetilir)
const googleAuthCallback = asyncHandler(async (req, res) => {
    // Passport.js, kimliği doğrulanmış kullanıcıyı req.user'a yerleştirir
    if (!req.user) {
        // Bu durum normalde Passport.js'in failureRedirect'i tarafından ele alınır
        // ancak yine de bir fallback olarak burada bir hata döndürebiliriz.
        res.status(401);
        throw new Error('Google kimlik doğrulaması başarısız oldu.');
    }

    // Kullanıcı için bir JWT token oluştur
    const token = generateToken(req.user._id);

    // Kullanıcının sadece gerekli alanlarını al (parola veya hassas bilgiler olmadan)
    // Bu bilgiler frontend'e URL parametresi olarak gönderilecek
    const user = {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        // Eğer User modelinde 'image' alanı varsa, onu da ekleyebilirsiniz:
        // image: req.user.image,
    };

    // Kullanıcı objesini JSON string'ine çevir ve URL güvenli hale getir
    const encodedUser = encodeURIComponent(JSON.stringify(user));

    // Frontend URL'ini .env dosyasından al
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    // Token ve kullanıcı bilgilerini içeren URL'ye frontend'i yönlendir
    res.redirect(`${frontendUrl}/auth-success?token=${token}&user=${encodedUser}`);
});

const changePassword = asyncHandler(async (req, res) => {
    // req.user, protect middleware'i tarafından eklenen oturum açmış kullanıcıdır.
    const user = await User.findById(req.user.id).select('+password'); // Şifreyi de çekmeliyiz
    const { currentPassword, newPassword } = req.body;

    if (!user) {
        res.status(404);
        throw new Error('Kullanıcı bulunamadı.');
    }

    // Mevcut şifrenin doğru olup olmadığını kontrol et
    if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Mevcut şifre yanlış.');
    }

    // Yeni şifre ile mevcut şifrenin aynı olup olmadığını kontrol et
    if (currentPassword === newPassword) {
        res.status(400);
        throw new Error('Yeni şifre mevcut şifre ile aynı olamaz.');
    }

    // Yeni şifrenin belirlenen güvenlik kurallarına uygunluğunu kontrol edebilirsiniz (opsiyonel)
    if (newPassword.length < 6) { // Örnek olarak minimum 6 karakter
        res.status(400);
        throw new Error('Yeni şifre en az 6 karakter uzunluğunda olmalıdır.');
    }

    user.password = newPassword; // User modelindeki pre-save hook şifreyi otomatik hashleyecektir
    await user.save(); // Kullanıcıyı kaydet

    res.json({ message: 'Şifre başarıyla güncellendi.' });
});


module.exports = {
    registerUser,
    loginUser,
    googleAuthCallback,
    changePassword // <-- Bu fonksiyonu dışa aktardığınızdan emin olun
};