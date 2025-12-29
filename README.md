# AnatoliaViz - İnteraktif Hava Durumu Görselleştirme

AnatoliaViz, Türkiye genelinde anlık hava durumu verilerini interaktif haritalar üzerinde görselleştiren modern bir web uygulamasıdır. Proje, Ventusky ve Windy gibi profesyonel platformlardan ilham alınarak geliştirilmiştir.

## Özellikler

- **İnteraktif Harita**: Leaflet.js ile responsive ve yakınlaştırılabilir harita arayüzü
- **Çoklu Hava Durumu Katmanları**: 9 farklı meteorolojik veri görselleştirmesi
  - Sıcaklık (2m)
  - Hissedilen Sıcaklık
  - Rüzgar Hızı
  - Rüzgar Hamleleri
  - Yağış Miktarı
  - Bulut Örtüsü
  - Bağıl Nem
  - Yüzey Basıncı
  - Kar Derinliği
  - Radar
- **Uydu Görüntüsü**: Gerçek arazi yapısını gösteren uydu katmanı
- **Anlık Veri**: Open-Meteo API ile güncel meteorolojik veriler
- **Detaylı Bilgi Paneli**: Tıklanan lokasyon için kapsamlı hava durumu bilgileri
- **Akıllı Arama**: 81 il ve 900+ ilçe arasında hızlı arama
- **Zoom Optimizasyonu**: Zoom seviyesine göre adaptif şehir gösterimi

## Teknolojiler

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Harita**: Leaflet.js & React-Leaflet
- **Veri Kaynağı**: Open-Meteo API
- **Container**: Docker & Nginx
- **Stil**: Vanilla CSS

## Kurulum

### Geleneksel Kurulum (Development)

**Gereksinimler:**
- Node.js 20.19+ veya 22.12+
- npm 9+

**Adımlar:**

```bash
# Repository'yi klonlayın
git clone https://github.com/furkanbahar/anatolia-viz.git
cd anatolia-viz

# Bağımlılıkları yükleyin
npm install

# Development sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

### Docker ile Kurulum (Production)

**Gereksinimler:**
- Docker Desktop veya Docker Engine

**Adımlar:**

```bash
# Docker image'ı build edin
docker build -t anatolia-viz:latest .

# Container'ı çalıştırın
docker run -d -p 8080:80 --name anatolia-viz-app anatolia-viz:latest
```

Tarayıcınızda `http://localhost:8080` adresini açın.

### Docker Yönetim Komutları

```bash
# Çalışan container'ları görüntüle
docker ps

# Container'ı durdur
docker stop anatolia-viz-app

# Container'ı yeniden başlat
docker start anatolia-viz-app

# Container'ı sil
docker rm anatolia-viz-app

# Image'ı sil
docker rmi anatolia-viz:latest

# Container loglarını görüntüle
docker logs anatolia-viz-app
```

## Kullanım

### Katman Değiştirme
Sol üst köşedeki **Layer Selector** menüsünden istediğiniz hava durumu katmanını seçin. **Satellite** checkbox'ı ile uydu görüntüsünü aktif edebilirsiniz.

### Şehir Arama
Sol üst köşedeki arama çubuğuna şehir veya ilçe adı yazın. Dropdown menüsünden seçim yapın ve harita otomatik olarak o konuma odaklanır.

### Detaylı Bilgi Görüntüleme
Harita üzerinde herhangi bir şehre tıklayın. Sağdan açılan detay panelinde tüm meteorolojik veriler görüntülenir.

### Hover Bilgi
Mouse'u şehirlerin üzerine getirerek anlık veri bilgisini popup olarak görüntüleyebilirsiniz.

## Proje Yapısı

```
anatolia-viz/
├── src/
│   ├── api/              # API servisleri
│   ├── components/       # React bileşenleri (17 adet)
│   ├── data/            # GeoJSON ve lokasyon verileri
│   ├── utils/           # Yardımcı fonksiyonlar
│   ├── App.jsx          # Ana uygulama
│   ├── MapComponent.jsx # Harita ana bileşeni
│   └── index.css        # Global stiller
├── public/              # Statik dosyalar
├── Dockerfile           # Docker konfigürasyonu
├── nginx.conf           # Nginx ayarları
├── .dockerignore        # Docker build hariçleri
├── package.json         # npm bağımlılıkları
└── vite.config.js       # Vite ayarları
```

## Proje'den örnek resimler
<img width="1919" height="950" alt="Screenshot 2025-12-29 224255" src="https://github.com/user-attachments/assets/15cb3c32-1870-467e-bb76-0345f763fff3" />

<img width="1919" height="930" alt="Screenshot 2025-12-29 224428" src="https://github.com/user-attachments/assets/6954fec8-f251-43d5-bf21-345552bdc8ba" />


## Özellikler Detay

### IDW Interpolasyon
Sıcaklık katmanları için Inverse Distance Weighting algoritması kullanılarak smooth ve gerçekçi renk gradyanları oluşturulmuştur.

### Vektör Animasyonları
Rüzgar katmanında vektör tabanlı ok animasyonları ile yön ve hız görselleştirilmektedir.

### Parçacık Sistemleri
Yağış katmanında CSS particle effects ile animasyonlu yağmur gösterimi yapılmaktadır.

### Multi-Stage Docker Build
İki aşamalı Docker build (Node.js build + Nginx production) ile optimize edilmiş ve hafif image elde edilmiştir.

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

Proje Sahibi: Furkan Bahar

GitHub: [github.com/furkanbahar/anatolia-viz](https://github.com/furkanbahar/anatolia-viz)

## Teşekkürler

- [Open-Meteo API](https://open-meteo.com/) - Ücretsiz hava durumu verileri
- [Leaflet.js](https://leafletjs.com/) - Açık kaynak harita kütüphanesi
- [React](https://react.dev/) - UI kütüphanesi
- [Esri](https://www.esri.com/) - Uydu görüntüleri

