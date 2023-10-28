import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Desktop from './Desktop';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh', background: `url(https://svgur.com/i/jyv.svg)` }}>
      <Desktop style={{ width: window.innerWidth }} />
    </div>
  );
}

export default App;
