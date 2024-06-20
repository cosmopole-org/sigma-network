import MwcDriver from "applet-mwc"
import { useEffect, useRef } from "react"
import { Applet, Controls } from "applet-vm"

let hostLoaded: { [id: string]: boolean } = {}

const unloadAllHosts = () => {
    hostLoaded = {}
}

const Host = (props: { appletKey: string, code: string, index: number }) => {
    const hostContainerrId = `AppletHost:${props.appletKey}`
    const appletRef = useRef(new Applet(props.appletKey))
    const rootRef = useRef(null)
    useEffect(() => {
        //if (!hostLoaded[props.appletKey]) {
            hostLoaded[props.appletKey] = true
            appletRef.current.fill(props.code)
            let root = document.getElementById(hostContainerrId)
            if (root !== null) {
                let driver = new MwcDriver(appletRef.current, root)
                driver.start('Test', Controls)
            }
        //}
        setTimeout(() => {
            if (rootRef.current !== null) {
                let root = rootRef.current as HTMLElement
                root.style.transform = 'scale(1, 1)'
                root.style.opacity = '1'
            }
        }, (props.index + 1) * 75);
    }, [])
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
        />
    )
}

export default { Host, unloadAllHosts }
