
import { useEffect, useState } from "react";

const App = () => {
    const [settings, setSettings]: [any, any] = useState({
        ready: false,
        theme: undefined,
        myId: undefined,
        themeColor: undefined,
        locationId: undefined
    })
    useEffect(() => {
        window.onmessage = (e: any) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            if (data.key === 'setup') {
                setSettings({
                    ready: true,
                    theme: data.colorName === 'night' ? 'dark' : 'light',
                    myId: data.myHumanId,
                    themeColor: data.themeColor,
                    locationId: "134749"
                })
                setTimeout(() => {
                    window.parent.postMessage({ key: 'ready' }, '*')
                    window.parent.postMessage({ key: 'onAuthorize' }, '*')
                });
            }
        }
        window.parent.postMessage({ key: 'onLoad' }, '*');
    }, [])
    return settings.theme ? (
        <div style={{ borderRadius: 16, padding: 8, position: 'relative' }}>
            <div style={{
                width: '100%', height: '100%', borderRadius: 16, display: 'flex', flexWrap: 'wrap',
                backgroundColor: settings.themeColor['absolutePlain'], position: 'absolute', left: 0, top: 0, opacity: 0.25,
            }} />
            <div className="tomorrow" data-location-id={settings.locationId} data-language="EN" data-unit-system="METRIC" data-skin={settings.theme}
                data-widget-type="upcoming" style={{ paddingBottom: 22, position: 'relative' }}>
            </div>
        </div>
    ) : null
}

export default App
