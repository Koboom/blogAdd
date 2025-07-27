// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById, // İleride detay sayfası için eklenebilir
  updateUserRole,
  deleteUser
} = require('../controllers/userController'); // User controller fonksiyonlarını içeri aktar
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Kimlik doğrulama ve rol yetkilendirme middleware'lerini içeri aktar

// Tüm kullanıcıları getir (sadece adminler erişebilir)
// protect: Kullanıcının oturum açmış olmasını sağlar
// authorizeRoles('admin'): Kullanıcının 'admin' rolüne sahip olmasını sağlar
router.route('/').get(protect, authorizeRoles('admin'), getUsers);

// Belirli bir kullanıcıyı ID'ye göre güncelle (rol güncelleme)
// Sadece adminler erişebilir
router.route('/:id/role').put(protect, authorizeRoles('admin'), updateUserRole);

// Belirli bir kullanıcıyı sil
// Sadece adminler erişebilir
router.route('/:id').delete(protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
