const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// @desc    Tüm blog gönderilerini getir
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
    try {
        // En yeni gönderiler en başta olacak şekilde sırala ve yazar bilgilerini de getir
        const posts = await Post.find({})
                                 .populate('author', 'username email') // Sadece username ve email alanlarını getir
                                 .sort({ createdAt: -1 }); // En yeniyi en üste getir
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// @desc    Belirli bir blog gönderisini getir
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// @desc    Yeni bir blog gönderisi oluştur
// @route   POST /api/posts
// @access  Private (Sadece oturum açmış kullanıcılar)
const createPost = async (req, res) => {
    const { title, content } = req.body;
    // Yüklenen dosyanın yolunu al, eğer bir dosya yüklendiyse
    // req.file Multer tarafından set edilir ve dosya bilgilerini içerir.
    const imagePath = req.file ? `/uploads/${req.file.filename.replace(/\\/g, '/')}` : undefined; // <-- BU SATIRI EKLEYİN/DÜZELTİN

    // ... (validasyonlar)

    if (!req.user) {
        return res.status(401).json({ message: 'Gönderi oluşturmak için giriş yapmalısınız.' });
    }

    try {
        const post = new Post({
            title,
            content,
            author: req.user._id, // Oturum açmış kullanıcının ID'sini yazar olarak ata
            image: imagePath // <-- BURASI ÖNEMLİ: Yüklenen resmin yolunu burada ata!
        });

        const createdPost = await post.save();
        // Oluşturulan gönderiyi yazar bilgileriyle birlikte döndür
        const populatedPost = await Post.findById(createdPost._id).populate('author', 'username email');
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error(error);
        // Multer'dan gelen dosya yükleme hatasını yakalayabiliriz
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Dosya yükleme hatası: ${error.message}` });
        }
        // Hata durumunda yüklenen dosyayı sil
        if (req.file) { // <-- BU BLOĞU EKLEYİN
            fs.unlink(path.join(__dirname, '..', '..', 'uploads', req.file.filename), (err) => {
                if (err) console.error('Hata oluştuğu için yüklenen dosya silinirken hata:', err);
            });
        }
        res.status(400).json({ message: 'Gönderi oluşturulamadı. Lütfen geçerli veriler sağlayın.', error: error.message });
    }
};

// @desc    Blog gönderisini güncelle
// @route   PUT /api/posts/:id
// @access  Private (Sadece gönderiyi oluşturan kullanıcı veya yönetici)
const updatePost = async (req, res) => {
    const { title, content } = req.body;
    // Yüklenen yeni dosyanın yolu (eğer varsa)
    const newImagePath = req.file ? `/uploads/${req.file.filename.replace(/\\/g, '/')}` : undefined; // undefined, eğer dosya yoksa mevcut değeri korumak için

    // Frontend'den resmin silinmesi istendiyse
    const removeImageFlag = req.body.image === 'REMOVE_IMAGE'; // Frontend'den gelen özel işaretçi

    // Validasyonlar
    if (title && title.trim().length < 3) {
        return res.status(400).json({ message: 'Başlık en az 3 karakter içermelidir.' });
    }
    if (content && content.trim().length < 20) { // İçerik en az 20 karakter olmalı
        return res.status(400).json({ message: 'İçerik en az 20 karakter içermelidir.' });
    }

    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                // Eğer yeni bir dosya yüklenmişse ve yetki yoksa, yüklenen dosyayı sil
                if (req.file) {
                    fs.unlink(path.join(__dirname, '..', '..', 'uploads', req.file.filename), (err) => {
                        if (err) console.error('Yetkisiz yüklenen dosya silinirken hata:', err);
                    });
                }
                return res.status(403).json({ message: 'Bu gönderiyi güncellemeye yetkiniz yok.' });
            }

            // Başlık ve içerik güncellemeleri
            post.title = title !== undefined ? title : post.title;
            post.content = content !== undefined ? content : post.content;

            // Resim güncelleme mantığı
            if (newImagePath) {
                // Yeni resim yüklendi, eski resmi sil (eğer varsa)
                if (post.image) {
                    const oldImagePath = path.join(__dirname, '..', '..', post.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Eski resim silinirken hata:', err);
                    });
                }
                post.image = newImagePath; // Yeni resim yolunu ata
            } else if (removeImageFlag) {
                // Resim silme bayrağı gönderildi ve mevcut resim varsa sil
                if (post.image) {
                    const oldImagePath = path.join(__dirname, '..', '..', post.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Resim kaldırılırken hata:', err);
                    });
                }
                post.image = null; // Resmi null yap
            }
            // Eğer ne yeni resim yüklendi ne de silme bayrağı gönderildi ise, post.image değişmez.

            const updatedPost = await post.save();
            const populatedPost = await Post.findById(updatedPost._id).populate('author', 'username email');
            res.json(populatedPost);
        } else {
            // Eğer yeni bir dosya yüklenmişse ve yazı bulunamazsa, yüklenen dosyayı sil
            if (req.file) {
                fs.unlink(path.join(__dirname, '..', '..', 'uploads', req.file.filename), (err) => {
                    if (err) console.error('Yazı bulunamadığı için yüklenen dosya silinirken hata:', err);
                });
            }
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (error) {
        console.error(error);
        // Multer'dan gelen dosya yükleme hatasını yakala
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Dosya yükleme hatası: ${error.message}` });
        }
        res.status(400).json({ message: 'Gönderi güncellenemedi. Lütfen geçerli veriler sağlayın.', error: error.message });
    }
};

// @desc    Blog gönderisini sil
// @route   DELETE /api/posts/:id
// @access  Private (Sadece gönderiyi oluşturan kullanıcı veya yönetici)
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            // Sadece yazar veya yönetici silebilir
            if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Bu gönderiyi silmeye yetkiniz yok.' });
            }

            await Post.deleteOne({ _id: post._id }); // post.remove() yerine deleteOne kullanılıyor
            res.json({ message: 'Gönderi başarıyla silindi.' });
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};