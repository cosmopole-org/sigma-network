
import { Button } from '@heroui/button';
import { useState } from 'react';
import { HeroUIProvider } from "@heroui/system";

function App() {
  const [counter, setCounter] = useState(0);
  return (
    <HeroUIProvider>
      <Button color="success" className="ml-4 mt-4" onClick={() => {
        console.log(counter + 1);
        setCounter(counter + 1);
      }}>Count: {counter}</Button>
    </HeroUIProvider>
  );
}

export default App;
