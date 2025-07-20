// backend/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Doğrudan container içindeki /app/uploads dizinini hedefle
    // Docker Compose ile bu dizini host'taki uploads klasörüne bağladık.
    cb(null, '/app/uploads'); // <-- BURAYI DÜZELTİYORUZ
  },
  filename: (req, file, cb) => {
    // Benzersiz bir dosya adı oluştur: alanadı-timestamp.uzantı
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB dosya boyutu limiti
  },
});

module.exports = upload;