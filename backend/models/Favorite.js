const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    favoritedAt: { // Favoriye eklenme tarihi
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // createdAt ve updatedAt otomatik eklensin
});

// Bir kullanıcının aynı yazıyı birden fazla favorileyememesini sağlamak için benzersiz indeks
FavoriteSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);