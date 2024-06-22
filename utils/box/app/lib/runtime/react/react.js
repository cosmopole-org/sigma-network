
import diff from './diff';
import Element from "./element";

let vdom;
let targetFunc;
let callbackDict = {};
let keyCounter = 1;
let renderCache = {};
let stateCache = {};
let stateCounter = 0;
let lastUpdateOfRender;
let lastOldCache;
let tree = [];
let currentPath = "";
let currentKey;
let renderedChildren = {};
let keyChanges = {};
let indexCache = {};

let genKey = () => {
    return (keyCounter++).toString();
}

global.trigger = function trigger(callbackId) {
    let cb = callbackDict[callbackId];
    if (cb) cb();
}

class Dep {

    subs;
    parentPath;

    constructor(parentPath) {
        this.subs = new Set();
        this.parentPath = parentPath;
    }
    depend() {
        targetFunc && this.subs.add(targetFunc);
    }
    notify() {
        this.subs.forEach((sub) => sub && sub(this.parentPath));
    }
}

const isFunction = (target) => typeof target === 'function';
const isObject = (target) => typeof target === 'object' && target !== null;
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
const setter = (prx, dep) => (data) => {
    const result = isFunction(data) ? data(prx.data) : data;
    if (isObject(result)) clone(result, prx.data);
    else prx.data = result;
    dep.notify();
    message(JSON.stringify({ action: "update", element: diff(undefined, lastOldCache, lastUpdateOfRender) }));
};
const createOptions = (dep) => ({
    get(target, key) {
        if (isObject(target[key]))
            return new Proxy(target[key], createOptions(dep));
        return target[key];
    },
});

const createEffect = (fun) => {
    targetFunc = fun;
    let res = targetFunc();
    targetFunc = null;
    return res;
};

const flatten = (result, child) => {
    if (Array.isArray(child)) {
        child.forEach((nestedChild) => {
            flatten(result, nestedChild);
        });
    } else {
        result.push(child);
    }
};

const React = {
    createElement: (tag, props, ...children) => {
        if (props === undefined || props === null) {
            props = {};
        }
        if (children === undefined || children === null) {
            children = [];
        }

        if (isFunction(tag)) {
            return (counter, parentKey) => {
                if (props.key === undefined) {
                    props.key = parentKey + "_child";
                }
                indexCache[currentPath + "|" + props.key] = counter;
                return createEffect((parentPath) => {
                    if (parentPath === undefined) {
                        parentPath = tree.join("/");
                    }
                    let counterInner = indexCache[parentPath + "|" + props.key];

                    if (counterInner === undefined) {
                        counterInner = 0;
                    }
                    let path = (parentPath ? (parentPath + "/") : "") + (tag.name + ":" + counterInner);
                    let cpBackup = currentPath;
                    currentPath = path;

                    let keyBackup = currentKey;
                    if (props.key !== undefined) {
                        currentKey = props.key;
                    }
                    let scBackup = stateCounter;
                    stateCounter = 0;
                    let treeBackup = tree;
                    tree = parentPath.split("/");
                    tree.push(tag.name + ":" + counterInner)
                    let kcBackup = keyChanges;
                    keyChanges = {};

                    let pathesOfChildren = {};
                    let keys = Object.keys(stateCache);
                    for (const pathKey of keys) {
                        if ((pathKey.startsWith(path)) && (path != pathKey)) {
                            pathesOfChildren[pathKey] = stateCache[pathKey].key;
                        }
                    }
                    let rcBackup = renderedChildren;
                    renderedChildren = {};

                    lastUpdateOfRender = tag(props, children)(undefined, props.key);

                    let pocl = Object.keys(pathesOfChildren);
                    pocl.forEach(ck => {
                        if (renderedChildren[ck] === undefined) {
                            delete stateCache[ck];
                        }
                    })
                    renderedChildren = rcBackup;
                    renderedChildren[path] = props.key;

                    keyChanges = kcBackup;
                    tree.pop();
                    tree = treeBackup;
                    stateCounter = scBackup;
                    currentKey = keyBackup;
                    lastOldCache = renderCache[path];
                    renderCache[path] = lastUpdateOfRender;

                    currentPath = cpBackup;

                    return lastUpdateOfRender;
                });
            }
        }

        return (counter, parentKey) => {

            if (counter === undefined) {
                counter = 0;
            }

            if (props.key === undefined) {
                props.key = parentKey + "_child";
            }

            let elTag = tag;
            let elProps = {};
            Object.entries(props).forEach(([name, value]) => {
                if (name.startsWith('on')) {
                    let callbackId = genKey();
                    callbackDict[callbackId] = value;
                    elProps[name.toLowerCase()] = callbackId;
                } else {
                    elProps[name] = value;
                }
            });

            let treeBackup = tree;
            tree = currentPath.split("/");
            tree.push(tag + ":" + counter);
            let cpBackup = currentPath;
            currentPath = tree.join("/");

            let keyBackup = currentKey;
            if (props.key !== undefined) {
                currentKey = props.key;
            }

            let c = [];
            flatten(c, children);
            let childs = c.map((child, i) => {
                if (isFunction(child)) {
                    return child(i, props.key);
                } else {
                    return child;
                }
            });

            currentPath = cpBackup;
            currentKey = keyBackup;

            let element = new Element(elTag, elProps, childs.filter(child => (child !== null)));

            tree.pop();
            tree = treeBackup;

            return element;
        }
    },
    init: (rootComp) => {
        currentPath = "App:0";
        vdom = rootComp(0);
        renderCache["App:0"] = vdom;
        message(JSON.stringify({ action: "init", element: vdom }));
        return vdom;
    },
    useState: (data) => {
        let path = currentPath;
        let statesHolder = stateCache[path];
        if ((statesHolder === undefined) || (statesHolder.key !== currentKey)) {
            if ((statesHolder !== undefined) && (statesHolder.key !== currentKey)) {
                let oldPathArr = path.split("/");
                let keys = Object.keys(stateCache);
                for (const pathKey of keys) {
                    if (stateCache[pathKey].key === currentKey) {
                        let newPathArrTest = pathKey.split("/");
                        if (oldPathArr.length === newPathArrTest.length) {
                            let diffCount = 0;
                            let diffPart;
                            for (let i = 0; i < oldPathArr.length; i++) {
                                if (oldPathArr[i] !== newPathArrTest[i]) {
                                    diffPart = oldPathArr[i];
                                    diffCount++;
                                }
                            }
                            if (diffCount === 1) {
                                let statesHolderNew = stateCache[pathKey];
                                statesHolderNew.dep.parentPath = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "";
                                stateCache[path] = statesHolderNew;
                                indexCache[newPathArrTest.slice(0, newPathArrTest.length - 1).join("/") + "|" + statesHolderNew.key] = Number(diffPart.split(":")[1]);
                                let state = statesHolderNew.states[stateCounter];
                                stateCounter++;
                                return state;
                            }
                        }
                    }
                }
            }
            const dep = new Dep(path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "");
            dep.depend();
            const prx = new Proxy({ data }, createOptions(dep));
            let state = [() => prx.data, setter(prx, dep)];
            stateCache[path] = { states: [state], key: currentKey, dep };
            stateCounter++;
            return state;
        }
        let state = statesHolder.states[stateCounter];
        stateCounter++;
        return state;
    },
    setTimeout: (cb, time) => {
        let callbackId = genKey();
        callbackDict[callbackId] = cb;
        message(JSON.stringify({ action: "setTimeout", callbackId, time }));
    }
};

export default React;
