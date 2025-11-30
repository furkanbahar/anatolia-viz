// src/components/Legend.jsx
import React from 'react';

function Legend({ currentLayer, config }) {
    if (!config || !config.gradient) return null;

    // Generate gradient string from config
    // config.gradient is object { 0.0: color, ... }
    // We need to sort keys and create linear-gradient string
    const stops = Object.entries(config.gradient)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .map(([stop, color]) => `${color} ${parseFloat(stop) * 100}%`);

    const gradientStyle = `linear-gradient(to top, ${stops.join(', ')})`;

    const min = config.min;
    const max = config.max;
    const unit = config.unit || '';

    // Create 5 labels
    const labels = [];
    for (let i = 0; i <= 4; i++) {
        const val = max - (i * (max - min) / 4);
        labels.push(Math.round(val));
    }

    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '200px',
                marginRight: '8px',
                textAlign: 'right'
            }}>
                {labels.map((val, idx) => (
                    <span key={idx}>{val}{unit}</span>
                ))}
            </div>

            <div style={{
                width: '15px',
                height: '200px',
                background: gradientStyle,
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
            }}></div>
        </div>
    );
}

export default Legend;
