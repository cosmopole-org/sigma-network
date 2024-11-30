import MwcDriver from "applet-mwc"
import { useEffect, useRef } from "react"
import { Applet, Controls } from "applet-vm"
import Native, { intervalHolder, timeoutHolder } from "./native"
// import Safezone from "./safezone"
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

const Host = (props: { isWidget?: boolean, appletKey: string, code: string, index: number, entry: string, onClick?: () => void, room?: Topic, onCancel?: () => void, overlay?: boolean }) => {
    const hostContainerrId = `AppletHost:${props.appletKey}`
    const appletRef = useRef(new Applet(props.appletKey))
    const rootRef = useRef(null)
    const isSafezone = props.code?.startsWith('safezone/')
    useEffect(() => {
        if (props.code) {
            if (!isSafezone) {
                hostLoaded[props.appletKey] = true
                appletRef.current.fill(props.code)
                appletRef.current.setContextBuilder((mod) => new Native(mod, Controls))
                let root = document.getElementById(hostContainerrId)
                if (root !== null) {
                    root.innerHTML = ''
                    let driver = new MwcDriver(appletRef.current, root)
                    driver.start(props.entry)
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
                height: '100%',
                overflow: 'hidden',
                transform: 'scale(0.65, 0.65)',
                opacity: 0,
                transition: 'transform .35s'
            }}
            onClick={props.onClick}
        >
            {
                isSafezone ? (
                    <Safezone
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
