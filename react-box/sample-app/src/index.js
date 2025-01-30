import "./essentials.js";
import React from 'react';
import { Renderer } from './renderer.js'
import Button from '@mui/material/Button';

let App = () => {

  let [title, setTitle] = React.useState("hello");

  React.useEffect(() => {
    setTimeout(() => setTitle("test"), 2000);
  }, []);

  return (
    <div>
      <Button onClick={() => alert("testooooooooooooooooooooooooooooooooooooooo")}>keyhan {title}</Button>
    </div>
  )
}

Renderer.render(<App />)
