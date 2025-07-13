# backend/Dockerfile
# Node.js tabanlı imaj
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Geri kalan uygulama kodunu kopyala
COPY . .

# Ortam değişkenlerini (örneğin MONGO_URI) Dockerfile'a direkt yazmayın.
# Docker Compose veya Kubernetes secret'ları kullanacağız.

# Portu dışarıya aç
EXPOSE 5000

# Uygulamayı başlat
CMD ["npm", "start"]