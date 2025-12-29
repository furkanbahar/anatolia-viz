# Build aşaması
FROM node:22-alpine AS build

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm kaynak kodları kopyala
COPY . .

# Production build oluştur
RUN npm run build

# Production aşaması
FROM nginx:alpine

# Build edilen dosyaları nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx konfigürasyonu
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]