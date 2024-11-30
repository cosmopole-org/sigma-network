
import { useEffect, useRef, useState } from "react";
import {
    PrefillEmbed,
    PrefillLang,
    useCodePenEmbed,
    stripIndent
} from 'react-codepen-prefill-embed';

const App = () => {
    const [settings, setSettings]: [any, any] = useState({
        ready: false,
        theme: undefined,
        myId: undefined,
        url: false
    })
    const byUrlRef = useRef(null)
    const [height, setHeight] = useState(window.innerHeight - 4)
    useEffect(() => {
        window.onresize = () => {
            setHeight(window.innerHeight - 4)
        }
        window.onmessage = (e: any) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            if (data.key === 'setup') {
                setSettings({
                    ready: true,
                    theme: data.colorName === 'night' ? 'dark' : 'light',
                    myId: data.myHumanId,
                    url: 'test'
                })
                setTimeout(() => {
                    window.parent.postMessage({ key: 'ready' }, '*')
                    window.parent.postMessage({ key: 'onAuthorize' }, '*')
                });
            }
        }
        window.parent.postMessage({ key: 'onLoad' }, '*')
    }, [])
    useEffect(() => {
        if (settings.url && byUrlRef.current) {
            let el = byUrlRef.current as HTMLElement;
            el.innerHTML = `
                <p class="codepen" data-height="${height}" data-theme-id='${settings.theme}' data-default-tab="html,result" data-slug-hash="oNJWzR" data-editable="true" data-user="jstneg" style="height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
                    <span>See the Pen <a href="https://codepen.io/jstneg/pen/oNJWzR">
                        Pen Styles</a> by J.S. Negley (<a href="https://codepen.io/jstneg">@jstneg</a>)
                        on <a href="https://codepen.io">CodePen</a>.
                    </span>
                </p>
            `
            let head = document.getElementsByTagName('head')[0];
            let script = document.createElement('script');
            script.src = 'https://cpwebassets.codepen.io/assets/embed/ei.js';
            head.appendChild(script);
        }
    }, [settings.url, byUrlRef.current, height])
    useCodePenEmbed()
    return settings.theme ? (
        <div style={{ width: '100%', height: '100%' }}>
            {
                settings.url ? (
                    <div ref={byUrlRef} />
                ) : (
                    <PrefillEmbed
                        className="codepen"
                        penTitle="My sweet demo"
                        embedHeight={height.toString()}
                        themeId={settings.theme}
                        editable
                        description="Renders a barebones React component"
                        tags={['react', 'react-docs-demo']}
                        htmlClasses={['loading', 'no-js']}
                        head={
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                        }
                    >
                        <PrefillLang lang="html">
                            {stripIndent`<h1>Hello World !</h1>`}
                        </PrefillLang>
                        <PrefillLang lang="scss">
                            {stripIndent``}
                        </PrefillLang>
                        <PrefillLang title="jsx" lang="js">
                            {stripIndent``}
                        </PrefillLang>
                    </PrefillEmbed>
                )
            }
        </div>
    ) : null
}

export default App
