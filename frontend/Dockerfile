# frontend/Dockerfile

# Node.js 18 sürümünün tam imajını kullan (Alpine olmayan)
FROM node:18

# Çalışma dizinini /app olarak ayarla (konteyner içinde)
WORKDIR /app

# package.json ve package-lock.json dosyalarını konteynere kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN rm -rf node_modules && npm cache clean --force
RUN npm install --force

# *** Geçici Kontrol Satırı: npm install sonrası node_modules/.bin klasörünün içeriğini listele ***
# Bu satırı build çıktısında görmek istiyoruz
RUN ls -l node_modules/.bin/
# ******************************************************************************************

# Geri kalan tüm uygulama kodunu kopyala
COPY . .

# Uygulamanın çalışacağı portu belirt
EXPOSE 5173

# UYGULAMAYI BAŞLAT: Vite'ı doğrudan node_modules/.bin/vite yolundan çalıştırıyoruz
CMD ["/app/node_modules/.bin/vite"]