// src/components/SatelliteLayer.jsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * SatelliteLayer component adds satellite/terrain imagery to the map
 * Uses OpenStreetMap Satellite tiles or similar providers
 */
function SatelliteLayer({ enabled = true, opacity = 1.0 }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    // Using ESRI World Imagery (high quality satellite imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
        opacity: opacity,
        zIndex: 0  // Behind everything else
      }
    );

    satelliteLayer.addTo(map);

    return () => {
      map.removeLayer(satelliteLayer);
    };
  }, [map, enabled, opacity]);

  return null;
}

export default SatelliteLayer;
