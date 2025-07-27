// backend/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post'); // Post modelini içeri aktarın

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

// @desc    Kullanıcı rolünü güncelle
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);

  if (user) {
    if (role !== 'user' && role !== 'admin') {
      res.status(400);
      throw new Error('Geçersiz rol belirtildi. Rol "user" veya "admin" olmalıdır.');
    }

    user.role = role;
    await user.save();

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
  const { id } = req.params;

  const user = await User.findById(id);

  if (user) {
    if (user._id.toString() === req.user.id.toString()) {
      res.status(400);
      throw new Error('Kendi hesabınızı silemezsiniz.');
    }

    await user.deleteOne();
    res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı.');
  }
});

// @desc    Admin paneli istatistiklerini getir
// @route   GET /api/users/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  // Toplam kullanıcı sayısını al
  const totalUsers = await User.countDocuments();

  // Toplam gönderi sayısını al
  const totalPosts = await Post.countDocuments();

  // Yayınlanmamış gönderi sayısını al (isPublished: false olanları say)
  const unpublishedPosts = await Post.countDocuments({ isPublished: false }); // DÜZELTİLDİ: isApproved yerine isPublished kullanıldı

  res.status(200).json({
    totalUsers,
    totalPosts,
    unpublishedPosts, // DÜZELTİLDİ: pendingPosts yerine unpublishedPosts gönderildi
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getAdminStats,
};
