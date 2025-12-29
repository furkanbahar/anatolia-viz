// src/components/LayerSelector.jsx

import React from 'react';
import './LayerSelector.css';

function LayerSelector({ activeLayer, onLayerChange, satelliteEnabled, onSatelliteToggle }) {
  const layers = [
    { id: 'temperature_2m', label: 'Sıcaklık', icon: '🌡️' },
    { id: 'apparent_temperature', label: 'Hissedilen', icon: '🔥' },
    { id: 'precipitation', label: 'Yağış', icon: '💧' },
    { id: 'weather_code', label: 'Radar', icon: '📡' },
    { id: 'cloud_cover', label: 'Bulutlar', icon: '☁️' },
    { id: 'wind_speed_10m', label: 'Rüzgar Hızı', icon: '💨' },
    { id: 'wind_gusts_10m', label: 'Rüzgar Hamlesi', icon: '🌬️' },
    { id: 'surface_pressure', label: 'Hava Basıncı', icon: '⏲️' },
    { id: 'relative_humidity_2m', label: 'Nem', icon: '💧' },
    { id: 'snow_depth', label: 'Kar Kalınlığı', icon: '❄️' },
  ];

  return (
    <div className="layer-selector">
      <div className="layer-header">
        <span className="layer-title">Katmanlar</span>
      </div>

      {/* Satellite Toggle */}
      <div className="satellite-toggle-container">
        <div
          className={`satellite-toggle ${satelliteEnabled ? 'active' : ''}`}
          onClick={onSatelliteToggle}
        >
          <span className="layer-icon">🛰️</span>
          <span className="layer-label">Uydu Görüntüsü</span>
          <span className="toggle-indicator">{satelliteEnabled ? '✓' : '○'}</span>
        </div>
      </div>

      <div className="layer-list">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`layer-item ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => onLayerChange(layer.id, layer.id.includes('wind') ? 'km/s' : '°C')}
          >
            <span className="layer-icon">{layer.icon}</span>
            <span className="layer-label">{layer.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerSelector;