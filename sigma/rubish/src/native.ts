import INative from "./widget/INative"

export const intervalHolder: { [id: string]: { [id: string]: any } } = {}
export const timeoutHolder: { [id: string]: { [id: string]: any } } = {}

class Native extends INative {

    window: any
    Object: any
    console: any
    JSON: any
    String: any
    Math: any
    Date: any
    alert: any
    confirm: any
    prompt: any

    globalMemory: { [id: string]: any } = {}
    intervals: { [id: string]: any } = {}
    timeouts: { [id: string]: any } = {}
    controls: { [id: string]: any } = {}

    nativeElement = (compType: string, props: { [id: string]: any }, styles: { [id: string]: any }, children: Array<any>) => {
        let control = this.controls[compType]
        return control.instantiate(props, styles, children)
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
        window.clearInterval(interval)
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
        window.clearTimeout(timeout)
    }

    constructor(global: any, module: any, controls: { [id: string]: any }) {
        super(module);
        
        this.window = global;
        this.prompt = global.prompt;
        this.confirm = global.confirm;
        this.alert = global.alert;
        this.console = global.console;
        this.String = global.String;
        this.Date = global.Date;
        this.JSON = global.JSON;
        this.Math = global.Math;
        this.Object = global.Object;
        
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
