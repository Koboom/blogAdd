const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifre hash'lemek için

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı gerekli'],
        unique: true,
        trim: true, // Baştaki ve sondaki boşlukları kaldırır
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı']
    },
    email: {
        type: String,
        required: [true, 'E-posta adresi gerekli'],
        unique: true,
        trim: true,
        match: [/.+@.+\..+/, 'Geçerli bir e-posta adresi girin'] // E-posta formatını kontrol eder
    },
    password: {
        type: String,
        required: [true, 'Şifre gerekli'],
        minlength: [6, 'Şifre en az 6 karakter olmalı']
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Kullanıcı rolleri
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Şifreyi kaydetmeden önce hash'le (middleware)
UserSchema.pre('save', async function(next) {
    // Şifre değiştirilmediyse veya yeni oluşturulmuyorsa, bir sonraki adıma geç
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10); // 10 karakterlik bir tuz oluştur
    this.password = await bcrypt.hash(this.password, salt); // Şifreyi tuzla hash'le
    next();
});

// Kullanıcının girdiği şifreyi, hashlenmiş şifreyle karşılaştırma metodu
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);