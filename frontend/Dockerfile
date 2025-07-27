# frontend/Dockerfile

FROM node:18

# pnpm'i global olarak yükle
RUN npm install -g pnpm

WORKDIR /app

# package.json dosyasını kopyala
COPY package.json ./
# pnpm-lock.yaml varsa, onu da kopyala (eğer projenizde varsa)
# COPY pnpm-lock.yaml ./

# Bağımlılıkları pnpm ile yükle
RUN pnpm install --force

# *** BU SATIRI SİLİYORUZ (npm ve pnpm'i karıştırmamak için) ***
# RUN npm install @rollup/rollup-linux-x64-gnu rollup rollup-plugin-node-resolve --save-dev

# Uygulama kodunun geri kalanını kopyala
COPY ./public ./public
COPY ./src ./src
COPY ./index.html ./
COPY ./vite.config.js ./
# Eğer projenizde bir .env dosyası varsa (örneğin backend API adresi için):
# COPY ./.env ./

EXPOSE 5173

# pnpm ile geliştirme sunucusunu çalıştır
CMD ["pnpm", "run", "dev"]