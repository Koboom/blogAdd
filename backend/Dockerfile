# backend/Dockerfile
# Node.js tabanlı imaj
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# .env dosyasını Docker imajına kopyala
# Bu, ortam değişkenlerinin doğru şekilde yüklenmesini sağlar.
COPY ./.env ./.env

# Geri kalan uygulama kodunu kopyala
COPY . .

# Portu dışarıya aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"]