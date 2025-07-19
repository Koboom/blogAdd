const mongoose = require('mongoose');
const slugify = require('slugify'); // <-- Yorum satırından çıkarıldı

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
        minlength: [20, 'İçerik en az 20 karakter olmalı']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slug: {
        type: String,
        unique: true,
        // sparse: true, // Bu artık gerekli değil, çünkü slug hep atanacak
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
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Kaydetme öncesi: Slug oluşturma/güncelleme
PostSchema.pre('save', function(next) {
    if (this.isModified('title') && this.title) { // Başlık değiştiyse ve boş değilse slug oluştur
        this.slug = slugify(this.title, { lower: true, strict: true, locale: 'tr' }); // Türkçe karakter desteği için locale: 'tr' ekledik
    }
    next();
});

module.exports = mongoose.model('Post', PostSchema);