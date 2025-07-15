const asyncHandler = require('express-async-handler'); // Hataları yakalamak için
const Favorite = require('../models/Favorite'); // Favorite modelini içeri aktar
const Post = require('../models/Post'); // Post modelini içeri aktar (favori sayısı güncellemek için)

// @desc    Bir gönderiyi favorilere ekle
// @route   POST /api/posts/:postId/favorite
// @access  Private (Kullanıcı giriş yapmış olmalı)
const addFavorite = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; // Kimliği doğrulanmış kullanıcının ID'si (authMiddleware'dan gelir)

    // Gönderinin var olup olmadığını kontrol et
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Gönderi bulunamadı.');
    }

    // Kullanıcının bu gönderiyi zaten favorileyip favorilemediğini kontrol et
    const existingFavorite = await Favorite.findOne({ user: userId, post: postId });
    if (existingFavorite) {
        res.status(400);
        throw new Error('Bu gönderi zaten favorilerinizde.');
    }

    // Yeni favori kaydını oluştur
    const favorite = await Favorite.create({
        user: userId,
        post: postId
    });

    // Opsiyonel: Post modelindeki 'likes' sayısını artır (eğer Post modelinde 'likes' varsa)
    await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

    res.status(201).json({
        message: 'Gönderi favorilere eklendi.',
        favorite
    });
});

// @desc    Bir gönderiyi favorilerden çıkar
// @route   DELETE /api/posts/:postId/favorite
// @access  Private (Kullanıcı giriş yapmış olmalı)
const removeFavorite = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id; // Kimliği doğrulanmış kullanıcının ID'si

    // Favori kaydını bul ve sil
    const favorite = await Favorite.findOneAndDelete({ user: userId, post: postId });

    if (!favorite) {
        res.status(404);
        throw new Error('Favorilerinizde böyle bir gönderi bulunamadı.');
    }

    // Opsiyonel: Post modelindeki 'likes' sayısını azalt (eğer Post modelinde 'likes' varsa)
    await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

    res.status(200).json({
        message: 'Gönderi favorilerden kaldırıldı.'
    });
});

// @desc    Bir kullanıcının tüm favori gönderilerini getir
// @route   GET /api/auth/me/favorites
// @access  Private (Kullanıcı giriş yapmış olmalı)
const getUserFavorites = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Kimliği doğrulanmış kullanıcının ID'si

    // Kullanıcının favori kayıtlarını bul ve Post bilgilerini populate et
    const favorites = await Favorite.find({ user: userId })
        .populate('post', 'title content image slug'); // Hangi Post alanlarını istediğinizi belirtin

    res.status(200).json({
        count: favorites.length,
        data: favorites.map(fav => fav.post) // Sadece gönderi verilerini gönder
    });
});

// @desc    Bir gönderinin favori sayısını al
// @route   GET /api/posts/:postId/favorites/count
// @access  Public
const getPostFavoriteCount = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const count = await Favorite.countDocuments({ post: postId });

    res.status(200).json({
        postId,
        favoriteCount: count
    });
});


module.exports = {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    getPostFavoriteCount
};