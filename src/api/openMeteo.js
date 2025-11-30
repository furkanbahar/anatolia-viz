// src/api/openMeteo.js
import axios from 'axios';
import { TURKEY_LOCATIONS } from '../data/turkey_locations';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'anatolia_weather_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 saat

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      console.log('✅ Cache kullanılıyor');
      return data;
    }

    console.log('⏰ Cache süresi doldu');
    return null;
  } catch (error) {
    console.error('Cache okuma hatası:', error);
    return null;
  }
}

function setCachedData(data) {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    console.log('💾 Cache kaydedildi');
  } catch (error) {
    console.error('Cache kaydetme hatası:', error);
  }
}

export async function getWeatherData() {
  const cachedData = getCachedData();
  if (cachedData) {
    return cachedData;
  }

  console.log('🌐 Veri çekiliyor...', TURKEY_LOCATIONS.length, 'lokasyon');

  const CHUNK_SIZE = 50;
  const chunks = [];

  for (let i = 0; i < TURKEY_LOCATIONS.length; i += CHUNK_SIZE) {
    chunks.push(TURKEY_LOCATIONS.slice(i, i + CHUNK_SIZE));
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    const allResponses = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const lats = chunk.map(loc => loc.lat).join(',');
      const lons = chunk.map(loc => loc.lon).join(',');

      const params = {
        latitude: lats,
        longitude: lons,
        current_weather: true,
        hourly: 'temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,relative_humidity_2m,snow_depth',
        forecast_days: 7,
        timezone: 'auto',
      };

      console.log(`📡 İstek ${i + 1}/${chunks.length}`);
      const response = await axios.get(BASE_URL, { params });
      allResponses.push(response);

      if (i < chunks.length - 1) {
        await sleep(4000);
      }
    }

    let allLocationData = [];
    allResponses.forEach(res => {
      const data = Array.isArray(res.data) ? res.data : [res.data];
      allLocationData = allLocationData.concat(data);
    });

    const processedData = allLocationData.map((locationData, index) => {
      const loc = TURKEY_LOCATIONS[index];

      return {
        ...locationData,
        name: loc.name,
        type: loc.type,
        lat: loc.lat,
        lon: loc.lon,
      };
    });

    setCachedData(processedData);
    console.log('✅ Başarılı!', processedData.length, 'lokasyon');

    return processedData;

  } catch (error) {
    console.error('❌ API hatası:', error);

    const oldCache = localStorage.getItem(CACHE_KEY);
    if (oldCache) {
      console.log('⚠️ Eski cache kullanılıyor');
      const { data } = JSON.parse(oldCache);
      return data;
    }

    return [];
  }
}

export function clearWeatherCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Cache temizlendi');
}