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
      try {
        const response = await axios.get(BASE_URL, {
          params,
          timeout: 30000 // 30 saniye timeout
        });
        allResponses.push(response);
      } catch (chunkError) {
        console.error(`❌ Chunk ${i + 1} hatası:`, chunkError.message);
        // Bu chunk'ı atla ve devam et
        continue;
      }

      if (i < chunks.length - 1) {
        await sleep(2000); // Daha kısa bekleme süresi
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

    // Önce eski cache'i dene
    const oldCache = localStorage.getItem(CACHE_KEY);
    if (oldCache) {
      console.log('⚠️ Eski cache kullanılıyor');
      const { data } = JSON.parse(oldCache);
      return data;
    }

    // Cache de yoksa, örnek veri ver (en azından harita görünsün)
    console.log('⚠️ API ve cache başarısız, örnek veri kullanılıyor');
    const sampleData = TURKEY_LOCATIONS.slice(0, 20).map(loc => ({
      name: loc.name,
      type: loc.type,
      lat: loc.lat,
      lon: loc.lon,
      current_weather: {
        temperature: 15 + Math.random() * 10,
        windspeed: 10 + Math.random() * 20,
        winddirection: Math.random() * 360,
        weathercode: 0,
        time: new Date().toISOString()
      },
      hourly: {
        temperature_2m: Array(168).fill(0).map(() => 15 + Math.random() * 10),
        apparent_temperature: Array(168).fill(0).map(() => 15 + Math.random() * 10),
        precipitation: Array(168).fill(0).map(() => Math.random() * 5),
        weather_code: Array(168).fill(0).map(() => Math.floor(Math.random() * 3)),
        cloud_cover: Array(168).fill(0).map(() => Math.random() * 100),
        wind_speed_10m: Array(168).fill(0).map(() => 10 + Math.random() * 20),
        wind_direction_10m: Array(168).fill(0).map(() => Math.random() * 360),
        wind_gusts_10m: Array(168).fill(0).map(() => 15 + Math.random() * 30),
        surface_pressure: Array(168).fill(0).map(() => 1000 + Math.random() * 30),
        relative_humidity_2m: Array(168).fill(0).map(() => 40 + Math.random() * 40),
        snow_depth: Array(168).fill(0)
      }
    }));

    return sampleData;
  }
}

export function clearWeatherCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ Cache temizlendi');
}