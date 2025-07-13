const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Controller fonksiyonlarını import et

const router = express.Router(); // Yeni bir Express router örneği oluştur

// POST /api/auth/register rotası için registerUser fonksiyonunu kullan
router.post('/register', registerUser);

// POST /api/auth/login rotası için loginUser fonksiyonunu kullan
router.post('/login', loginUser);

module.exports = router; // Router'ı dışarı aktar