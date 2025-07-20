const express = require('express');
const {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/postController');
const { protect, admin } = require('../middleware/authMiddleware'); // Middleware'leri import et
const upload = require('../middleware/uploadMiddleware'); // <-- YENİ EKLENEN SATIR: uploadMiddleware'i import et

const router = express.Router();

// GET /api/posts - Tüm gönderileri getir (Herkese açık)
// POST /api/posts - Yeni gönderi oluştur (Sadece oturum açmış kullanıcılar)
router.route('/')
    .get(getPosts)
    .post(protect, upload.single('image'), createPost); // <-- BURAYI GÜNCELLEDİK: 'upload.single('image')' eklendi

// GET /api/posts/:id - Belirli bir gönderiyi getir (Herkese açık)
// PUT /api/posts/:id - Gönderiyi güncelle (Sadece yazar veya yönetici)
// DELETE /api/posts/:id - Gönderiyi sil (Sadece yazar veya yönetici)
router.route('/:id')
    .get(getPostById)
    .put(protect, upload.single('image'), updatePost) // <-- BURAYI GÜNCELLEDİK: 'upload.single('image')' eklendi
    .delete(protect, deletePost); // Delete etmek için 'protect' middleware'ini kullan

// Opsiyonel: Sadece yöneticilerin erişebileceği bir örnek rota (örneğin tüm gönderileri silme)
// router.route('/admin')
//      .delete(protect, admin, deleteAllPostsByAdmin); // Önce 'protect', sonra 'admin' middleware'i

module.exports = router;