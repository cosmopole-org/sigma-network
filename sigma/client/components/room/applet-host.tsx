"use client"

import MwcDriver from "applet-mwc"
import { useEffect, useRef } from "react"
import { Applet, Controls } from "applet-vm"
import Native, { intervalHolder, timeoutHolder } from "./native"

const tools = `
class Image {
    constructor() {

    }
    onMount() {

    }
    onUnmount() {

    }
    render() {
        return nativeElement('image', this.props, this.styles, this.children)
    }
}
class Box {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('box', this.props, this.styles, this.children)
}
}
class Text {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('text', this.props, this.styles, [])
}
}
class Button {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('button', this.props, this.styles, [])
}
}
class Tabs {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('tabs', this.props, this.styles, this.children)
}
}
class PrimaryTab {
constructor() {

}
onMount() {

}
onUnmount() {

}
render() {
    return nativeElement('primary-tab', this.props, this.styles, this.children)
}
}
`

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

const Host = (props: { appletKey: string, code: string, index: number, entry: string, onClick?: () => void, room?: any, onCancel?: () => void, overlay?: boolean, style?: any }) => {
    const hostContainerrId = `AppletHost:${props.appletKey}`
    const appletRef = useRef<Applet | null>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const loadApp = () => {
        if (props.code) {
            if (rootRef.current !== null) {
                rootRef.current.innerHTML = ''
                hostLoaded[props.appletKey] = true
                appletRef.current = new Applet(props.appletKey)
                appletRef.current.fill(`${tools} ${props.code}`);
                appletRef.current.setContextBuilder((mod) => new Native(mod, Controls))
                let driver = new MwcDriver(appletRef.current, rootRef.current)
                driver.start(props.entry)
            }
            setTimeout(() => {
                if (rootRef.current !== null) {
                    rootRef.current.style.transform = 'scale(1, 1)'
                    rootRef.current.style.opacity = '1'
                }
            }, (props.index + 1) * 75);
        }
    }
    const unloadApp = () => {
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
        if (rootRef.current) {
            rootRef.current.innerHTML = ''
        }
    }
    useEffect(() => {
        return () => unloadApp();
    }, []);
    useEffect(() => {
        unloadApp();
        loadApp();
    }, [props.code]);
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
                transition: 'transform .35s',
                ...props.style
            }}
            onClick={props.onClick}
        />
    )
}

export default { Host, unloadAllHosts }
