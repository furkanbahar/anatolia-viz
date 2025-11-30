// src/components/DetailPanel.jsx
import React from 'react';
import './DetailPanel.css';

function DetailPanel({ data, isOpen, onClose }) {
    if (!data) return null;

    // Tarih formatlayıcı
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    // Hava durumu kodu ikon eşleştirme (Basit)
    const getWeatherIcon = (code) => {
        if (code <= 3) return '☀️'; // Açık/Parçalı
        if (code <= 48) return '☁️'; // Sisli
        if (code <= 67) return '🌧️'; // Yağmurlu
        if (code <= 77) return '❄️'; // Karlı
        if (code <= 82) return '⛈️'; // Sağanak
        return '🌥️';
    };

    // Günlük tahminleri oluştur (Anlık veri yapısından çıkarım)
    // Not: Open-Meteo hourly verisinden günlük özet çıkarmak biraz işlem gerektirir.
    // Basitlik için her günün öğlen 12:00 verisini alacağız.
    const dailyForecasts = [];
    if (data.hourly && data.hourly.time) {
        for (let i = 0; i < 7; i++) {
            const index = i * 24 + 12; // Her günün 12. saati (Öğlen)
            if (index < data.hourly.time.length) {
                dailyForecasts.push({
                    date: data.hourly.time[index],
                    temp: data.hourly.temperature_2m[index],
                    code: data.hourly.weather_code[index],
                    wind: data.hourly.wind_speed_10m[index]
                });
            }
        }
    }

    return (
        <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={onClose}>×</button>

            <div className="panel-header">
                <h2>{data.name}</h2>
                <span className="panel-subtitle">{data.type === 'il' ? 'İl Merkezi' : 'İlçe'}</span>
            </div>

            <div className="current-status">
                <div className="big-icon">
                    {getWeatherIcon(data.current_weather?.weathercode || 0)}
                </div>
                <div className="big-temp">
                    {data.current_weather?.temperature || data.hourly?.temperature_2m[0]}°
                </div>
                <div className="status-desc">
                    Rüzgar: {data.current_weather?.windspeed || 0} km/s
                </div>
            </div>

            <div className="forecast-list">
                <h3>7 Günlük Tahmin</h3>
                {dailyForecasts.map((day, idx) => (
                    <div key={idx} className="forecast-item">
                        <span className="day-name">{formatDate(day.date)}</span>
                        <span className="day-icon">{getWeatherIcon(day.code)}</span>
                        <span className="day-temp">{day.temp}°</span>
                        <span className="day-wind">{day.wind} km/s</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DetailPanel;
