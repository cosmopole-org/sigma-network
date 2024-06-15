"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseProp {
    _type;
    get type() { return this._type; }
    constructor(type) {
        this._type = type;
    }
}
exports.default = BaseProp;
