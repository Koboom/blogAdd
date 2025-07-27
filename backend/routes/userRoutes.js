// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getAdminStats // Yeni fonksiyonu içeri aktarın
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Tüm kullanıcıları getir (sadece adminler erişebilir)
router.route('/').get(protect, authorizeRoles('admin'), getUsers);

// Admin paneli istatistiklerini getir (sadece adminler erişebilir)
// Bu rotayı diğer dinamik ID'li rotalardan önce tanımlamak iyi bir pratiktir,
// aksi takdirde '/stats' '/:id' olarak algılanabilir.
router.route('/stats').get(protect, authorizeRoles('admin'), getAdminStats);

// Belirli bir kullanıcıyı ID'ye göre güncelle (rol güncelleme)
router.route('/:id/role').put(protect, authorizeRoles('admin'), updateUserRole);

// Belirli bir kullanıcıyı sil
router.route('/:id').delete(protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
