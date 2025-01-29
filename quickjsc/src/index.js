import React from 'react';
import ReactDOM from 'react-dom/client';
import { getQuickJS } from "quickjs-emscripten";

const vm = (await getQuickJS()).newContext();

let api = vm.newObject();
vm.setProp(api, "createElement", vm.newFunction("createElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log(args[0]);
}));
vm.setProp(api, "createTextElement", vm.newFunction("createTextElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log(args[0]);
}));
vm.setProp(api, "appendChild", vm.newFunction("appendChild", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log(args[0], rawArgs[1]);
}));
vm.setProp(api, "updateElement", vm.newFunction("updateElement", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log(args[0]);
}));
vm.setProp(api, "removeChild", vm.newFunction("removeChild", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    console.log(args[0]);
}));
vm.setProp(vm.global, "api", api);

vm.setProp(vm.global, "setTimeoutCallback", vm.newFunction("setTimeoutCallback", (...rawArgs) => {
    let args = rawArgs.map(vm.dump);
    setTimeout(() => {
        console.log(vm.dump(vm.evalCode("api.triggerCallback('" + args[0] + "');").value));
    }, args[1]);
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
            console.log(vm.dump(vm.evalCode(code).value));
        });
    }, []);
    return <div></div>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
