
import Calendar from 'services/Calendar';
import Clock from './services/Clock';
import Spotify from 'services/Spotify';
import Excalidraw from 'services/Excalidraw';
import Weather from 'services/Weather';
import Embed from 'services/Embed';
import GDrive from 'services/GDrive';
import Trello from 'services/Trello';
import CodePen from 'services/CodePen';

console.log("starting machines...");

Clock.start()
Calendar.start()
Spotify.start()
Excalidraw.start()
Weather.start()
Embed.start()
GDrive.start()
Trello.start()
CodePen.start()
