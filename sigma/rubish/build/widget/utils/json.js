"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let prettify = (obj) => {
    return JSON.stringify(obj, undefined, 4);
};
let updates = [];
let findChanges = (parentKey, el1, el2) => {
    if (el1._key !== el2._key) {
        updates.push({
            __action__: 'element_deleted',
            __key__: el1._key,
            __parentKey__: parentKey
        }, {
            __action__: 'element_created',
            __key__: el2._key,
            __element__: el2,
            __parentKey__: parentKey
        });
        return;
    }
    let propsChanges = { __action__: 'props_updated', __key__: el2._key, __created__: {}, __deleted__: {}, __updated__: {} };
    for (let pKey in el2._props) {
        if (el1._props[pKey] === undefined) {
            propsChanges.__created__[pKey] = el2._props[pKey];
        }
    }
    for (let pKey in el1._props) {
        if (el2._props[pKey] === undefined) {
            propsChanges.__deleted__[pKey] = el2._props[pKey];
        }
    }
    for (let pKey in el2._props) {
        if (el1._props[pKey] !== undefined && el2._props[pKey] !== undefined) {
            if (el1._props[pKey].getValue() !== el2._props[pKey].getValue()) {
                propsChanges.__updated__[pKey] = el2._props[pKey];
            }
        }
    }
    if ((Object.keys(propsChanges.__created__).length > 0) ||
        (Object.keys(propsChanges.__deleted__).length > 0) ||
        (Object.keys(propsChanges.__updated__).length > 0)) {
        updates.push(propsChanges);
    }
    let stylesChanges = { __action__: 'styles_updated', __key__: el2._key, __created__: {}, __deleted__: {}, __updated__: {} };
    for (let sKey in el2._styles) {
        if (el1._styles[sKey] === undefined) {
            stylesChanges.__created__[sKey] = el2._styles[sKey];
        }
    }
    for (let sKey in el1._styles) {
        if (el2._styles[sKey] === undefined) {
            stylesChanges.__deleted__[sKey] = el2._styles[sKey];
        }
    }
    for (let sKey in el2._styles) {
        if (el1._styles[sKey] !== undefined && el2._styles[sKey] !== undefined) {
            if (el1._styles[sKey] !== el2._styles[sKey]) {
                stylesChanges.__updated__[sKey] = el2._styles[sKey];
            }
        }
    }
    if ((Object.keys(stylesChanges.__created__).length > 0) ||
        (Object.keys(stylesChanges.__deleted__).length > 0) ||
        (Object.keys(stylesChanges.__updated__).length > 0)) {
        updates.push(stylesChanges);
    }
    let cs = {};
    el2._children.forEach(child => { cs[child._key] = child; });
    el1._children.forEach(child => {
        if (cs[child._key]) {
            findChanges(el1._key, child, cs[child._key]);
        }
        else {
            updates.push({
                __action__: 'element_deleted',
                __key__: child._key,
                __parentKey__: el1._key
            });
        }
    });
    cs = {};
    el1._children.forEach(child => { cs[child._key] = child; });
    el2._children.forEach(child => {
        if (!cs[child._key]) {
            updates.push({
                __action__: 'element_created',
                __key__: child._key,
                __element__: child,
                __parentKey__: el2._key
            });
        }
    });
};
let diff = (el1, el2) => {
    updates = [];
    findChanges(undefined, el1, el2);
    return updates;
};
exports.default = { prettify, diff };
