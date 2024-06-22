let updates = []

let findChanges = (parentKey, el1, el2) => {
    if (el1 === undefined) {
        updates.push(
            {
                __action__: 'element_created',
                __key__: el2.key,
                __element__: el2,
                __parentKey__: parentKey
            }
        );
        return;
    }
    if (el2 === undefined) {
        updates.push(
            {
                __action__: 'element_deleted',
                __key__: el1.key,
                __parentKey__: parentKey
            }
        );
        return;
    }
    if (el2.key === undefined) {
        if (el2 !== el1) {
            updates.push(
                {
                    __action__: 'raw_updated',
                    __element__: el2,
                    __parentKey__: parentKey
                }
            );
        }
        return;
    }
    if (el1.key !== el2.key) {
        updates.push(
            {
                __action__: 'element_deleted',
                __key__: el1.key,
                __parentKey__: parentKey
            },
            {
                __action__: 'element_created',
                __key__: el2.key,
                __element__: el2,
                __parentKey__: parentKey
            }
        )
        return
    }
    let propsChanges = { __action__: 'props_updated', __key__: el2.key, __created__: {}, __deleted__: {}, __updated__: {} }
    for (let pKey in el2.props) {
        if (el1.props[pKey] === undefined) {
            propsChanges.__created__[pKey] = el2.props[pKey]
        }
    }
    for (let pKey in el1.props) {
        if (el2.props[pKey] === undefined) {
            propsChanges.__deleted__[pKey] = el2.props[pKey]
        }
    }
    for (let pKey in el2.props) {
        if (el1.props[pKey] !== undefined && el2.props[pKey] !== undefined) {
            if (el1.props[pKey] !== el2.props[pKey]) {
                propsChanges.__updated__[pKey] = el2.props[pKey]
            }
        }
    }
    if (
        (Object.keys(propsChanges.__created__).length > 0) ||
        (Object.keys(propsChanges.__deleted__).length > 0) ||
        (Object.keys(propsChanges.__updated__).length > 0)
    ) {
        updates.push(propsChanges)
    }
    // let stylesChanges = { __action__: 'styles_updated', __key__: el2.key, __created__: {}, __deleted__: {}, __updated__: {} }
    // for (let sKey in el2._styles) {
    //     if (el1._styles[sKey] === undefined) {
    //         stylesChanges.__created__[sKey] = el2._styles[sKey]
    //     }
    // }
    // for (let sKey in el1._styles) {
    //     if (el2._styles[sKey] === undefined) {
    //         stylesChanges.__deleted__[sKey] = el2._styles[sKey]
    //     }
    // }
    // for (let sKey in el2._styles) {
    //     if (el1._styles[sKey] !== undefined && el2._styles[sKey] !== undefined) {
    //         if (el1._styles[sKey] !== el2._styles[sKey]) {
    //             stylesChanges.__updated__[sKey] = el2._styles[sKey]
    //         }
    //     }
    // }
    // if (
    //     (Object.keys(stylesChanges.__created__).length > 0) ||
    //     (Object.keys(stylesChanges.__deleted__).length > 0) ||
    //     (Object.keys(stylesChanges.__updated__).length > 0)
    // ) {
    //     updates.push(stylesChanges)
    // }
    let cs = {}
    el2.children.forEach(child => { cs[child.key] = child })
    el1.children.forEach(child => {
        if (child.key === undefined) {
            // pass
        } else if (cs[child.key]) {
            findChanges(el1.key, child, cs[child.key])
        } else {
            updates.push(
                {
                    __action__: 'element_deleted',
                    __key__: child.key,
                    __parentKey__: el1.key
                }
            )
        }
    })
    cs = {}
    el1.children.forEach(child => { cs[child.key] = child })
    el2.children.forEach(child => {
        if (child.key === undefined) {
            updates.push(
                {
                    __action__: 'raw_updated',
                    __element__: child,
                    __parentKey__: el2.key
                }
            );
        } else if (!cs[child.key]) {
            updates.push(
                {
                    __action__: 'element_created',
                    __key__: child.key,
                    __element__: child,
                    __parentKey__: el2.key
                }
            )
        }
    })
}

const diff = (parentKey, el1, el2) => {
    updates = []
    findChanges(parentKey, el1, el2)
    return updates
}

export default diff;
