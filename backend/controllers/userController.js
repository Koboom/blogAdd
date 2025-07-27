// backend/controllers/userController.js

const asyncHandler = require('express-async-handler'); // Hataları yakalamak için
const User = require('../models/User'); // User modelini içeri aktar

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // Şifre alanı hariç tüm kullanıcıları bul
  const users = await User.find({}).select('-password');

  res.status(200).json(users);
});

// @desc    Kullanıcı rolünü güncelle
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params; // Güncellenecek kullanıcının ID'si
  const { role } = req.body; // Yeni rol

  const user = await User.findById(id);

  if (user) {
    // Sadece 'user' veya 'admin' rolüne izin ver
    if (role !== 'user' && role !== 'admin') {
      res.status(400);
      throw new Error('Geçersiz rol belirtildi. Rol "user" veya "admin" olmalıdır.');
    }

    user.role = role;
    await user.save(); // Kullanıcıyı kaydet

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı.');
  }
});

// @desc    Kullanıcıyı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params; // Silinecek kullanıcının ID'si

  const user = await User.findById(id);

  if (user) {
    // Adminin kendini silmesini engelle (opsiyonel ama iyi bir pratik)
    if (user._id.toString() === req.user.id.toString()) {
      res.status(400);
      throw new Error('Kendi hesabınızı silemezsiniz.');
    }

    await user.deleteOne(); // Kullanıcıyı sil
    res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı.');
  }
});

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};
