// src/App.jsx
import React from 'react';
import './App.css'; // Temel tam ekran stilimiz
import MapComponent from './MapComponent'; // Yeni harita bileşenimizi import ediyoruz

function App() {
  // Projemiz Ventusky gibi harita merkezli olacağı için, diğer tüm UI bileşenleri haritanın üstünde (Mutlak konumlandırma ile) yer alacak
  return (
    <div className="App">
      <MapComponent />
      
      {/* İleride: Sol menü ve zaman çizelgesi gibi öğeler buraya gelecek */}
    </div>
  );
}

export default App;