"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DOM_1 = require("./DOM");
const ExecutionMeta_1 = require("./ExecutionMeta");
const Runtime_1 = require("./Runtime");
const utils_1 = require("./utils");
class Creature {
    _key;
    get key() { return this._key; }
    _cosmoId;
    get cosmoId() { return this._cosmoId; }
    setCosmoId(cosmoId) { this._cosmoId = cosmoId; }
    _module;
    get module() { return this._module; }
    _runtime;
    get runtime() { return this._runtime; }
    _dom;
    get dom() { return this._dom; }
    thisObj;
    getBaseMethod(methodId) {
        return this._runtime.stack[0].findUnit(methodId);
    }
    update(props, styles, children) {
        this.thisObj = {
            ...this.thisObj,
            props,
            styles,
            children
        };
    }
    fillChildren(children) {
        this.thisObj.children = children;
    }
    constructor(module, defaultValues) {
        this._key = defaultValues?._key ? defaultValues._key : utils_1.default.generator.generateKey();
        this._cosmoId = defaultValues?.cosmoId;
        this._module = module;
        this._dom = defaultValues?.dom ? defaultValues.dom : new DOM_1.default(this._module, this);
        this._runtime = defaultValues?.runtime ? defaultValues.runtime : new Runtime_1.default(this._module, this);
        this.thisObj = defaultValues?.thisObj;
        if (!defaultValues?.runtime) {
            this._runtime.load();
        }
        if (!this.thisObj) {
            this.thisObj = {};
            Object.keys(this._runtime.stack[0].units).forEach(k => {
                if (!this._runtime.native[k] || (k === 'constructor')) {
                    this.thisObj[k] = this._runtime.stack[0].units[k];
                }
            });
            this.thisObj = {};
        }
        this.thisObj['setState'] = (stateUpdate) => {
            console.log(stateUpdate);
            this.thisObj['state'] = { ...this.thisObj['state'], ...stateUpdate };
            let newMetaBranch = new ExecutionMeta_1.default({ creature: this, parentJsxKey: this.thisObj['parentJsxKey'] });
            let newRender = this.getBaseMethod('render')(newMetaBranch);
            this._module.applet.onCreatureStateChange(this, newRender);
        };
    }
}
exports.default = Creature;
