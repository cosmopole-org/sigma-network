"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MemoryLayer_1 = require("./MemoryLayer");
const utils_1 = require("./utils");
class Runtime {
    _module;
    get module() { return this._module; }
    _creature;
    get creature() { return this._creature; }
    _native;
    get native() { return this._native; }
    stack = [];
    pushOnStack(initialUnits) { this.stack.push(new MemoryLayer_1.default(initialUnits)); }
    popFromStack() { this.stack.pop(); }
    get stackTop() { return this.stack[this.stack.length - 1]; }
    resetStack() {
        this.stack = [];
        this.pushOnStack({ ...this._native });
    }
    reset() {
        this.resetStack();
    }
    execute(ast) {
        utils_1.default.executor.executeBlock(ast, new utils_1.default.executor.ExecutionMeta({ creature: this._creature }));
    }
    load() {
        this.execute(this.module.ast.body.body);
    }
    clone() {
        return new Runtime(this.module, this.creature, { native: this.native, stack: new Array(...this.stack) });
    }
    constructor(mod, creature, reusableTools) {
        this._module = mod;
        this._creature = creature;
        this._native = reusableTools?.native ? reusableTools.native : this._module.applet.buildContext(this._module);
        if (reusableTools?.stack) {
            this.stack = reusableTools.stack;
        }
        else {
            this.reset();
        }
    }
}
exports.default = Runtime;
