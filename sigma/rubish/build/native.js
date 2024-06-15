"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutHolder = exports.intervalHolder = void 0;
const INative_1 = require("./widget/INative");
exports.intervalHolder = {};
exports.timeoutHolder = {};
class Native extends INative_1.default {
    window;
    Object;
    console;
    JSON;
    String;
    Math;
    Date;
    alert;
    confirm;
    prompt;
    globalMemory = {};
    intervals = {};
    timeouts = {};
    controls = {};
    nativeElement = (compType, props, styles, children) => {
        let control = this.controls[compType];
        return control.instantiate(props, styles, children);
    };
    setInterval = (callback, period) => {
        if (exports.intervalHolder[this._module.applet._key]) {
            let interval = setInterval(callback, period);
            exports.intervalHolder[this._module.applet._key][interval + ''] = interval;
            this.intervals[interval + ''] = true;
            return interval;
        }
        return 0;
    };
    clearInterval = (interval) => {
        delete exports.intervalHolder[this._module.applet._key][interval + ''];
        delete this.intervals[interval + ''];
        window.clearInterval(interval);
    };
    setTimeout = (callback, delay) => {
        if (exports.timeoutHolder[this._module.applet._key]) {
            let timeout = setTimeout(callback, delay);
            exports.timeoutHolder[this._module.applet._key][timeout + ''] = timeout;
            this.timeouts[timeout + ''] = true;
            return timeout;
        }
        return 0;
    };
    clearTimeout = (timeout) => {
        delete exports.timeoutHolder[this._module.applet._key][timeout + ''];
        delete this.timeouts[timeout + ''];
        window.clearTimeout(timeout);
    };
    constructor(global, module, controls) {
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
        if (!exports.intervalHolder[module.applet._key]) {
            exports.intervalHolder[module.applet._key] = {};
        }
        if (!exports.timeoutHolder[module.applet._key]) {
            exports.timeoutHolder[module.applet._key] = {};
        }
        this.controls = controls;
    }
}
exports.default = Native;
