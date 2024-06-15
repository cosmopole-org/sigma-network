
import BaseElement from "../elements/BaseElement";
import BaseProp from "../props/BaseProp";
import ExecutionMeta from "../ExecutionMeta";
import Creature from "../Creature";

let generateKey = () => {
    return Math.random().toString().substring(2)
}

function clone<T>(instance: T): T {
    const copy = new (instance.constructor as { new(): T })();
    Object.assign(copy, instance);
    return copy;
}

const prepareElement = (
    typeName: string,
    defaultProps: { [id: string]: BaseProp },
    overridenProps: { [id: string]: any },
    defaultStyles: { [id: string]: any },
    overridenStyles: { [id: string]: any },
    children: Array<BaseElement>
) => {
    let finalProps = {}
    Object.keys(defaultProps).forEach(propKey => {
        if (overridenProps[propKey] !== undefined) {
            let bpProp = defaultProps[propKey]
            let copiedProp = clone(bpProp)
            copiedProp.setValue(overridenProps[propKey])
            finalProps[propKey] = copiedProp
        }
    });
    let finalStyles = { ...defaultStyles }
    if (overridenStyles) finalStyles = { ...finalStyles, ...overridenStyles }
    return new BaseElement(overridenProps['key'], typeName, finalProps, finalStyles, children)
}

const nestedContext = (creature: Creature, otherMetas?: ExecutionMeta) => {
    if (otherMetas) {
        return new ExecutionMeta({ ...otherMetas, creature, isAnotherCreature: true })
    } else {
        return new ExecutionMeta({ creature, isAnotherCreature: true })
    }
}

export default { generateKey, prepareElement, nestedContext }
