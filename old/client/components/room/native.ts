"use client"

import { INative } from "applet-vm"

export const intervalHolder: { [id: string]: { [id: string]: any } } = {}
export const timeoutHolder: { [id: string]: { [id: string]: any } } = {}

class Native extends INative {

    globalMemory: { [id: string]: any } = {}
    intervals: { [id: string]: any } = {}
    timeouts: { [id: string]: any } = {}
    controls: { [id: string]: any } = {}

    nativeElement = (compType: string, props: { [id: string]: any }, styles: { [id: string]: any }, children: Array<any>) => {
        let control = this.controls[compType]
        let c = control.instantiate(props, styles, children)
        return c
    }
    Object = {
        keys: (obj: any) => {
            return Object.keys(obj)
        },
        values: (obj: any) => {
            return Object.values(obj)
        }
    }
    container = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    alert = (str: any) => {
        window.alert(str)
    }
    console = {
        log: (...strs: Array<any>) => {
            console.log(...strs)
        }
    }
    setInterval = (callback: () => void, period: number) => {
        if (intervalHolder[this._module.applet._key]) {
            let interval = setInterval(callback, period)
            intervalHolder[this._module.applet._key][interval + ''] = interval
            this.intervals[interval + ''] = true
            return interval
        }
        return 0;
    }
    clearInterval = (interval: any) => {
        delete intervalHolder[this._module.applet._key][interval + '']
        delete this.intervals[interval + '']
    }
    setTimeout = (callback: () => void, delay: number) => {
        if (timeoutHolder[this._module.applet._key]) {
            let timeout = setTimeout(callback, delay);
            timeoutHolder[this._module.applet._key][timeout + ''] = timeout
            this.timeouts[timeout + ''] = true
            return timeout
        }
        return 0;
    }
    clearTimeout = (timeout: any) => {
        delete timeoutHolder[this._module.applet._key][timeout + '']
        delete this.timeouts[timeout + '']
    }
    Date = window.Date

    constructor(module: any, controls: { [id: string]: any }) {
        super(module)
        if (!intervalHolder[module.applet._key]) {
            intervalHolder[module.applet._key] = {}
        }
        if (!timeoutHolder[module.applet._key]) {
            timeoutHolder[module.applet._key] = {}
        }

        this.controls = controls
    }
}

export default Native
