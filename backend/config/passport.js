// backend/config/passport.js

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // User modelimizi import ediyoruz

// Bu modülü bir fonksiyon olarak export ediyoruz ve passport nesnesini argüman olarak alıyoruz
module.exports = function(passport) { // <<< BU SATIRI EKLEYİN
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL // Burası .env'den geliyor olmalı
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // Kullanıcı zaten varsa, oturum aç
                done(null, user);
            } else {
                // Kullanıcı yoksa, yeni bir kullanıcı oluştur ve kaydet
                user = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    role: 'user', // Varsayılan rol
                    // Şifre alanı Google ile girişte boş kalacak
                });

                await user.save();
                done(null, user);
            }
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    }));

    // Kullanıcı oturumunu yönetmek için:
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}; // <<< BU SATIRI EKLEYİN