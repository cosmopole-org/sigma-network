"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DOM {
    _module;
    get module() { return this._module; }
    _creature;
    get creature() { return this._creature; }
    _root;
    get root() { return this._root; }
    setRoot(root) { this._root = root; }
    constructor(module, creature, root) {
        this._module = module;
        this._creature = creature;
        this._root = root;
    }
}
exports.default = DOM;
