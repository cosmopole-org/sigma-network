import { useEffect } from 'react';
import { getQuickJS } from "quickjs-emscripten";
import code from './main.txt';

let loaded = false;

let trueHandle;
let falseHandle;

function App() {
  useEffect(() => {
    if (!loaded) {
      loaded = true;
      const main = async () => {
        let QuickJS = await getQuickJS();
        const vm = QuickJS.newContext();

        trueHandle = vm.unwrapResult(vm.evalCode('true'));
        falseHandle = vm.unwrapResult(vm.evalCode('false'));

        const logHandle = vm.newFunction("log", (...args) => {
          const nativeArgs = args.map(vm.dump)
          console.log(...nativeArgs)
        })
        const consoleHandle = vm.newObject()
        vm.setProp(consoleHandle, "log", logHandle)
        vm.setProp(vm.global, "console", consoleHandle)
        consoleHandle.dispose()
        logHandle.dispose()

        let elIndexer = {};

        const render = (data) => {
          if (data === null) return null;
          if (typeof data === 'string' || typeof data === 'number' || typeof data === 'bigint' || typeof data === 'boolean') {
            return document.createTextNode(data);
          }
          let el = document.createElement(data.tag);
          elIndexer[data.props["box-key"]] = el;
          for (let key in data.props) {
            if (key === 'children') continue;
            el.setAttribute(key, data.props[key]);
          }
          if (data.props.children) {
            for (let i = 0; i < data.props.children.length; i++) {
              let res = render(data.props.children[i]);
              if (res === null) continue;
              el.appendChild(res);
            }
          }
          return el;
        }

        const jsxHandle = vm.newFunction("jsx", (...args) => {
          const nativeArgs = args.map(vm.dump)
          let data = JSON.parse(nativeArgs[0]);
          let root = document.getElementById('root');
          let el = render(data);
          root.appendChild(el);
        })
        vm.setProp(vm.global, "jsx", jsxHandle)
        jsxHandle.dispose()

        const timeoutHandle = vm.newFunction("apiSetTimeout", (...args) => {
          const nativeArgs = args.map(vm.dump)
          setTimeout(() => vm.evalCode(`runCallback(${nativeArgs[0]})`), nativeArgs[1]);
        })
        vm.setProp(vm.global, "apiSetTimeout", timeoutHandle)
        timeoutHandle.dispose()

        const intervalHandle = vm.newFunction("apiSetInterval", (...args) => {
          const nativeArgs = args.map(vm.dump)
          setInterval(() => vm.evalCode(`runCallback(${nativeArgs[0]})`), nativeArgs[1]);
        })
        vm.setProp(vm.global, "apiSetInterval", intervalHandle)
        intervalHandle.dispose()

        const repHandle = vm.newFunction("rep", (...args) => {
          const nativeArgs = args.map(vm.dump)
          let data = JSON.parse(nativeArgs[0]);
          let oldEl = elIndexer[data.props["box-key"]];
          let el = render(data);
          oldEl.replaceWith(el);
        })
        vm.setProp(vm.global, "rep", repHandle)
        repHandle.dispose()

        let docObj = deepObj(window, window, vm, 0)
        vm.setProp(vm.global, "window", docObj)
        let winObj = deepProps(window, vm)
        for (let key in winObj) {
          if (key !== "window") {
            vm.setProp(vm.global, key, winObj[key])
          }
        }

        vm.evalCode(`
          let root = undefined;
          let currComp = undefined;
          let callbacks = {};
          let currPath = '';
          const runCallback = (key) => {
            try {
              callbacks[key]();
            } catch(ex) { console.log(ex); }
          }
          const setTimeout = (fn, t) => {
            let key = Math.random().toString();
            callbacks[key] = fn;
            apiSetTimeout(key, t);
          }
          const setInterval = (fn, t) => {
            let key = Math.random().toString();
            callbacks[key] = fn;
            apiSetInterval(key, t);
          }
          const findAndReplaceComp = (key, parent, index, node, child) => {
            if (node === null) {
              parent.props.children[index] = null;
              return false;
            }
            if (!node.props) return false;
            if (node.props['box-key'] === key) {
              if (parent) {
                parent.props.children[index] = child;
              } else {
                root = child;
              }
              return true;
            }
            if (node.props?.children) {
              for (let i = 0; i < node.props.children.length; i++) {
                let res = findAndReplaceComp(key, node, i, node.props.children[i], child);
                if (res) return true;
              }
            }
            return false;
          }
          const replace = (data) => {
            if (data === null) return;
            findAndReplaceComp(data.props['box-key'], null, 0, root, data);
            rep(JSON.stringify(data));
          }
          const setCurrComp = (c) => {
            currComp = c;
            if (currComp) {
              let data = metaCache[currentKey];
              if (!data.hookMeta) {
                data.hookMeta = [];
              }
              data.hookCounter = 0;
            }
          }
          const createOptions = () => ({
            get(target, key) {
              if (typeof target[key] === "object")
                return new Proxy(target[key], createOptions());
              return target[key];
            },
          });
          const useState = (value) => {
            try {
              let copiedStack = [...tagStack];
              let savedKey = currentKey;
              let data = metaCache[currentKey];
              let cc = currComp;
              if (!data.hookMeta[data.hookCounter]) {
                data.hookMeta.push({type: 'useState', value });
              }
              let hookIndex = data.hookCounter;
              let prx = new Proxy({ value: data.hookMeta[data.hookCounter].value }, createOptions());
              data.hookCounter++;
              return [
                prx,
                (newVal) => { data.hookMeta[hookIndex].value = newVal; prx.value = newVal; fnQueue = []; counter = 0; let bs = [...tagStack]; tagStack = [...copiedStack]; let res = runComp(cc, savedKey); replace(React.infer(res)); tagStack = bs; runFnQueue(); }
              ]
            } catch (ex) { console.log(ex); }
          };
          const useEffect = (fn, deps) => {
            try {
              let data = metaCache[currentKey];
              let cc = currComp;
              if (!data.hookMeta[data.hookCounter]) {
                data.hookMeta.push({type: 'useEffect', fn });
              }
              data.hookCounter++;
            } catch (ex) { console.log(ex); }
          };

          const runComp = (c, key) => {
            
            let path = tagStack.join("/");
            
            let oldCurrComp = currComp;

            let ck = currentKey;

            if (!key) {
              let k = keyCache[path];
              if (k) {
                currentKey = k;
              } else {
                currentKey = Math.random().toString();
              }
            } else {
              currentKey = key;
            }

            if (!keyCache[path]) {
              keyCache[path] = currentKey;
            }
            if (!metaCache[currentKey]) {
              metaCache[currentKey] = {};
            }

            setCurrComp(c);

            let res = currComp();

            res.props['box-key'] = currentKey;

            let data = metaCache[currentKey];

            let next = () => {
              data.hookMeta.forEach((h, i) => {
                if (h.type === 'useEffect') {
                  if (!h.loaded) {
                    h.loaded = true;
                    h.fn();
                  }
                }
              });
            }

            currentKey = ck;

            setCurrComp(oldCurrComp);

            fnQueue.push(next);
            
            return res;
          }
          const runFnQueue = () => {
            fnQueue.forEach(fn => fn());
          }
          let fnQueue = [];
          let metaCache = {};
          let keyCache = {};
          let currentKey = undefined;

          let tagStack = [];

let counter = 0;

const React = {
    createElement: (tag, props, ...children) => {
        if (typeof tag === 'function') {
            return { tag: '_', fn: () => runComp(tag, props?.key), fnName: tag.name };
        } else {
            if (props) {
            console.log(children);
                children = children.flat()
                if (children && children.length > 0) props.children = children;
                else props.children = [];
                return { tag, props };
            } else {
                return { tag, props: { children: [] } };
            }
        }
    },
    infer: (res) => {
        if (res === null) return null;
        let result = undefined;
        let pushed = false;
        if (res.tag === '_') {
            tagStack.push(res.fnName + ":" + counter);
            pushed = true;
            let cb = counter;
            counter = 0;
            result = React.infer(res.fn());
            counter = cb;
        } else {
            if (res.tag) {
              tagStack.push(res.tag + ":" + counter);
              pushed = true;
            }
            result = res;
        }
        if (result?.props?.children) {
            let children = [];
            let cb = counter;
            counter = 0;
            result.props.children.forEach(c => {
                children.push(React.infer(c));
                counter++;
            });
            counter = cb;
            result.props.children = children;
        }
        if (pushed) tagStack.pop();
        return result;
    },
    init: (res) => {
        root = React.infer(res);
        jsx(JSON.stringify(root));
        runFnQueue();
        console.log("initialized");
    },
};

        `);
        vm.evalCode(`
     /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const Child = () => {
  let [obj, setObj] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setObj(obj.value + 1);
    }, 1000);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: red;'
  }, obj.value);
};
const Main = () => {
  let [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, 3000);
    }, 3000);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: blue;'
  }, show.value ? /*#__PURE__*/React.createElement(Child, null) : null, /*#__PURE__*/React.createElement(Child, null));
};
React.init( /*#__PURE__*/React.createElement(Main, null));
/******/ })()
;
        `);
      }
      main()
    }
  }, []);
  return (
    <div className="App">
      
    </div>
  );
}

let seen = []

function deepObj(parent, nativeObj, vm, depth) {
  if (nativeObj === null) return null;
  if (depth >= 10) return vm.newObject()
  if (typeof nativeObj !== "function" && typeof nativeObj !== "string" && typeof nativeObj === "object") {
    for (let i = 0; i < seen.length; i++) {
      if (Object.is(seen[i].nativeObj, nativeObj)) {
        return seen[i].obj;
      }
    }
  }
  let result = null;
  if (typeof nativeObj === "bigint") result = vm.newBigInt(nativeObj)
  else if (typeof nativeObj === "boolean") result = nativeObj ? trueHandle : falseHandle
  else if (typeof nativeObj === "function") {
    result = vm.newFunction(nativeObj.name, (...args) => {
      const nativeArgs = args.map(vm.dump)
      let res;
      res = parent[nativeObj.name](...nativeArgs)
      return deepObj(nativeObj, res, vm, 0)
    })
  }
  else if (typeof nativeObj === "number") result = vm.newNumber(nativeObj)
  else if (typeof nativeObj === "string") result = vm.newString(nativeObj)
  else if (Array.isArray(nativeObj)) result = vm.newArray(nativeObj)
  else if (typeof nativeObj === "object") {
    let docObj = vm.newObject()
    result = docObj
    seen.push({ nativeObj: nativeObj, obj: result });
    for (let key in nativeObj) {
      let val = deepObj(nativeObj, nativeObj[key], vm, depth + 1)
      if (val !== null) vm.setProp(docObj, key, val)
    }
  }
  return result
}

function deepProps(nativeObj, vm) {
  let res = {}
  for (let key in nativeObj) {
    let val = deepObj(nativeObj, nativeObj[key], vm, 1)
    if (val !== null) res[key] = val
  }
  return res
}

export default App;
