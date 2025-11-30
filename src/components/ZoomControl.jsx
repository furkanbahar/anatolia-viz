// src/components/ZoomControl.jsx
import React from 'react';
import { useMap } from 'react-leaflet';
import './ZoomControl.css';

function ZoomControl() {
    const map = useMap();

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    return (
        <div className="zoom-control">
            <button
                className="zoom-button zoom-in"
                onClick={handleZoomIn}
                aria-label="Yakınlaştır"
            >
                <span>+</span>
            </button>
            <button
                className="zoom-button zoom-out"
                onClick={handleZoomOut}
                aria-label="Uzaklaştır"
            >
                <span>−</span>
            </button>
        </div>
    );
}

export default ZoomControl;
