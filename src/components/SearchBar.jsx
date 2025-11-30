// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import { TURKEY_LOCATIONS } from '../data/turkey_locations';
import './SearchBar.css';

function SearchBar({ onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const map = useMap();

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (val.length > 1) {
            const filtered = TURKEY_LOCATIONS.filter(loc =>
                loc.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5); // İlk 5 sonuç
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (loc) => {
        setQuery(loc.name);
        setResults([]);

        // Haritada oraya git
        map.flyTo([loc.lat, loc.lon], 9, {
            duration: 1.5
        });

        // Üst bileşene bildir (Detay panelini açmak için)
        if (onSelect) {
            onSelect(loc);
        }
    };

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="İl veya İlçe Ara..."
                    value={query}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {results.length > 0 && (
                <ul className="search-results">
                    {results.map((loc, idx) => (
                        <li key={idx} onClick={() => handleSelect(loc)}>
                            <span className="result-name">{loc.name}</span>
                            <span className="result-type">{loc.type === 'il' ? 'İl' : 'İlçe'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
