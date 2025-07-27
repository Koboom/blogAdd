// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı başlıkdan al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token'daki ID'ye göre kullanıcıyı bul ve şifre hariç bilgileri ata
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Bir sonraki middleware'e geç
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Yetkilendirme reddedildi, token geçersiz.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkilendirme reddedildi, token bulunamadı.');
  }
});

// Rol yetkilendirme middleware'i
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user, protect middleware'inden gelir
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(`Rolünüz (${req.user ? req.user.role : 'yok'}) bu işlemi yapmaya yetkili değil.`);
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
