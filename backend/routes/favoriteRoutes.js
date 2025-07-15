const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // authMiddleware'i import et
const {
    addFavorite,
    removeFavorite,
    getUserFavorites,
    getPostFavoriteCount
} = require('../controllers/favoriteController');

const router = express.Router();

// Gönderiyi favorilere ekle
// authMiddleware.js'deki 'protect' middleware'ini kullanarak kullanıcı oturumunu kontrol ediyoruz
router.route('/:postId/favorite').post(protect, addFavorite);

// Gönderiyi favorilerden çıkar
router.route('/:postId/favorite').delete(protect, removeFavorite);

// Kimliği doğrulanmış kullanıcının tüm favori gönderilerini getir
router.get('/me/favorites', protect, getUserFavorites);

// Bir gönderinin favori sayısını al (public olabilir)
router.get('/:postId/favorites/count', getPostFavoriteCount);


module.exports = router;