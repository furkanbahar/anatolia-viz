import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import './index.css';
import { getWeatherData } from './api/openMeteo';
import { processToHeatmap } from './utils/dataProcessor';
import LayerSelector from './components/LayerSelector';
import HoverCard from './components/HoverCard';
import WindLayer from './components/WindLayer';
import RainLayer from './components/RainLayer';
import DetailPanel from './components/DetailPanel';
import Logo from './components/Logo';
import SearchBar from './components/SearchBar';
import Legend from './components/Legend';
import ZoomControl from './components/ZoomControl';
import TemperatureLayer from './components/TemperatureLayer';
import SatelliteLayer from './components/SatelliteLayer';

import turkeyGeoJSON from './data/turkey_provinces.json';
import { TURKEY_LOCATIONS } from './data/turkey_locations';

const INITIAL_CENTER = [39.0, 35.0];
const INITIAL_ZOOM = 6;
const MAJOR_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Gaziantep', 'Konya'];

// Ventusky‑style temperature gradient & Units
const LAYER_CONFIG = {
  temperature_2m: {
    label: 'Sıcaklık',
    unit: '°C',
    max: 40,
    min: -10,
    gradient: {
      0.0: '#1e3a8a',   // Koyu mavi (soğuk)
      0.15: '#3b82f6',  // Açık mavi
      0.3: '#60a5fa',   // Yumuşak mavi
      0.45: '#a5f3fc',  // Çok açık mavi/turkuaz
      0.55: '#fde047',  // Yumuşak sarı (ılık)
      0.7: '#fb923c',   // Yumuşak turuncu
      0.85: '#f97316',  // Turuncu
      0.95: '#dc2626',  // Kırmızı (sıcak)
      1.0: '#991b1b'    // Koyu kırmızı/bordo (çok sıcak)
    }
  },
  apparent_temperature: {
    label: 'Hissedilen',
    unit: '°C',
    max: 40,
    min: -10,
    gradient: {
      0.0: '#1e3a8a',   // Koyu mavi (soğuk)
      0.15: '#3b82f6',  // Açık mavi
      0.3: '#60a5fa',   // Yumuşak mavi
      0.45: '#a5f3fc',  // Çok açık mavi/turkuaz
      0.55: '#fde047',  // Yumuşak sarı (ılık)
      0.7: '#fb923c',   // Yumuşak turuncu
      0.85: '#f97316',  // Turuncu
      0.95: '#dc2626',  // Kırmızı (sıcak)
      1.0: '#991b1b'    // Koyu kırmızı/bordo (çok sıcak)
    }
  },
  wind_speed_10m: {
    label: 'Rüzgar',
    unit: ' km/h',
    max: 100,
    min: 0,
    gradient: {
      0.0: '#ffffff',
      0.2: '#ccffff',
      0.4: '#99ff99',
      0.6: '#ffff99',
      0.8: '#ffcc00',
      1.0: '#ff0000'
    }
  },
  precipitation: {
    label: 'Yağış',
    unit: ' mm',
    max: 20,
    min: 0,
    gradient: {
      0.0: '#ffffff',
      0.2: '#ccffff',
      0.5: '#0099ff',
      1.0: '#000066'
    }
  },
  cloud_cover: {
    label: 'Bulut',
    unit: '%',
    max: 100,
    min: 0,
    gradient: {
      0.0: '#ffffff', // clear
      0.5: '#cccccc', // cloudy
      1.0: '#444444'  // overcast
    }
  },
  relative_humidity_2m: {
    label: 'Nem',
    unit: '%',
    max: 100,
    min: 0,
    gradient: {
      0.0: '#ffffcc',
      0.5: '#66ccff',
      1.0: '#000099'
    }
  },
  surface_pressure: {
    label: 'Basınç',
    unit: ' hPa',
    max: 1030,
    min: 990,
    gradient: {
      0.0: '#0000ff',
      0.5: '#00ff00',
      1.0: '#ff0000'
    }
  },
  snow_depth: {
    label: 'Kar',
    unit: ' m',
    max: 2,
    min: 0,
    gradient: {
      0.0: '#ffffff',
      0.5: '#ccffff',
      1.0: '#00ffff'
    }
  },
  weather_code: {
    label: 'Radar',
    unit: ' dBZ',
    max: 99,
    min: 0,
    gradient: {
      0.0: '#00000000', // Clear (Transparent)
      0.2: '#00ff00',   // Light Rain
      0.4: '#ffff00',   // Moderate
      0.6: '#ff9900',   // Heavy
      0.8: '#ff0000',   // Storm
      1.0: '#800080'    // Violent
    }
  },
  wind_gusts_10m: {
    label: 'Rüzgar Hamlesi',
    unit: ' km/h',
    max: 120,
    min: 0,
    gradient: {
      0.0: '#ffffff',
      0.5: '#ffff00',
      1.0: '#ff0000'
    }
  }
};

function findNearestWeatherData(weatherData, loc) {
  if (!weatherData || weatherData.length === 0) return null;
  // Exact or partial name match
  let city = weatherData.find(c => c.name === loc.name || c.name.includes(loc.name) || loc.name.includes(c.name));
  if (city) return city;
  // Nearest by Euclidean distance
  let minDist = Infinity;
  let nearest = null;
  weatherData.forEach(c => {
    const dist = Math.hypot(c.lat - loc.lat, c.lon - loc.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = c;
    }
  });
  return nearest;
}

function HeatmapLayer({ data, config }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (!data || data.length === 0) return;
    const min = config?.min || 0;
    const maxVal = (config?.max || 100) - min;
    const points = data.map(p => [p[0], p[1], Math.max(0, p[2] - min)]);
    const heat = L.heatLayer(points, {
      radius: 30,
      blur: 30,
      maxZoom: 18,
      scaleRadius: true,
      max: maxVal,
      minOpacity: 0.5,
      gradient: config?.gradient
    });
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [data, map, config]);
  return null;
}

function InteractionLayer({ weatherData, onHover, onClick, currentLayer }) {
  const currentHour = new Date().getHours();
  const map = useMap(); // Get map instance to check zooming

  useMapEvents({
    mousemove(e) {
      if (!weatherData) return;

      let closest = null;
      let minDist = Infinity;
      weatherData.forEach(city => {
        const dist = Math.hypot(city.lat - e.latlng.lat, city.lon - e.latlng.lng);
        if (dist < minDist) {
          minDist = dist;
          closest = city;
        }
      });
      if (closest && minDist < 0.5) {
        let value = 'N/A';
        if (currentLayer === 'temperature_2m' && closest.current_weather) value = closest.current_weather.temperature;
        else if (currentLayer === 'wind_speed_10m' && closest.current_weather) value = closest.current_weather.windspeed;
        else if (closest.hourly && closest.hourly[currentLayer]) value = closest.hourly[currentLayer][currentHour];

        // Use unit from config
        const unit = LAYER_CONFIG[currentLayer]?.unit || '';
        onHover({ data: { ...closest, value }, position: e.containerPoint });
      } else {
        onHover(null);
      }
    },
    click(e) {
      if (!weatherData) return;
      let closest = null;
      let minDist = Infinity;
      weatherData.forEach(city => {
        const dist = Math.hypot(city.lat - e.latlng.lat, city.lon - e.latlng.lng);
        if (dist < minDist) {
          minDist = dist;
          closest = city;
        }
      });
      if (closest && minDist < 0.5) onClick(closest);
    },
    mouseout() { onHover(null); }
  });
  return null;
}

function ZoomBasedMarkers({ weatherData, onHover, onClick }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map]);

  const visibleLocations = TURKEY_LOCATIONS.filter(loc => {
    if (zoom < 6.5) return loc.type === 'il' && MAJOR_CITIES.some(city => loc.name.includes(city));
    else if (zoom < 7.5) return loc.type === 'il';
    else return true;
  });

  const handleClick = (loc) => {
    const cityData = findNearestWeatherData(weatherData, loc);
    if (cityData) onClick(cityData);
  };

  const handleMouseOver = (loc, e) => {
    const cityData = findNearestWeatherData(weatherData, loc);
    if (cityData) {
      const currentHour = new Date().getHours();
      const value = cityData.current_weather ? cityData.current_weather.temperature : cityData.hourly?.temperature_2m?.[currentHour] || 'N/A';
      onHover({ data: { ...cityData, name: loc.name, value }, position: e.containerPoint });
    }
  };

  return (
    <>
      {visibleLocations.map((loc, idx) => (
        <Marker
          key={`loc-${idx}`}
          position={[loc.lat, loc.lon]}
          icon={L.divIcon({
            className: loc.type === 'il' ? 'province-label' : 'district-label',
            html: loc.name,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
          })}
          eventHandlers={{
            click: () => handleClick(loc),
            mouseover: (e) => handleMouseOver(loc, e),
            mouseout: () => onHover(null)
          }}
        />
      ))}
    </>
  );
}

function MapComponent() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHourIndex] = useState(0);
  const [currentLayer, setCurrentLayer] = useState('temperature_2m');
  const [currentUnit, setCurrentUnit] = useState('°C');
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [satelliteEnabled, setSatelliteEnabled] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getWeatherData();
      setWeatherData(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleLayerChange = (layerId, unit) => {
    setCurrentLayer(layerId);
    // Update unit from config if available
    const configUnit = LAYER_CONFIG[layerId]?.unit || unit;
    setCurrentUnit(configUnit);
  };

  const handleSearchSelect = (loc) => {
    if (weatherData) {
      const cityData = findNearestWeatherData(weatherData, loc);
      if (cityData) setSelectedCity(cityData);
    }
  };

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f0e8', color: '#333' }}><h2>AnatoliaViz Yükleniyor...</h2></div>;
  if (!weatherData || weatherData.length === 0) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'red' }}><h2>Veri Alınamadı.</h2></div>;

  const heatmapData = processToHeatmap(weatherData, currentHourIndex, currentLayer);
  const layerConfig = LAYER_CONFIG[currentLayer] || {};

  return (
    <>
      <Logo />
      <LayerSelector
        activeLayer={currentLayer}
        onLayerChange={handleLayerChange}
        satelliteEnabled={satelliteEnabled}
        onSatelliteToggle={() => setSatelliteEnabled(!satelliteEnabled)}
      />
      <Legend currentLayer={currentLayer} config={layerConfig} />
      <DetailPanel data={selectedCity} isOpen={!!selectedCity} onClose={() => setSelectedCity(null)} />
      {hoverInfo && !selectedCity && (
        <HoverCard data={hoverInfo.data} position={hoverInfo.position} unit={currentUnit} layerName={layerConfig.label || ''} />
      )}
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ height: '100vh', width: '100%', background: '#f5f0e8' }}
        minZoom={5}
        maxZoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* Satellite Layer - Shows real terrain, mountains, green areas */}
        <SatelliteLayer enabled={satelliteEnabled} opacity={0.8} />

        <SearchBar onSelect={handleSearchSelect} />
        <ZoomControl />
        <GeoJSON
          data={turkeyGeoJSON}
          style={{
            color: satelliteEnabled ? '#FF6B35' : '#333',
            weight: satelliteEnabled ? 2 : 1.5,
            fillOpacity: 0,
            fillColor: 'transparent',
            opacity: satelliteEnabled ? 0.9 : 1
          }}
          interactive={false}
        />
        <ZoomBasedMarkers weatherData={weatherData} onHover={setHoverInfo} onClick={setSelectedCity} />

        {/* Render TemperatureLayer for temperature-like layers if we want smooth gradient for them too? 
            For now, only temperature_2m and apparent_temperature use the smooth IDW layer. 
            Others use HeatmapLayer or specific layers. */}
        {(currentLayer === 'temperature_2m' || currentLayer === 'apparent_temperature') && weatherData && (
          <TemperatureLayer
            data={weatherData}
            config={layerConfig}
            boundaryGeoJSON={turkeyGeoJSON}
            layerId={currentLayer}
          />
        )}

        {/* Use standard HeatmapLayer for others if not specific */}
        {currentLayer !== 'temperature_2m' && currentLayer !== 'apparent_temperature' && currentLayer !== 'wind_speed_10m' && currentLayer !== 'precipitation' && heatmapData.length > 0 && (
          <HeatmapLayer data={heatmapData} config={layerConfig} />
        )}

        {currentLayer === 'wind_speed_10m' && weatherData && <WindLayer data={weatherData} />}
        {currentLayer === 'precipitation' && weatherData && <RainLayer data={weatherData} />}

        <InteractionLayer weatherData={weatherData} onHover={setHoverInfo} onClick={setSelectedCity} currentLayer={currentLayer} />
      </MapContainer>
    </>
  );
}

export default MapComponent;