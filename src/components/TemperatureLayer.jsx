import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const TemperatureLayer = ({ data, config, boundaryGeoJSON, layerId }) => {
    const map = useMap();
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        const canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
        canvas.style.pointerEvents = 'none';
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = 200;

        const overlayPane = map.getPanes().overlayPane;
        overlayPane.appendChild(canvas);
        canvasRef.current = canvas;

        const draw = () => {
            if (!data || data.length === 0) return;

            const size = map.getSize();
            const scaleFactor = 0.25;
            const width = Math.ceil(size.x * scaleFactor);
            const height = Math.ceil(size.y * scaleFactor);

            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${size.x}px`;
            canvas.style.height = `${size.y}px`;

            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            if (boundaryGeoJSON) {
                ctx.beginPath();
                boundaryGeoJSON.features.forEach(feature => {
                    const geometry = feature.geometry;
                    if (geometry.type === 'Polygon') {
                        drawPolygon(ctx, geometry.coordinates, map, scaleFactor);
                    } else if (geometry.type === 'MultiPolygon') {
                        geometry.coordinates.forEach(polygonCoords => {
                            drawPolygon(ctx, polygonCoords, map, scaleFactor);
                        });
                    }
                });
                ctx.clip();
            }

            const currentHour = new Date().getHours();

            const points = data.map(d => {
                const latLng = L.latLng(d.lat, d.lon);
                const point = map.latLngToContainerPoint(latLng);

                let val = 0;
                if (layerId === 'temperature_2m') {
                    val = d.current_weather ? d.current_weather.temperature : (d.hourly?.temperature_2m?.[currentHour] || 0);
                } else if (layerId === 'apparent_temperature') {
                    val = d.hourly?.apparent_temperature?.[currentHour] || 0;
                } else {
                    // Fallback for other layers if we use this component for them
                    val = d.hourly?.[layerId]?.[currentHour] || 0;
                }

                return {
                    x: point.x * scaleFactor,
                    y: point.y * scaleFactor,
                    val: val
                };
            });

            const imgData = ctx.createImageData(width, height);
            const pixels = imgData.data;

            // Parse gradient from config
            let stops = [];
            if (config && config.gradient) {
                stops = Object.entries(config.gradient)
                    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                    .map(([stop, color]) => {
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        return { t: parseFloat(stop), color: [r, g, b] };
                    });
            } else {
                // Default fallback
                stops = [
                    { t: 0.0, color: [0, 0, 255] },
                    { t: 1.0, color: [255, 0, 0] }
                ];
            }

            const getGradientColor = (t) => {
                let lower = stops[0];
                let upper = stops[stops.length - 1];

                for (let i = 0; i < stops.length - 1; i++) {
                    if (t >= stops[i].t && t <= stops[i + 1].t) {
                        lower = stops[i];
                        upper = stops[i + 1];
                        break;
                    }
                }

                const range = upper.t - lower.t;
                const localT = range === 0 ? 0 : (t - lower.t) / range;

                const r = Math.floor(lower.color[0] + (upper.color[0] - lower.color[0]) * localT);
                const g = Math.floor(lower.color[1] + (upper.color[1] - lower.color[1]) * localT);
                const b = Math.floor(lower.color[2] + (upper.color[2] - lower.color[2]) * localT);

                return [r, g, b];
            };

            const minVal = config?.min !== undefined ? config.min : -10;
            const maxVal = config?.max !== undefined ? config.max : 40;
            const valRange = maxVal - minVal;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let numerator = 0;
                    let denominator = 0;
                    let minDist = Infinity;

                    for (const point of points) {
                        const dx = x - point.x;
                        const dy = y - point.y;
                        const distSq = dx * dx + dy * dy;

                        if (distSq < 1) {
                            numerator = point.val;
                            denominator = 1;
                            minDist = 0;
                            break;
                        }

                        const weight = 1 / distSq;
                        numerator += point.val * weight;
                        denominator += weight;
                    }

                    let val = 0;
                    if (minDist === 0) {
                        val = numerator;
                    } else {
                        val = numerator / denominator;
                    }

                    let t = (val - minVal) / valRange;
                    t = Math.max(0, Math.min(1, t));

                    const [r, g, b] = getGradientColor(t);

                    const index = (y * width + x) * 4;
                    pixels[index] = r;
                    pixels[index + 1] = g;
                    pixels[index + 2] = b;
                    pixels[index + 3] = 180;
                }
            }

            ctx.putImageData(imgData, 0, 0);
        };

        const drawPolygon = (ctx, coordinates, map, scaleFactor) => {
            coordinates.forEach(ring => {
                ctx.moveTo(0, 0);
                let first = true;
                ring.forEach(coord => {
                    const latLng = L.latLng(coord[1], coord[0]);
                    const point = map.latLngToContainerPoint(latLng);
                    const x = point.x * scaleFactor;
                    const y = point.y * scaleFactor;

                    if (first) {
                        ctx.moveTo(x, y);
                        first = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.closePath();
            });
        };

        draw();
        map.on('moveend', draw);
        map.on('zoomend', draw);

        return () => {
            map.off('moveend', draw);
            map.off('zoomend', draw);
            if (canvasRef.current && overlayPane.contains(canvasRef.current)) {
                overlayPane.removeChild(canvasRef.current);
            }
        };
    }, [map, data, config, boundaryGeoJSON, layerId]);

    return null;
};

export default TemperatureLayer;
