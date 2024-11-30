
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { useEffect, useRef, useState } from "react";

let storage: ExcalidrawElement[] = []
let measureUpdate = (data: readonly ExcalidrawElement[]): ExcalidrawElement[] => {
    let oldDict: { [id: string]: ExcalidrawElement } = {}
    let newDict: { [id: string]: ExcalidrawElement } = {}
    storage.forEach(element => {
        oldDict[element.id] = element
    })
    data.forEach(element => {
        newDict[element.id] = element
    })
    let updates: ExcalidrawElement[] = []
    data.forEach((_new: ExcalidrawElement, index: number) => {
        let old = oldDict[_new.id]
        if (old) {
            if (old.version < _new.version) {
                let n = structuredClone(_new)
                updates.push(n)
                storage[storage.findIndex((el) => el.id === _new.id)] = n
            }
        } else {
            let n = structuredClone(_new)
            updates.push(n)
            storage.push(n)
        }
    })
    return updates
}

let update = (updatesList: any[]) => {
    let oldDict: { [id: string]: ExcalidrawElement } = {}
    let newDict: { [id: string]: ExcalidrawElement } = {}
    storage.forEach(element => {
        oldDict[element.id] = element
    })
    updatesList.forEach(element => {
        newDict[element.id] = element
    })
    updatesList.forEach((_new: ExcalidrawElement, index: number) => {
        let old = oldDict[_new.id]
        if (old) {
            if (old.version < _new.version) {
                storage[storage.findIndex((el) => el.id === _new.id)] = structuredClone(_new)
            }
        } else {
            storage.push(structuredClone(_new))
        }
    })
}

const App = () => {
    const [settings, setSettings]: [any, any] = useState({
        ready: false,
        theme: undefined,
        myId: undefined
    })
    const [excApi, setExcApi]: [ExcalidrawImperativeAPI | undefined, any] = useState(undefined)
    useEffect(() => {
        window.parent.postMessage({ key: 'onLoad' }, '*')
    }, [])
    useEffect(() => {
        window.onmessage = (e: any) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            if (data.key === 'setup') {
                setSettings({
                    ready: true,
                    theme: data.colorName === 'night' ? 'dark' : 'light',
                    myId: data.myHumanId
                })
            } else if (data.key === 'response') {
                const packet = data.packet
                if (packet.questionId === 'get/elements') {
                    let elements = packet.elements
                    if (excApi) {
                        let api = excApi as ExcalidrawImperativeAPI
                        api.updateScene({ elements })
                        setTimeout(() => {
                            window.parent.postMessage({ key: 'ready' }, '*')
                            window.parent.postMessage({ key: 'onAuthorize' }, '*')
                        });
                    }
                }
            } else if (data.key === 'push') {
                const packet = data.packet
                let updatesList = packet.updatesList
                if (excApi) {
                    if (updatesList.length > 0) {
                        update(updatesList)
                        let api = excApi as ExcalidrawImperativeAPI
                        api.updateScene({ elements: storage })
                    }
                }
            }
        }
        if (excApi) {
            window.parent.postMessage({ key: 'ask', packet: { tag: 'get/elements' } }, '*')
        }
    }, [excApi])
    return settings.theme ? (
        <div style={{ width: '100%', height: '100%' }}>
            <Excalidraw theme={settings.theme === 'dark' ? 'dark' : 'light'} excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcApi(api)} onChange={(elements: readonly ExcalidrawElement[]) => {
                let updatesList = measureUpdate(elements)
                if (updatesList.length > 0) window.parent.postMessage({ key: 'ask', packet: { tag: 'put/element', updatesList: updatesList } }, '*')
            }} />
        </div>
    ) : null
}

export default App
