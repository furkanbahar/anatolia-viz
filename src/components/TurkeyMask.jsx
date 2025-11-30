// src/components/TurkeyMask.jsx
import React from 'react';
import { Polygon } from 'react-leaflet';

// Dünya'yı kaplayan büyük bir dikdörtgen (Outer Ring)
const WORLD_COORDS = [
    [90, -180],
    [90, 180],
    [-90, 180],
    [-90, -180],
    [90, -180] // Kapatmak için başa dön
];

// Türkiye'nin kabaca sınırları (Inner Ring - Hole)
const TURKEY_BORDER = [
    [41.9, 26.0], // Kuzeybatı (Edirne)
    [42.2, 27.5],
    [41.5, 28.5],
    [41.2, 29.2], // İstanbul Boğazı çıkışı
    [41.5, 31.0], // Karadeniz kıyısı
    [42.0, 35.0], // Sinop
    [41.5, 38.0],
    [41.0, 40.0],
    [41.5, 41.5], // Artvin
    [41.0, 43.5], // Ermenistan sınırı
    [39.5, 44.5], // Ağrı
    [38.0, 44.5], // Van
    [37.0, 44.5], // Hakkari
    [37.0, 42.5], // Irak sınırı
    [37.2, 40.0], // Mardin
    [36.5, 38.0], // Suriye sınırı
    [36.0, 36.0], // Hatay
    [36.5, 35.5], // İskenderun
    [36.0, 33.0], // Anamur
    [36.5, 30.5], // Antalya
    [36.5, 29.0], // Fethiye
    [37.0, 27.0], // Muğla/Bodrum
    [38.5, 26.0], // İzmir
    [39.5, 26.0], // Çanakkale
    [40.5, 26.0], // Saros
    [41.9, 26.0]  // Başa dön
];

function TurkeyMask() {
    // Leaflet'te "Delikli Poligon" mantığı: [Dış Sınır, İç Sınır (Delik)]
    // Dış sınır tüm dünya, iç sınır Türkiye. Böylece Türkiye hariç her yer boyanır.
    const maskCoords = [WORLD_COORDS, TURKEY_BORDER];

    return (
        <Polygon
            positions={maskCoords}
            pathOptions={{
                color: 'transparent', // Sınır çizgisi yok (Temiz görünüm)
                fillColor: '#000000', // Dolgu rengi (Siyah)
                fillOpacity: 0.6,     // Yarı saydam (Dünya karanlık, Türkiye aydınlık)
                weight: 0,
                zIndex: 900
            }}
        />
    );
}

export default TurkeyMask;
