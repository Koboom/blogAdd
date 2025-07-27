// backend/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, googleAuthCallback, changePassword } = require('../controllers/authController'); // changePassword'u içeri aktarın
const passport = require('passport'); // Passport.js'i içeri aktar
const { protect } = require('../middleware/authMiddleware'); // protect middleware'i içeri aktarın

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth rotaları (app.js'de tanımlı olduğu varsayılıyor)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login' }), googleAuthCallback);

// Şifre değiştirme rotası
// Bu rotaya sadece kimliği doğrulanmış kullanıcılar erişebilir (protect middleware'i sayesinde)
router.route('/change-password').put(protect, changePassword);

module.exports = router;
