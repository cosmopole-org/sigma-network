let updates = [];
let diffStack = [];
let pp = "";

const generatePath = () => {
    if (pp.length > 0) {
        return pp + "/" + diffStack.join("/");
    } else {
        return diffStack.join("/");
    }
}

const generatePathForProps = () => {
    if (pp.length > 0) {
        if (diffStack.length > 1) {
            return pp + "/" + diffStack.slice(0, diffStack.length - 1).join("/");
        } else {
            return pp;
        }
    } else {
        return diffStack.slice(0, diffStack.length - 1).join("/");
    }
}

let findChanges = (parentKey, el1, el2) => {
    if (el1 === undefined) {
        updates.push(
            {
                __action__: 'element_created',
                __key__: el2.key,
                __element__: el2,
                __parentKey__: parentKey,
                path: generatePath()
            }
        );
        return;
    }
    if (el2 === undefined) {
        updates.push(
            {
                __action__: 'element_deleted',
                __key__: el1.key,
                __parentKey__: parentKey,
                path: generatePath()
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
                    __parentKey__: parentKey,
                    path: generatePathForProps()
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
                __parentKey__: parentKey,
                path: generatePath()
            },
            {
                __action__: 'element_created',
                __key__: el2.key,
                __element__: el2,
                __parentKey__: parentKey,
                path: generatePath()
            }
        )
        return
    }
    let propsChanges = { __action__: 'props_updated', __key__: el2.key, __created__: {}, __deleted__: {}, __updated__: {}, path: generatePathForProps() }
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
    el2.children.forEach((child, i) => { cs[child.key] = { child, index: i } })
    el1.children.forEach(child => {
        if (child.key === undefined) {
            // pass
        } else if (cs[child.key]) {
            diffStack.push(child.tagName + ":" + cs[child.key].index);
            findChanges(el1.key, child, cs[child.key].child)
            diffStack.pop();
        } else {
            updates.push(
                {
                    __action__: 'element_deleted',
                    __key__: child.key,
                    __parentKey__: el1.key,
                    path: generatePath()
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
                    __parentKey__: el2.key,
                    path: generatePathForProps()
                }
            );
        } else if (!cs[child.key]) {
            updates.push(
                {
                    __action__: 'element_created',
                    __key__: child.key,
                    __element__: child,
                    __parentKey__: el2.key,
                    path: generatePath()
                }
            )
        }
    })
}

const diff = (parentPath, parentKey, el1, el2) => {
    updates = [];
    diffStack = [];
    pp = parentPath;
    if (pp.startsWith("/")) {
        pp = pp.substring(1);
    }
    diffStack.push("div:0");
    findChanges(parentKey, el1, el2);
    diffStack.pop();
    return updates;
}

export default diff;
