const express = require('express');
const { registerUser, loginUser, googleAuthCallback } = require('../controllers/authController'); // googleAuthCallback'i içeri aktar
const passport = require('passport'); // Passport.js'i içeri aktar

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth rotaları (zaten app.js'de tanımlıydı, ama burada da belirtmek iyi olur)
// Aslında bu rotalar app.js'de doğrudan tanımlanmıştı.
// Eğer authRoutes.js içinde tanımlamak isterseniz şöyle olurdu:
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login' }), googleAuthCallback);

// DİKKAT: Eğer Google OAuth rotalarını app.js'de değil de authRoutes.js içinde yönetiyorsanız,
// o zaman app.js'deki ilgili app.get('/api/auth/google', ...) satırlarını kaldırmanız gerekir.
// Şu anki kurulumumuzda app.js'de tanımlı oldukları için authRoutes.js'de tekrar tanımlamaya gerek yok.
// Bu yüzden authRoutes.js dosyanızın mevcut hali muhtemelen yeterlidir.

module.exports = router;