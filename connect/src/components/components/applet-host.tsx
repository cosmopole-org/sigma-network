import MwcDriver from "applet-mwc"
import { useEffect, useRef } from "react"
import { Applet, Controls } from "applet-vm"
import Native, { intervalHolder, timeoutHolder } from "./native"
import { Topic } from "../../api/sigma/models";
import Safezone from "./safezone";

let hostLoaded: { [id: string]: boolean } = {}

const unloadAllHosts = () => {
    Object.keys(hostLoaded).forEach(key => {
        if (intervalHolder[key]) {
            Object.values(intervalHolder[key]).forEach(interval => {
                clearInterval(interval)
            })
            delete intervalHolder[key]
        }
        if (timeoutHolder[key]) {
            Object.values(timeoutHolder[key]).forEach(timeout => {
                clearTimeout(timeout)
            })
            delete timeoutHolder[key]
        }
        delete hostLoaded[key]
    })
    hostLoaded = {}
}

export let appletCache: { [id: string]: { element: HTMLElement, applet: Applet } } = {};
export let closeAppletHost = (id: string) => {
    id = "desktop-sheet-" + id;
    delete appletCache[id];
    if (intervalHolder[id]) {
        Object.values(intervalHolder[id]).forEach(interval => {
            clearInterval(interval)
        })
        delete intervalHolder[id]
    }
    if (timeoutHolder[id]) {
        Object.values(timeoutHolder[id]).forEach(timeout => {
            clearTimeout(timeout)
        })
        delete timeoutHolder[id]
    }
    delete hostLoaded[id]
};
export let minimizeAppletHost = () => { };

const Host = (props: { stateKey?: string, full?: boolean, isWidget?: boolean, appletKey: string, code: string, index: number, entry: string, onClick?: () => void, room?: Topic, onCancel?: () => void, overlay?: boolean }) => {
    const hostContainerrId = `AppletHost:${props.appletKey}`
    const appletRef = useRef(appletCache[props.appletKey] ? appletCache[props.appletKey].applet : new Applet(props.appletKey))
    const rootRef = useRef(null)
    const isSafezone = props.code?.startsWith('safezone/')
    const h = props.full ? window.innerHeight : (window.innerHeight * 85 / 100);
    useEffect(() => {
        if (props.code) {
            if (!isSafezone) {
                hostLoaded[props.appletKey] = true
                appletRef.current.fill(props.code)
                appletRef.current.setContextBuilder((mod) => new Native(mod, Controls))
                let root = document.getElementById(hostContainerrId)
                if (root !== null) {
                    root.innerHTML = '';
                    if (appletCache[props.appletKey]) {
                        root.appendChild(appletCache[props.appletKey].element);
                    } else {
                        let driver = new MwcDriver(appletRef.current, root)
                        driver.start(props.entry)    
                    }
                }
                if (!props.isWidget) {
                    minimizeAppletHost = () => {
                        if (root) {
                            appletCache[props.appletKey] = {
                                element: root.children[0] as HTMLElement,
                                applet: appletRef.current
                            }
                        }
                    }
                }
            } else {
                if (!props.isWidget) {
                    minimizeAppletHost = () => { };
                }
            }
            setTimeout(() => {
                if (rootRef.current !== null) {
                    let root = rootRef.current as HTMLElement
                    root.style.transform = 'scale(1, 1)'
                    root.style.opacity = '1'
                }
            }, (props.index + 1) * 75);
        }
    }, [props.code])
    useEffect(() => {
        return () => {
            if (!appletCache[props.appletKey]) {
                if (intervalHolder[props.appletKey]) {
                    Object.values(intervalHolder[props.appletKey]).forEach(interval => {
                        clearInterval(interval)
                    })
                    delete intervalHolder[props.appletKey]
                }
                if (timeoutHolder[props.appletKey]) {
                    Object.values(timeoutHolder[props.appletKey]).forEach(timeout => {
                        clearTimeout(timeout)
                    })
                    delete timeoutHolder[props.appletKey]
                }
                delete hostLoaded[props.appletKey]
            }
            if (!props.isWidget) {
                minimizeAppletHost = () => { };
            }
        }
    }, [])
    useEffect(() => {
        if (props.entry === 'Dummy') {
            if (intervalHolder[props.appletKey]) {
                Object.values(intervalHolder[props.appletKey]).forEach(interval => {
                    clearInterval(interval)
                })
                delete intervalHolder[props.appletKey]
            }
            if (timeoutHolder[props.appletKey]) {
                Object.values(timeoutHolder[props.appletKey]).forEach(timeout => {
                    clearTimeout(timeout)
                })
                delete timeoutHolder[props.appletKey]
            }
            delete hostLoaded[props.appletKey]
        }
    }, [props.entry])
    return (
        <div
            ref={rootRef}
            id={hostContainerrId}
            style={{
                width: '100%',
                height: (props.isWidget || props.overlay) ? '100%' : (h - 28),
                overflow: 'hidden',
                transform: 'scale(0.65, 0.65)',
                opacity: 0,
                transition: props.isWidget ? 'transform .35s' : undefined
            }}
            onClick={props.onClick}
        >
            {
                isSafezone ? (
                    <Safezone
                        stateKey={props.stateKey}
                        isWidget={props.isWidget}
                        overlay={props.overlay}
                        onCancel={() => props.onCancel && props.onCancel()}
                        code={props.code}
                        machineId={props.appletKey}
                        workerId={props.appletKey}
                        room={props.room}
                    />
                ) : null
            }
        </div>
    )
}

export default { Host, unloadAllHosts }
