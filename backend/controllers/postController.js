const Post = require('../models/Post');

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

    // *** YENİ EKLENEN VALIDASYON BAŞLANGICI ***
    if (!title || !content) {
        return res.status(400).json({ message: 'Başlık ve içerik alanları zorunludur.' });
    }
    if (title.trim().length < 3) { // Başlık en az 3 karakter olmalı
        return res.status(400).json({ message: 'Başlık en az 3 karakter içermelidir.' });
    }
    if (content.trim().length < 20) { // İçerik en az 20 karakter olmalı
        return res.status(400).json({ message: 'İçerik en az 10 karakter içermelidir.' });
    }
    // *** YENİ EKLENEN VALIDASYON SONU ***

    // `req.user` objesi `protect` middleware'i tarafından eklenir.
    // Eğer kullanıcı oturum açmışsa, req.user._id geçerli olacaktır.
    if (!req.user) {
        return res.status(401).json({ message: 'Gönderi oluşturmak için giriş yapmalısınız.' });
    }

    try {
        const post = new Post({
            title,
            content,
            author: req.user._id // Oturum açmış kullanıcının ID'sini yazar olarak ata
        });

        const createdPost = await post.save();
        // Oluşturulan gönderiyi yazar bilgileriyle birlikte döndür
        const populatedPost = await Post.findById(createdPost._id).populate('author', 'username email');
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error(error);
        // MongoDB validasyon hatası varsa daha spesifik mesaj gönderebiliriz, ancak genel bir hata yeterli
        res.status(400).json({ message: 'Gönderi oluşturulamadı. Lütfen geçerli veriler sağlayın.', error: error.message });
    }
};

// @desc    Blog gönderisini güncelle
// @route   PUT /api/posts/:id
// @access  Private (Sadece gönderiyi oluşturan kullanıcı veya yönetici)
const updatePost = async (req, res) => {
    const { title, content } = req.body;

    // *** YENİ EKLENEN VALIDASYON BAŞLANGICI ***
    // Sadece mevcut alanlar için validasyon yap (kullanıcı sadece başlığı güncelleyebilir)
    if (title && title.trim().length < 3) {
        return res.status(400).json({ message: 'Başlık en az 3 karakter içermelidir.' });
    }
    if (content && content.trim().length < 10) {
        return res.status(400).json({ message: 'İçerik en az 10 karakter içermelidir.' });
    }
    // *** YENİ EKLENEN VALIDASYON SONU ***

    try {
        const post = await Post.findById(req.params.id);

        if (post) {
            // Sadece yazar veya yönetici güncelleyebilir
            if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Bu gönderiyi güncellemeye yetkiniz yok.' });
            }

            post.title = title !== undefined ? title : post.title; // title boş string olsa bile güncelle
            post.content = content !== undefined ? content : post.content; // content boş string olsa bile güncelle
            // updatedAt otomatik olarak şema pre-save hook'u ile güncellenir.

            const updatedPost = await post.save();
            const populatedPost = await Post.findById(updatedPost._id).populate('author', 'username email');
            res.json(populatedPost);
        } else {
            res.status(404).json({ message: 'Gönderi bulunamadı.' });
        }
    } catch (error) {
        console.error(error);
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