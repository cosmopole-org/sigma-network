"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseElement_1 = require("../elements/BaseElement");
const ExecutionMeta_1 = require("../ExecutionMeta");
let generateKey = () => {
    return Math.random().toString().substring(2);
};
function clone(instance) {
    const copy = new instance.constructor();
    Object.assign(copy, instance);
    return copy;
}
const prepareElement = (typeName, defaultProps, overridenProps, defaultStyles, overridenStyles, children) => {
    let finalProps = {};
    Object.keys(defaultProps).forEach(propKey => {
        if (overridenProps[propKey] !== undefined) {
            let bpProp = defaultProps[propKey];
            let copiedProp = clone(bpProp);
            copiedProp.setValue(overridenProps[propKey]);
            finalProps[propKey] = copiedProp;
        }
    });
    let finalStyles = { ...defaultStyles };
    if (overridenStyles)
        finalStyles = { ...finalStyles, ...overridenStyles };
    return new BaseElement_1.default(overridenProps['key'], typeName, finalProps, finalStyles, children);
};
const nestedContext = (creature, otherMetas) => {
    if (otherMetas) {
        return new ExecutionMeta_1.default({ ...otherMetas, creature, isAnotherCreature: true });
    }
    else {
        return new ExecutionMeta_1.default({ creature, isAnotherCreature: true });
    }
};
exports.default = { generateKey, prepareElement, nestedContext };
