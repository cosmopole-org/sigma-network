"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FuncStore {
    _store;
    get store() { return this._store; }
    putFunc(func) { this._store[func.key] = func; }
    removeFunc(key) { delete this._store[key]; }
    findFunc(key) { return this._store[key]; }
    constructor() {
        this._store = {};
    }
}
exports.default = FuncStore;
