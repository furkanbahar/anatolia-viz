// src/components/Logo.jsx
import React from 'react';

function Logo() {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '10px 20px',
            borderRadius: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.5px'
            }}>
                Anatolia<span style={{ color: '#ff9f43' }}>Viz</span>
            </div>
            <div style={{
                width: '8px',
                height: '8px',
                background: '#ff9f43',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
            }}></div>
            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

export default Logo;
