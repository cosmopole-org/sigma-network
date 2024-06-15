"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class INative {
    _module;
    get key() { return this._module.key; }
    constructor(module) {
        this._module = module;
    }
}
exports.default = INative;
