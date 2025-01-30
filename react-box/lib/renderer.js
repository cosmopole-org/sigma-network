import ReactReconciler from 'react-reconciler'
import {
    unstable_scheduleCallback as schedulePassiveEffects,
    unstable_cancelCallback as cancelPassiveEffects
  } from 'scheduler';

let DefaultEventPriority = 16;

function traceWrap(hostConfig) {
    let traceWrappedHostConfig = {};
    Object.keys(hostConfig).map(key => {
        const func = hostConfig[key];
        traceWrappedHostConfig[key] = (...args) => {
            console.log(key, ...args);
            return func(...args);
        };
    });
    return traceWrappedHostConfig;
}

const rootHostContext = {};
const childHostContext = {};

let nextEffect;

let resolveDefaultProps = (el, prevProps) => {
    return el;
}

globalThis.callbacks = {};

const hostConfig = {
    schedulePassiveEffects,
    cancelPassiveEffects,
    now: Date.now,
    scheduleTimeout: globalThis.setTimeout,
    cancelTimeout: globalThis.cancelTimeout,
    getInstanceFromNode() {

    },
    beforeActiveInstanceBlur() {

    },
    afterActiveInstanceBlur() {

    },
    preparePortalMount() {

    },
    prepareScopeUpdate() {

    },
    detachDeletedInstance() {

    },
    getInstanceFromScope() {

    },
    getCurrentEventPriority() {
        return DefaultEventPriority;
    },
    clearContainer(node) {
        node.children = [];
    },
    commitBeforeMutationEffects(
        root,
        firstChild,
    ) {
        nextEffect = firstChild;
        commitBeforeMutationEffects_begin();
    },
    commitBeforeMutationEffects_begin() {
        commitBeforeMutationEffects_complete();
    },
    commitBeforeMutationEffects_complete() {
        commitBeforeMutationEffectsOnFiber(fiber);
    },
    commitBeforeMutationEffectsOnFiber(finishedWork) {
        let typeName = finishedWork.tag.constructor.name
        switch (typeName) {
            case 'FunctionComponent':
            case 'ForwardRef':
            case 'SimpleMemoComponent': {
                break;
            }
            case 'ClassComponent': {
                const snapshot = instance.getSnapshotBeforeUpdate(
                    finishedWork.elementType === finishedWork.type
                        ? prevProps
                        : resolveDefaultProps(finishedWork.type, prevProps),
                    prevState,
                );
                break;
            }
        }
    },
    getRootHostContext: () => {
        return rootHostContext;
    },
    prepareForCommit: () => { },
    resetAfterCommit: () => { },
    getChildHostContext: () => {
        return childHostContext;
    },
    shouldSetTextContent: (type, props) => {
        return typeof props.children === 'string' || typeof props.children === 'number';
    },
    createInstance: (type, newProps, rootContainerInstance, _currentHostContext, workInProgress) => {
        let domElement = { TYPE: type, REACT_BOX_KEY: Date.now().toString() + "_" + Math.random().toString().substring(2), disabled: false }
        Object.keys(newProps).forEach(propName => {
            const propValue = newProps[propName];
            if (propName === 'children') {
                if (typeof propValue === 'string' || typeof propValue === 'number') {
                    domElement.textContent = propValue;
                }
            } else if (propName.startsWith("on")) {
                console.log(propValue?.toString());
                if (!propValue) {
                    delete globalThis.callbacks[domElement.REACT_BOX_KEY + "_" + propName];
                } else {
                    globalThis.callbacks[domElement.REACT_BOX_KEY + "_" + propName] = propValue;
                    domElement[propName] = domElement.REACT_BOX_KEY + "_" + propName;
                }
            } else {
                domElement[propName] = propValue;
            }
        });
        api.createElement(domElement);
        return domElement;
    },
    createTextInstance: text => {
        let domElement = { TYPE: "text", text: text, REACT_BOX_KEY: Date.now().toString() + "_" + Math.random().toString().substring(2) };
        api.createTextElement(domElement);
        return domElement;
    },
    appendInitialChild: (parent, child) => {
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(child);
        api.appendInitialChild(parent, child);
    },
    appendChild(parent, child) {
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(child);
        api.appendChild(parent, child);
    },
    finalizeInitialChildren: (domElement, type, props) => {
        api.finalizeInitialChildren(domElement)
    },
    supportsMutation: true,
    appendChildToContainer: (parent, child) => {
        if (!parent.children) {
            parent.children = [];
        }
        parent.children.push(child);
        api.appendChild(parent, child);
    },
    prepareUpdate(domElement, oldProps, newProps) {
        return true;
    },
    commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
        console.log(domElement, updatePayload, type, oldProps, newProps)
        Object.keys(newProps).forEach(propName => {
            const propValue = newProps[propName];
            if (propName === 'children') {
                if (typeof propValue === 'string' || typeof propValue === 'number') {
                    domElement.textContent = propValue;
                }
            } else if (propName.startsWith("on")) {
                console.log(propValue?.toString());
                if (!propValue) {
                    delete globalThis.callbacks[domElement.REACT_BOX_KEY + "_" + propName];
                } else {
                    globalThis.callbacks[domElement.REACT_BOX_KEY + "_" + propName] = propValue;
                    domElement[propName] = domElement.REACT_BOX_KEY + "_" + propName;
                }
            } else {
                domElement[propName] = propValue;
            }
        });
        api.updateElement(domElement);
    },
    commitTextUpdate(textInstance, oldText, newText) {
        textInstance.text = newText;
        api.updateTextElement(textInstance);
    },
    removeChild(parentInstance, child) {
        const index = parentInstance.children.indexOf(child);
        if (index > -1) {
            parentInstance.children.splice(index, 1);
        }
        api.removeChild(parentInstance, child);
    },
    removeChildFromContainer(parentInstance, child) {
        const index = parentInstance.children.indexOf(child);
        if (index > -1) {
            parentInstance.children.splice(index, 1);
        }
        api.removeChild(parentInstance, child);
    }
};

globalThis.domEl = {};

const ReactReconcilerInst = ReactReconciler(traceWrap(hostConfig));
export const Renderer = {
    render: (reactElement, domElement, callback) => {
        if (!globalThis.domEl._rootContainer) {
            globalThis.domEl._rootContainer = ReactReconcilerInst.createContainer(globalThis.domEl, false);
        }
        globalThis.rootContent = ReactReconcilerInst.updateContainer(reactElement, globalThis.domEl._rootContainer, null, callback);
        return globalThis.rootContent
    }
};
