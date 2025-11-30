// src/utils/dataProcessor.js

/**
 * Birden çok şehir verisinden, Heatmap formatı için veri noktasını ayıklar.
 * @param {Array<object>} cityDataArray - getWeatherData'dan gelen şehir verileri dizisi.
 * @param {number} hourIndex - Kullanılacak tahmin saati (0: anlık).
 * @param {string} variableName - Kullanılacak değişken (örn: 'temperature_2m').
 * @returns {Array<Array<number>>} - [[lat, lon, value], ...] formatında veri dizisi.
 */
export function processToHeatmap(cityDataArray, hourIndex = 0, variableName = 'temperature_2m') {
  if (!cityDataArray || cityDataArray.length === 0) {
    return [];
  }

  const heatmapData = [];

  cityDataArray.forEach(cityData => {
    const lat = cityData.lat;
    const lon = cityData.lon;
    // İstenen değişkenin tüm saatlik tahmin değerlerini al
    const values = cityData.hourly ? cityData.hourly[variableName] : null;

    if (values && values.length > hourIndex) {
      // İstenen saate (hourIndex) ait değeri al
      const value = values[hourIndex]; 
      
      // Leaflet Heatmap formatına ekle: [enlem, boylam, değer]
      heatmapData.push([lat, lon, value]);
    }
  });
  
  return heatmapData;
}