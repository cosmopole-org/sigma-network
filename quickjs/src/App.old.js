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
              el.appendChild(render(data.props.children[i]));
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
          const findAndReplaceComp = (key, path, parent, index, node, child) => {
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
                let res = findAndReplaceComp(key, path + "/" + (node.props.children[i].tag + ":" + i), node, i, node.props.children[i], child);
                if (res) return true;
              }
            }
            return false;
          }
          const replace = (data) => {
            findAndReplaceComp(data.props['box-key'], 'root:0', null, 0, root, data);
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
                (newVal) => { data.hookMeta[hookIndex].value = newVal; prx.value = newVal; fnQueue = []; counter = 0; let res = runComp(cc, savedKey); replace(res); runFnQueue(); }
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

          let counter = 0;

          const runComp = (c, key) => {

            console.log(counter);
            
            stack.push(c.name + ":" + counter);
            let path = stack.join("/");
            
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

            let bc = counter;
            counter = 0;

            let res = currComp();

            counter = bc;
            
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

            stack.pop();

            counter++;
            
            return res;
          }
          const runFnQueue = () => {
            fnQueue.forEach(fn => fn());
          }
          let fnQueue = [];
          let metaCache = {};
          let keyCache = {};
          let currentKey = undefined;
          let stack = [];
        `);
        vm.evalCode(`
          const child1 = () => {
            let [obj, setObj] = useState(0);
            useEffect(() => {
              setInterval(() => {
                setObj(obj.value + 1);
              }, 1000)
            }, []);
            return { "tag": "div", "props": { "style": "background-color: red;", "children": [obj.value] } };
          }
          const comp = () => {
            let [arr, setArr] = useState([]);
            let [b, setB] = useState(false);
            useEffect(() => {
              setInterval(() => {
                if (arr.value.length > 5) setB(true);
                if (!b.value) setArr([...arr.value, Math.random().toString()]);
                else if (arr.value.length > 0) setArr(arr.value.slice(1, arr.value.length));
              }, 3000)
            }, []);
            return { "tag": "div", "props": { "style": "background-color: blue;", "children": arr.value.map(i => runComp(child1, i)) } };
          }
          let res = runComp(comp);
          root = res;
          jsx(JSON.stringify(root));
          runFnQueue();
          console.log("hello");
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
