

let targetFunc;
let callbackDict = {};
let keyCounter = 1;
let vdom;
let rendering;
let stack = [];
let compCache = {};
let keyCache = {};
let renderStack = [];
let stateCounter = 0;
let indexCounter = 0;
let updatingTreePath;

global.trigger = function trigger(callbackId) {
  let cb = callbackDict[callbackId];
  if (cb) cb();
}

const isFunction = (target) => typeof target === 'function';

const isObject = (target) => typeof target === 'object' && target !== null;

class Element {
  tag;
  key;
  props = {}
  events = {}
  children = []
  constructor(tag, props, events, children) {
    this.tag = tag;
    let path = renderStack.join("/");
    if (keyCache[path]) {
      this.key = keyCache[path];
    } else {
      let key = Math.random().toString().substring(2);
      keyCache[path] = key;
      this.key = key;
    }
    this.props = props ?? {};
    this.events = events ?? {};
    this.children = children ?? [];
  }
  addChild(child, j = 0) {
    if (Array.isArray(child)) {
      child.forEach((nestedChild, i) => {
        this.addChild(nestedChild, i + j);
      });
    } else if (this.children[j] == undefined) {
      this.children.push(child);
    } else if (JSON.stringify(child) !== JSON.stringify(this.children[j])) {
      this.children[j] = child;
    }
  }
  removeChild(index) {
    this.children.splice(index, 1);
  }
  static create(tag, props = {}, ...children) {
    if (props === undefined || props === null) {
      props = {};
    }
    if (children === undefined || children === null) {
      children = [];
    }
    if (isFunction(tag)) {
      let previoudRendering = rendering;
      let renderStackBackup = [...renderStack];
      let copyOfRenderStack = [...renderStack, tag.name + "/" + indexCounter];
      let path = renderStack.join("/");
      let ic = indexCounter;
      rendering = () => {
        let prevStateCounter = stateCounter;
        stateCounter = 0;
        stack.push([]);
        renderStack = copyOfRenderStack;
        let prevIndexCounter = indexCounter;
        indexCounter = 0;
        let res = tag(props, children);
        indexCounter = prevIndexCounter;
        renderStack = renderStackBackup;
        let states = stack.pop();
        let key = (path.length > 0 ? (path + "/") : "") + tag.name + "/" + ic;
        if (!compCache[key]) {
          compCache[key] = states;
        }
        stateCounter = prevStateCounter;
        if (vdom && (key === updatingTreePath)) {
          message(JSON.stringify({ action: "update", element: res }));
        }
        return res;
      }
      let res = rendering();
      renderStack = renderStackBackup;
      rendering = previoudRendering;
      return res;
    }
    let element = new Element(tag);
    Object.entries(props).forEach(([name, value]) => {
      if (name.startsWith('on')) {
        let callbackId = (keyCounter++).toString();
        callbackDict[callbackId] = value;
        element.events[name.toLowerCase().substring(2)] = callbackId;
      } else {
        element.props[name] = value;
      }
    });
    let prevIndexCounter = indexCounter;
    indexCounter = 0;
    const res = children.map((child) => {
      const value = isFunction(child) ? child() : child;
      return value;
    });
    indexCounter = prevIndexCounter;
    element.addChild(res);
    indexCounter++;
    return element;
  }
}

class Dep {
  constructor() {
    this.subs = new Set();
  }
  depend(rendering) {
    rendering && this.subs.add(rendering);
  }
  notify() {
    this.subs.forEach((sub) => sub());
  }
}

const createEffect = (fun) => {
  targetFunc = fun;
  targetFunc();
  targetFunc = null;
};

const clone = (acc, target) => {
  if (isObject(acc)) {
    Object.keys(acc).forEach((key) => {
      if (isObject(acc[key])) target[key] = clone(acc[key], target[key]);
      else target[key] = acc[key];
    });
  } else {
    target = acc;
  }
  return target;
};
const setter = (prx, dep, path) => (data) => {
  updatingTreePath = path;
  const result = isFunction(data) ? data(prx.data) : data;
  if (isObject(result)) clone(result, prx.data);
  else prx.data = result;
  indexCounter = 0;
  dep.notify();
};
const createOptions = (dep) => ({
  get(target, key) {
    if (isObject(target[key]))
      return new Proxy(target[key], createOptions(dep));
    return target[key];
  },
});

const React = {
  createElement: (tag, props, ...children) => {
    return Element.create(tag, props, ...children);
  },
  init: (rootComp) => {
    vdom = rootComp;
    message(JSON.stringify({ action: "init", element: rootComp }));
    return vdom;
  },
  useState: (data) => {
    let key = renderStack.join("/");
    let result;
    let states = compCache[key];
    if (states) {
      result = states[stateCounter];
      stateCounter++;
    } else {
      const dep = new Dep();
      dep.depend(rendering);
      const prx = new Proxy({ data }, createOptions(dep));
      result = [() => prx.data, setter(prx, dep, key)];
      stack[stack.length - 1].push(result);
      stateCounter++;
    }
    return result;
  },
  setTimeout: (cb, time) => {
    let callbackId = (keyCounter++).toString();
    callbackDict[callbackId] = cb;
    message(JSON.stringify({ action: "setTimeout", callbackId, time }));
  }
};

export default React;
