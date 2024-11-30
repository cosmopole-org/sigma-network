
import Calendar from 'services/Calendar';
import Clock from './services/Clock';
import Spotify from 'services/Spotify';
import Excalidraw from 'services/Excalidraw';
import Weather from 'services/Weather';

console.log("starting machines...");

Clock.start()
Calendar.start()
Spotify.start()
Excalidraw.start()
Weather.start()
