// src/components/WindLayer.jsx
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function WindLayer({ data }) {
    const map = useMap();
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const animationFrameId = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Canvas oluştur ve haritaya ekle
        const canvas = L.DomUtil.create('canvas', 'leaflet-wind-layer');
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none'; // Harita etkileşimini engelleme
        canvas.style.zIndex = 500; // Heatmap'in üzerinde

        const pane = map.getPanes().overlayPane;
        pane.appendChild(canvas);
        canvasRef.current = canvas;

        // Parçacıkları başlat
        initParticles();

        // Animasyonu başlat
        animate();

        // Harita hareket ettiğinde canvas'ı güncelle
        map.on('moveend', resetCanvas);
        map.on('zoomend', resetCanvas);
        resetCanvas(); // İlk boyutlandırma

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            map.off('moveend', resetCanvas);
            map.off('zoomend', resetCanvas);
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [data, map]);

    const initParticles = () => {
        const count = 300; // Parçacık sayısı
        particles.current = [];
        for (let i = 0; i < count; i++) {
            particles.current.push({
                x: Math.random() * map.getSize().x,
                y: Math.random() * map.getSize().y,
                age: Math.random() * 100,
                speed: 0,
                angle: 0
            });
        }
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;

        // Harita konumuna göre canvas'ı yerleştir
        const topLeft = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvas, topLeft);

        initParticles(); // Pozisyonlar değiştiği için parçacıkları sıfırla
    };

    const getWindAtPoint = (x, y) => {
        // Ekran koordinatını (x,y) LatLng'ye çevir
        const latlng = map.containerPointToLatLng([x, y]);

        // En yakın veri noktasını bul (Basit Nearest Neighbor)
        // Performans için optimize edilebilir (Quadtree vb.) ama şimdilik basit döngü
        let closest = null;
        let minDist = Infinity;

        // Sadece ekrandaki noktaları tarayabiliriz ama veri seti küçük (81 il) olduğu için hepsini tarayalım
        for (const city of data) {
            const d = Math.pow(city.lat - latlng.lat, 2) + Math.pow(city.lon - latlng.lng, 2);
            if (d < minDist) {
                minDist = d;
                closest = city;
            }
        }

        // Eğer çok uzaksa (örn: Türkiye dışı) rüzgar yok say
        if (minDist > 2.0) return null;

        if (closest && closest.hourly) {
            // Rüzgar hızı ve yönü (0. saat)
            const speed = closest.hourly.wind_speed_10m[0];
            const dir = closest.hourly.wind_direction_10m[0];
            return { speed, dir };
        }
        return null;
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Yarı saydam iz bırakma efekti (Motion blur)
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();

        particles.current.forEach(p => {
            // Mevcut konumdaki rüzgarı al
            const wind = getWindAtPoint(p.x, p.y);

            if (wind) {
                // Açıyı radyana çevir (Meteorolojik açı: 0=Kuzey, 90=Doğu)
                // Canvas açısı: 0=Sağ(Doğu), 90=Aşağı(Güney)
                // Dönüşüm: (Dir - 90) * (PI / 180)
                const angleRad = (wind.dir - 90) * (Math.PI / 180);

                // Hız faktörü
                const speedFactor = wind.speed * 0.15;

                p.x += Math.cos(angleRad) * speedFactor;
                p.y += Math.sin(angleRad) * speedFactor;
            } else {
                // Rüzgar yoksa yavaşça rastgele hareket et
                p.x += (Math.random() - 0.5);
                p.y += (Math.random() - 0.5);
            }

            // Ömür kontrolü ve ekran dışına çıkma
            p.age++;
            if (p.age > 100 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * canvas.height;
                p.age = 0;
            }

            // Çiz
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 2, p.y + 2); // Kısa çizgi
        });

        ctx.stroke();
        animationFrameId.current = requestAnimationFrame(animate);
    };

    return null;
}

export default WindLayer;
