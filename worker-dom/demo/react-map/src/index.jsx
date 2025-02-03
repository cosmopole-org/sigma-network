import React from 'react';
import { Button, HeroUIProvider } from "@heroui/react";
import { createRoot } from 'react-dom/client';
import './index.css';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      focusedRegion: null,
    };
  }

  render() {
    return (
      <HeroUIProvider>
        <Button color="primary">Hello Keyhan</Button>
      </HeroUIProvider>
    )
  }
}

const div = document.createElement('div');
document.body.appendChild(div);
const root = createRoot(div);
root.render(<App />);

