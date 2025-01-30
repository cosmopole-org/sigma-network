import React from 'react';
import ReactDOM from 'react-dom/client';
import { getQuickJS } from "quickjs-emscripten";

let elsDict = {};

const vm = (await getQuickJS()).newContext();

let api = vm.newObject();
vm.setProp(api, "createElement", vm.newFunction("createElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    let el = document.createElement(args[0].TYPE);
    for (let k in args[0]) {
        if (k === "TYPE") {
            continue
        }
        if (k === "style") {
            el.setAttribute('style', Object.entries(args[0][k]).map(([k, v]) => {
                k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                return `${k}:${v}`;
            }).join(';'));
        } else if (k === "className") {
            el.setAttribute("class", args[0][k]);
        } else if (k === "dangerouslySetInnerHTML") {
            el.innerHTML = args[0][k].__html;
        } else if (k.startsWith("on")) {
            el[k.toLowerCase()] = (e) => {
                let props = {};
                let meths = {};
                for (let p in e) {
                    if (typeof e[p] === 'number' || typeof e[p] === 'string' || typeof e[p] === 'boolean') {
                        props[p] = e[p];
                    } else if (typeof e[p] === 'function') {
                        meths[p] = true;
                    }
                }
                let res = vm.evalCode("api.triggerCallback('" + args[0][k] + "', " + JSON.stringify(props) + ", " + JSON.stringify(meths) + ");");
                if (res.error) {
                    console.log(vm.dump(res.error));
                }
            };
        } else {
            el.setAttribute(k, args[0][k]);
        }
    }
    el.removeAttribute("disabled");
    if (args[0]["textContent"] !== undefined) {
        el.appendChild(document.createTextNode(args[0]["textContent"]));
    }
    elsDict[args[0].REACT_BOX_KEY] = el;
    console.log("createElement", args[0]);
}));
vm.setProp(api, "createTextElement", vm.newFunction("createTextElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    elsDict[args[0].REACT_BOX_KEY] = document.createTextNode(args[0].text);
    console.log("createTextElement", args[0]);
}));
vm.setProp(api, "appendInitialChild", vm.newFunction("appendInitialChild", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    if (args[1].TYPE === 'style') {
        document.head.appendChild(elsDict[args[1].REACT_BOX_KEY]);
    } else {
        elsDict[args[0].REACT_BOX_KEY].appendChild(elsDict[args[1].REACT_BOX_KEY]);
    }
    console.log("appendInitialChild", args[0], args[1]);
}));
vm.setProp(api, "appendChild", vm.newFunction("appendChild", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    if (typeof args[0] === 'string' && args[0] === '[object Object]') {
        document.getElementById('applet-root').appendChild(elsDict[args[1].REACT_BOX_KEY]);
    } else {
        if (args[1].TYPE === 'style') {
            document.head.appendChild(elsDict[args[1].REACT_BOX_KEY]);
        } else {
            elsDict[args[0].REACT_BOX_KEY].appendChild(elsDict[args[1].REACT_BOX_KEY]);
        }
    }
    console.log("appendChild", args[0], args[1]);
}));
vm.setProp(api, "updateElement", vm.newFunction("updateElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    let el = elsDict[args[0].REACT_BOX_KEY];
    for (let k in args[0]) {
        if (k === "TYPE") {
            continue
        }
        if (k === "style") {
            el.setAttribute('style', Object.entries(args[0][k]).map(([k, v]) => {
                k = k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                return `${k}:${v}`;
            }).join(';'));
        } else if (k === "className") {
            el.setAttribute("class", args[0][k]);
        } else if (k === "dangerouslySetInnerHTML") {
            el.innerHTML = args[0][k].__html;
        } else if (k.startsWith("on")) {
            el[k.toLowerCase()] = (e) => {
                let props = {};
                let meths = {};
                for (let p in e) {
                    if (typeof e[p] === 'number' || typeof e[p] === 'string' || typeof e[p] === 'boolean') {
                        props[p] = e[p];
                    } else if (typeof e[p] === 'function') {
                        meths[p] = true;
                    }
                }
                let res = vm.evalCode("api.triggerCallback('" + args[0][k] + "', " + JSON.stringify(props) + ", " + JSON.stringify(meths) + ");");
                if (res.error) {
                    console.log(vm.dump(res.error));
                }
            };
        } else {
            el.setAttribute(k, args[0][k]);
        }
    }
    if (args[0]["textContent"] !== undefined) {
        el.innerHTML = '';
        el.appendChild(document.createTextNode(args[0]["textContent"]));
    }
    el.removeAttribute("disabled");
    console.log("updateElement", el, args[0]);
}));
vm.setProp(api, "updateTextElement", vm.newFunction("updateTextElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    let el = elsDict[args[0].REACT_BOX_KEY];
    el.textContent = args[0].text;
    console.log("updateTextElement", el, args[0]);
}));
vm.setProp(api, "removeChild", vm.newFunction("removeChild", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    elsDict[args[0].REACT_BOX_KEY].removeChild(elsDict[args[1].REACT_BOX_KEY])
    console.log("removeChild", args[0]);
}));
vm.setProp(api, "finalizeInitialChildren", vm.newFunction("finalizeInitialChildren", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log("finalizeInitialChildren", args[0]);
}));
vm.setProp(vm.global, "api", api);

vm.setProp(vm.global, "setTimeoutCallback", vm.newFunction("setTimeoutCallback", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    return vm.newNumber(setTimeout(() => {
        let res = vm.evalCode("api.triggerCallback('" + args[0] + "');");
        if (res.error) {
            console.log(vm.dump(res.error));
        }
    }, args[1]));
}));
vm.setProp(vm.global, "cancelTimeoutCallback", vm.newFunction("cancelTimeoutCallback", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    clearTimeout(args[0]);
}));
vm.setProp(vm.global, "alert", vm.newFunction("alert", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    alert(args[0]);
}));

const logHandle = vm.newFunction("log", (...args) => {
    const nativeArgs = args.map(vm.dump)
    console.log("QuickJS:", ...nativeArgs)
})
const consoleHandle = vm.newObject()
vm.setProp(consoleHandle, "log", logHandle)
vm.setProp(vm.global, "console", consoleHandle)

const App = () => {
    React.useEffect(() => {
        fetch('/app.js').then(res => res.text()).then(code => {
            let res = vm.evalCode(code);
            if (res.error) {
                console.log(vm.dump(res.error));
            }
        });
    }, []);
    return <div id={'applet-root'}></div>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
