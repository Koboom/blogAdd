// backend/controllers/postController.js

const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');

// @desc    Tüm gönderileri getir (Halk için sadece yayınlanmış olanlar)
// @route   GET /api/posts
// @access  Public (sadece yayınlanmış), Private/Admin (tümünü görebilir)
const getPosts = asyncHandler(async (req, res) => {
  let query;

  if (req.user && req.user.role === 'admin') {
    query = Post.find().populate('author', 'username email');
  } else {
    query = Post.find({ isPublished: true }).populate('author', 'username email');
  }

  const posts = await query.sort({ createdAt: -1 });
  res.status(200).json(posts);
});

// @desc    Belirli bir gönderiyi ID'ye göre getir
// @route   GET /api/posts/:id
// @access  Public (sadece yayınlanmış), Private (yazar veya admin tümünü görebilir)
const getPostById = asyncHandler(async (req, res) => {
  console.log('getPostById çağrıldı. Gönderi ID:', req.params.id);
  console.log('req.user:', req.user);
  const post = await Post.findById(req.params.id).populate('author', 'username email');
  console.log('Post.findById sonucu:', post);

  if (!post) {
    res.status(404);
    throw new Error('Gönderi bulunamadı.');
  }

  // YENİ VE BASİTLEŞTİRİLMİŞ YETKİLENDİRME MANTIĞI
  // Eğer kullanıcı admin ise, yayınlanmamış olsa bile gönderiyi görebilir.
  if (req.user && req.user.role === 'admin') {
    console.log('Debug: Kullanıcı admin, erişime izin verildi. Gönderi gönderiliyor.'); // YENİ DEBUG LOG
    res.status(200).json(post);
    return; // Admin ise burada bitir
  }

  // Eğer gönderi yayınlanmamışsa ve kullanıcı admin değilse,
  // sadece gönderinin yazarı görebilir.
  if (!post.isPublished) {
    if (req.user && post.author && req.user.id.toString() === post.author._id.toString()) {
      console.log('Debug: Kullanıcı yazar, yayınlanmamış gönderiye erişime izin verildi.');
      res.status(200).json(post);
      return; // Yazar ise burada bitir
    } else {
      console.log('Debug: Yayınlanmamış gönderi ve kullanıcı yazar/admin değil. 403 Forbidden.');
      res.status(403);
      throw new Error('Bu gönderiye erişim yetkiniz yok. Henüz yayınlanmamış olabilir.');
    }
  }

  // Gönderi yayınlanmışsa veya yukarıdaki koşullar karşılanmadıysa, erişime izin ver
  console.log('Debug: Gönderi yayınlanmış veya yetkili kullanıcı. Erişime izin verildi.');
  res.status(200).json(post);
});

// @desc    Yeni gönderi oluştur
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { title, content, image, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Lütfen başlık ve içerik alanlarını doldurun.');
  }

  const post = await Post.create({
    title,
    content,
    image: req.file ? `/uploads/${req.file.filename}` : image,
    author: req.user.id,
    category: category || 'Genel',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
    isPublished: false
  });

  res.status(201).json(post);
});

// @desc    Gönderiyi güncelle
// @route   PUT /api/posts/:id
// @access  Private (sadece yazar veya yönetici)
const updatePost = asyncHandler(async (req, res) => {
  const { title, content, image, category, tags } = req.body;

  let post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Gönderi bulunamadı.');
  }

  if (post.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Bu gönderiyi güncelleme yetkiniz yok.');
  }

  post.title = title || post.title;
  post.content = content || post.content;
  if (req.file) {
    post.image = `/uploads/${req.file.filename}`;
  } else if (image !== undefined && image !== 'REMOVE_IMAGE') {
    post.image = image;
  } else if (image === 'REMOVE_IMAGE') {
    post.image = null;
  }

  post.category = category || post.category;
  post.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : post.tags;

  const updatedPost = await post.save();

  res.status(200).json(updatedPost);
});

// @desc    Gönderiyi sil
// @route   DELETE /api/posts/:id
// @access  Private (sadece yazar veya yönetici)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Gönderi bulunamadı.');
  }

  if (post.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Bu gönderiyi silme yetkiniz yok.');
  }

  await post.deleteOne();
  res.status(200).json({ message: 'Gönderi başarıyla silindi.' });
});

// @desc    Bir gönderinin yayınlanma durumunu güncelle (Admin Paneli İçin)
// @route   PUT /api/posts/:id/publish
// @access  Private/Admin
const updatePostPublicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Gönderi bulunamadı.');
  }

  if (typeof isPublished !== 'boolean') {
    res.status(400);
    throw new Error('Geçersiz yayın durumu belirtildi. "isPublished" boolean olmalıdır.');
  }

  post.isPublished = isPublished;
  await post.save();

  res.status(200).json(post);
});

// @desc    Yayınlanmamış tüm gönderileri getir (Admin Paneli İçin)
// @route   GET /api/posts/unpublished
// @access  Private/Admin
const getUnpublishedPosts = asyncHandler(async (req, res) => {
  const unpublishedPosts = await Post.find({ isPublished: false }).populate('author', 'username email').sort({ createdAt: -1 });
  res.status(200).json(unpublishedPosts);
});


module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostPublicationStatus,
  getUnpublishedPosts
};
