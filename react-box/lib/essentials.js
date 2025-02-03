/* global globalThis */
import 'intl';
import queueMicrotask from 'queue-microtask';

globalThis.queueMicrotask = queueMicrotask;

let timeoutCallbacks = {};

globalThis.window = {
    document: { addEventListener: () => { }, },
    addEventListener: () => { },
    navigator: { userAgent: {} }
}

globalThis.document = globalThis.window.document;

let scanEvent = (e) => {
    if (e) {
        for (let prop in e) {
            if (typeof e[prop] === 'object' && typeof e[prop] !== 'function' && typeof e[prop] !== 'string' && prop !== "functions") {
                scanEvent(e[prop]);
            }
        }
        if (e.functions) {
            for (let meth in e.functions) {
                console.log(meth);
                e[meth] = new Function("(" + e.functions[meth] + ")");
            }
        }
    }
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
            let e = args[0];
            scanEvent(e);
            e.nativeEvent = e;
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