const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifre hash'lemek için
const jwt = require('jsonwebtoken'); // JWT için (artık doğru yerde!)

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı gerekli'],
        unique: true,
        trim: true,
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı']
    },
    email: {
        type: String,
        required: [true, 'E-posta adresi gerekli'],
        unique: true,
        trim: true,
        match: [/.+@.+\..+/, 'Geçerli bir e-posta adresi girin']
    },
    password: {
        type: String,
        // Google ile giriş yapan kullanıcılar için şifre alanı zorunlu olmayabilir.
        // Bu yüzden 'required' kuralını burada varsayılan olarak kaldırdık.
        // Ancak, yerel kayıt yapan kullanıcılar için kontrolü Controller'da yaparız.
        // Örneğin: Local kayıt yaparken şifre gönderilmediyse hata fırlatabiliriz.
        minlength: [6, 'Şifre en az 6 karakter olmalı'],
        select: false // Varsayılan olarak parola sorgularda geri döndürülmez (güvenlik)
    },
    googleId: { // Google ile giriş yapan kullanıcılar için benzersiz Google ID'si
        type: String,
        unique: true, // Her Google ID'si sadece bir kullanıcıya ait olmalı
        sparse: true   // Bu alan sadece Google ile giriş yapanlar için var, diğerleri için boş olabilir.
                       // Unique kuralını sadece alanı olan belgeler için uygular.
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware: Şifreyi kaydetmeden önce hash'le
UserSchema.pre('save', async function(next) {
    // Şifre değiştirilmediyse VEYA şifre alanı yoksa (yani Google ile giriş yapılıyorsa), bir sonraki adıma geç
    // Google ile kayıt olan bir kullanıcıda 'password' alanı hiç gönderilmeyebilir.
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metod: Kullanıcının girdiği şifreyi, hashlenmiş şifreyle karşılaştırma
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Eğer kullanıcının şifresi yoksa (örn. Google ile kayıtlı), karşılaştırma yapmaya gerek yok.
    // Bu durumda false dönebiliriz.
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// Metod: JWT Token Oluşturma
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1h' // .env'de yoksa 1 saat olarak ayarla
    });
};

module.exports = mongoose.model('User', UserSchema);