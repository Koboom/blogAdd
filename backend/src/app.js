// backend/src/app.js

require('dotenv').config({ path: '../.env' });

const express = require('express');
const connectDB = require('../config/db');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');
const favoriteRoutes = require('../routes/favoriteRoutes');
const path = require('path');

const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// *** GEÇİCİ TEST KODU BAŞLANGICI: ENV DEĞİŞKENLERİNİ BURADA KONTROL ET ***
console.log('--- ENV DEĞİŞKEN KONTROLÜ ---');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('--- ENV DEĞİŞKEN KONTROLÜ SONU ---');
// *** GEÇİCİ TEST KODU SONU ***

connectDB(); // Bu satırda MONGO_URI kullanılacak

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: process.env.FRONTEND_URL, // Bu değerin okunması gerekiyor
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

require('../config/passport')(passport); // Bu kısımda GOOGLE_CLIENT_ID kullanılacak

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', favoriteRoutes);

app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));