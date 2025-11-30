import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const RainLayer = ({ data }) => {
    const map = useMap();
    const canvasRef = useRef(null);
    const drops = useRef([]);
    const animationFrameId = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const canvas = L.DomUtil.create('canvas', 'leaflet-rain-layer');
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = 500; // Above heatmap

        const pane = map.getPanes().overlayPane;
        pane.appendChild(canvas);
        canvasRef.current = canvas;

        initDrops();
        animate();

        const resetCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            const topLeft = map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
            initDrops();
        };

        map.on('moveend', resetCanvas);
        map.on('zoomend', resetCanvas);
        resetCanvas();

        return () => {
            cancelAnimationFrame(animationFrameId.current);
            map.off('moveend', resetCanvas);
            map.off('zoomend', resetCanvas);
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [data, map]);

    const initDrops = () => {
        const count = 500;
        drops.current = [];
        const size = map.getSize();
        for (let i = 0; i < count; i++) {
            drops.current.push({
                x: Math.random() * size.x,
                y: Math.random() * size.y,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 10 + 10
            });
        }
    };



    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        drops.current.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * canvas.width;
            }

            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
        });

        ctx.stroke();
        animationFrameId.current = requestAnimationFrame(animate);
    };

    return null;
};

export default RainLayer;
