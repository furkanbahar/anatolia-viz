// src/components/HoverCard.jsx
import React from 'react';
import './HoverCard.css';

function HoverCard({ data, position, unit, layerName }) {
    if (!data || !position) return null;

    // Ekranın sağına taşmaması için basit bir kontrol (geliştirilebilir)
    const style = {
        top: position.y + 15, // Farenin biraz altı
        left: position.x + 15, // Farenin biraz sağı
    };

    return (
        <div className="hover-card" style={style}>
            <div className="card-header">
                <span className="city-name">{data.name}</span>
                <span className="city-type">{data.type === 'il' ? 'İl' : 'İlçe'}</span>
            </div>
            <div className="card-body">
                <div className="main-value">
                    {data.value} <span className="unit">{unit}</span>
                </div>
                <div className="layer-label">{layerName}</div>
            </div>
        </div>
    );
}

export default HoverCard;
