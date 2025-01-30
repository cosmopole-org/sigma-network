/* global globalThis */

let timeoutCallbacks = {};

globalThis.window = {
    addEventListener: () => { },
    navigator: { userAgent: {} }
}

api.triggerCallback = (k, ...args) => {
    console.log("executing traigger...");
    let cb = timeoutCallbacks[k];
    if (cb) {
        delete timeoutCallbacks[k];
        try {
            cb();
        } catch (ex) {
            console.log(cb?.toString(), ex, ex.stack);
        }
    } else {
        cb = globalThis.callbacks[k];
        if (cb) {
            let e = {};
            for (let prop in args[0]) {
                e[prop] = args[0][prop];
            }
            for (let meth in args[1]) {
                e[meth] = () => { return 1; };
            }
            console.log(args[1]);
            console.log(e);
            try {
                cb(e);
            } catch (ex) {
                console.log(cb?.toString(), ex, ex.stack);
            }
        }
    }
};

let setTimeout$1 = (cb, t) => {
    let k = Math.random().toString().substring(2) + "_" + Math.random().toString().substring(2);
    timeoutCallbacks[k] = cb;
    setTimeoutCallback(k, t);
};

let cancelTimeout$1 = (k) => {
    cancelTimeoutCallback(k);
};

globalThis.process = { env: { NODE_ENV: 'development' } }
if (!globalThis.setTimeout) globalThis.setTimeout = setTimeout$1
if (!globalThis.cancelTimeout) globalThis.cancelTimeout = cancelTimeout$1
globalThis.console.warn = console.log
globalThis.console.error = console.log
globalThis.console.info = console.log
globalThis.console.debug = console.log
globalThis.console.group = console.log
globalThis.console.trace = console.log