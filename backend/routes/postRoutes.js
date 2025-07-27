// backend/routes/postRoutes.js

const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostPublicationStatus,
  getUnpublishedPosts
} = require('../controllers/postController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Middleware'leri import et
const upload = require('../middleware/uploadMiddleware'); // uploadMiddleware'i import et

const router = express.Router();

// GET /api/posts - Tüm gönderileri getir (Halk için sadece yayınlanmış olanlar)
// POST /api/posts - Yeni gönderi oluştur (Sadece oturum açmış kullanıcılar)
router.route('/')
  .get(getPosts)
  .post(protect, upload.single('image'), createPost);

// GET /api/posts/unpublished - Yayınlanmamış gönderileri getir (Sadece adminler)
router.route('/unpublished').get(protect, authorizeRoles('admin'), getUnpublishedPosts);

// GET /api/posts/:id - Belirli bir gönderiyi getir
// PUT /api/posts/:id - Gönderiyi güncelle
// DELETE /api/posts/:id - Gönderiyi sil
router.route('/:id')
  .get(protect, getPostById) // DÜZELTİLDİ: 'protect' middleware'i eklendi
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

// PUT /api/posts/:id/publish - Gönderinin yayın durumunu güncelle (Sadece adminler)
router.route('/:id/publish').put(protect, authorizeRoles('admin'), updatePostPublicationStatus);


module.exports = router;
