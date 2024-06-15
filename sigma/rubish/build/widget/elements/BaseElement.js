"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseElement {
    _key;
    get key() { return this._key; }
    _controlType;
    get controlType() { return this._controlType; }
    _props;
    get props() { return this._props; }
    _styles;
    get styles() { return this._styles; }
    _children;
    get children() { return this._children; }
    update(props, styles, children) {
        if (props)
            this._props = props;
        if (styles)
            this._styles = styles;
        if (children)
            this._children = children;
    }
    constructor(key, controlType, props, styles, children) {
        this._key = key;
        this._controlType = controlType;
        this._props = props;
        this._styles = styles;
        this._children = children ? children : [];
    }
}
exports.default = BaseElement;
