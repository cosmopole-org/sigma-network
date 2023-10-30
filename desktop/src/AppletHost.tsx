import MwcDriver from "applet-mwc"
import { useEffect, useRef } from "react"
import { Applet, Controls } from "applet-vm"

let hostLoaded: { [id: string]: boolean } = {}

const unloadAllHosts = () => {
    hostLoaded = {}
}

const Host = (props: { appletKey: string, code: string }) => {
    const hostContainerrId = `AppletHost:${props.appletKey}`
    const appletRef = useRef(new Applet(props.appletKey))
    useEffect(() => {
        if (!hostLoaded[props.appletKey]) {
            hostLoaded[props.appletKey] = true
            appletRef.current.fill(props.code)
            let root = document.getElementById(hostContainerrId)
            if (root !== null) {
                let driver = new MwcDriver(appletRef.current, root)
                driver.start('Test', Controls)
            }
        }
    }, [])
    return (
        <div id={hostContainerrId} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />
    )
}

export default { Host, unloadAllHosts }
