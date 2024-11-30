
import { useEffect, useRef, useState } from "react";
import { Spotify } from "react-spotify-embed";

const App = () => {
    const [settings, setSettings]: [any, any] = useState({
        ready: false,
        theme: undefined,
        myId: undefined,
        url: false
    })
    const [height, setHeight] = useState(window.innerHeight)
    useEffect(() => {
        window.onresize = () => {
            setHeight(window.innerHeight)
        }
        window.onmessage = (e: any) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            if (data.key === 'setup') {
                setSettings({
                    ready: true,
                    theme: data.colorName === 'night' ? 'dark' : 'light',
                    myId: data.myHumanId,
                    url: "https://open.spotify.com/album/0ynrXCnhZnaP0B7Kt2BW7B?si=une-YbK_SMmVn_f4c-X2Rw"
                })
                setTimeout(() => {
                    window.parent.postMessage({ key: 'ready' }, '*')
                    window.parent.postMessage({ key: 'onAuthorize' }, '*')
                });
            }
        }
        window.parent.postMessage({ key: 'onLoad' }, '*')
    }, [])
    return settings.theme ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center', verticalAlign: 'middle' }}>
            <Spotify wide link={settings.url} height={height}/>
        </div>
    ) : null
}

export default App
