const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // User modelimizi import ediyoruz

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Kullanıcı zaten varsa, oturum aç
            done(null, user);
        } else {
            // Kullanıcı yoksa, yeni bir kullanıcı oluştur ve kaydet
            // Google'dan gelen bilgileri kullanarak yeni bir kullanıcı oluşturuyoruz
            user = new User({
                googleId: profile.id,
                username: profile.displayName, // Google profilinden kullanıcı adı
                email: profile.emails[0].value, // Google profilinden e-posta
                // Şifre alanı boş kalacak, çünkü Google ile giriş yapıyor
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
// Kullanıcı nesnesini oturumda saklamak için seri hale getir
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Oturumdan kullanıcı nesnesini geri almak için seri dışı hale getir
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});