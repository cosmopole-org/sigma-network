"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseProp_1 = require("./BaseProp");
class FuncProp extends BaseProp_1.default {
    _value;
    get value() { return this._value; }
    setValue(v) { this._value = v; }
    getValue() { return this._value; }
    _defaultValue;
    get defaultValue() { return this._defaultValue; }
    constructor(defaultValue) {
        super('function');
        this._value = defaultValue;
        this._defaultValue = defaultValue;
    }
}
exports.default = FuncProp;
