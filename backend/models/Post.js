const mongoose = require('mongoose');
// const slugify = require('slugify'); // Eğer slugify kullanacaksanız uncomment yapın ve npm install slugify

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Başlık gerekli'],
        trim: true,
        minlength: [3, 'Başlık en az 3 karakter olmalı']
    },
    content: {
        type: String,
        required: [true, 'İçerik gerekli'],
        minlength: [20, 'İçerik en az 20 karakter olmalı'] // Eklenen minlength
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // --- Yeni Eklenen veya İyileştirilen Alanlar ---
    slug: {
        type: String,
        unique: true,
        // sparse: true, // Eğer bazı postlarda slug olmayacaksa uncomment yapın
        trim: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/600x400?text=Blog+Post'
    },
    category: {
        type: String,
        enum: ['Genel', 'Teknoloji', 'Seyahat', 'Yemek', 'Yaşam', 'Spor'],
        default: 'Genel'
    },
    likes: {
        type: Number,
        default: 0 // Varsayılan olarak 0
    },
    tags: {
        type: [String],
        default: []
    },
    isPublished: {
        type: Boolean,
        default: false
    }
    // --- Yeni Eklenen veya İyileştirilen Alanlar Sonu ---
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// Kaydetme öncesi: Slug oluşturma ve isPublished true ise publishedAt ayarlama
PostSchema.pre('save', function(next) {
    // Slug oluşturma/güncelleme (eğer başlık değiştiyse)
    // if (this.isModified('title') && this.title) {
    //     this.slug = slugify(this.title, { lower: true, strict: true });
    // }

    // Eğer 'isPublished' true olduysa ve 'publishedAt' ayarlanmadıysa, şimdiki zamanı ayarla
    // Bu mantık PostController'da da ele alınabilir
    // if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    //    this.publishedAt = Date.now();
    // }
    next();
});

module.exports = mongoose.model('Post', PostSchema);