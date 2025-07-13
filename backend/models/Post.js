const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Başlık gerekli'],
        trim: true,
        minlength: [3, 'Başlık en az 3 karakter olmalı']
    },
    content: {
        type: String,
        required: [true, 'İçerik gerekli']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // Yazarın ID'si
        ref: 'User', // 'User' modeline referans verir
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Kaydetme öncesi veya güncelleme sonrası updatedAt alanını otomatik olarak güncelle
PostSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Opsiyonel: findOneAndUpdate veya updateOne gibi metotlarda da updatedAt'i güncellemek için
PostSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Post', PostSchema);
