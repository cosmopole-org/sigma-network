import "./essentials.js";
import React from 'react';
import { Renderer } from './renderer.js'

function Button(props) {
  return <button>{props.children}</button>
}

function App() {
  return (
    <Button>Hello World !</Button>
  );
}

Renderer.render(<App />)
