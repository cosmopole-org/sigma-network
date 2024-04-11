import { INative, Module } from "applet-vm"

class Native extends INative {

    globalMemory: { [id: string]: any } = {}
    intervals: { [id: string]: any } = {}
    timeouts: { [id: string]: any } = {}
    controls: { [id: string]: any } = {}
    module?: Module = undefined

    nativeElement = (compType: string, props: any, styles: any, children: Array<any>) => {
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
    alert = (str: any) => {
        window.alert(str)
    }
    console = {
        log: (...strs: Array<any>) => {
            console.log(...strs)
        }
    }
    setInterval = (callback: () => void, period: number) => {
        this.intervals[setInterval(callback, period) + ''] = true
    }
    setTimeout = (callback: () => void, timeout: number) => {
        this.timeouts[setTimeout(callback, timeout) + ''] = true
    }

    constructor(module: Module, controls: { [id: string]: any}) {
        super(module)
        this.module = module
        this.controls = controls
    }
}

export default Native
