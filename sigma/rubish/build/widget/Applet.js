"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runnable = void 0;
const index_1 = require("./utils/index");
class Runnable {
    root;
    mount;
    constructor(root, mount) {
        this.root = root;
        this.mount = mount;
    }
}
exports.Runnable = Runnable;
class Applet {
    _key;
    get key() { return this._key; }
    _genesisCreature;
    _nativeBuilder;
    _modules;
    findModule(id) { return this._modules[id]; }
    putModule(module) {
        module.setApplet(this);
        this._modules[module.key] = module;
    }
    removeModule(key) { delete this._modules[key]; }
    middleCode;
    filledClasses;
    fill(jsxCode) {
        this.middleCode = index_1.default.compiler.parse(jsxCode);
        console.log(index_1.default.json.prettify(this.middleCode));
        let extracted = index_1.default.compiler.extractModules(this.middleCode, this);
        extracted.map((ex) => ex.module).forEach((module) => this.putModule(module));
        this.filledClasses = extracted.map((ex) => ex.code);
    }
    cache = {
        elements: {},
        contexts: {},
        mounts: []
    };
    oldVersions = {};
    onCreatureStateChange(creature, newVersion) {
        let oldVersion = this.oldVersions[creature._key];
        this.oldVersions[creature._key] = newVersion;
        let updates = index_1.default.json.diff(oldVersion, newVersion);
        let allDeletedKeys = {};
        updates.forEach((u) => {
            if (u.__action__ === 'element_deleted') {
                let keys = Object.keys(this.cache.elements).filter(k => {
                    if (k.startsWith(u.__key__)) {
                        allDeletedKeys[k] = this.cache.elements[k];
                        delete this.cache.elements[k];
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (keys.length > 0) {
                    let temp = keys[keys.length - 1].split('-');
                    if (temp.length > 1) {
                        let temp2 = temp.slice(0, temp.length - 1).join('-');
                        allDeletedKeys[temp2] = this.cache.elements[temp2];
                        delete this.cache.elements[temp2];
                    }
                }
            }
        });
        Object.keys(allDeletedKeys).forEach((k) => {
            let c = this.cache.elements[k];
            if (c?.module) {
                c.getBaseMethod('onUnmount')(this.cache.contexts[k]);
                delete this.cache.contexts[k];
            }
        });
        this.update(oldVersion._key, updates);
    }
    update;
    firstMount = false;
    klasses = {};
    runRaw(update) {
        return new Promise(resolve => {
            this.update = update;
            this.firstMount = false;
            this.cache.elements = {};
            this.cache.mounts = [];
            let dummyClassMiddleCode = index_1.default.compiler.parse('class Main {}');
            let extracted = index_1.default.compiler.extractModules(dummyClassMiddleCode, this);
            let r = extracted.map((ex) => ex.module);
            let genesisMod = r[0];
            this.putModule(genesisMod);
            this._genesisCreature = genesisMod.instantiate();
            let genesisMetaContext = index_1.default.generator.nestedContext(this._genesisCreature);
            this.filledClasses.map((code) => ({
                klass: index_1.default.executor.executeSingle(code, genesisMetaContext),
                id: code.id.name
            })).forEach((klassWrapper) => {
                this.klasses[klassWrapper.id] = klassWrapper.klass;
            });
            let view = index_1.default.executor.executeBlock(this.middleCode.body, genesisMetaContext);
            resolve(new Runnable(view, () => {
                this.firstMount = true;
                this.cache.mounts.reverse().forEach((onMount) => onMount());
            }));
        });
    }
    buildContext(mod) {
        return { ...this._nativeBuilder(mod), ...this.klasses };
    }
    setContextBuilder(ctxBuilder) {
        this._nativeBuilder = ctxBuilder;
    }
    run(genesis, update) {
        return new Promise(resolve => {
            this.update = update;
            this.firstMount = false;
            this.cache.elements = {};
            this.cache.mounts = [];
            let genesisMod = this._modules[genesis];
            this._genesisCreature = genesisMod.instantiate();
            let genesisMetaContext = index_1.default.generator.nestedContext(this._genesisCreature);
            this._genesisCreature._runtime.stack[0].putUnit('this', this._genesisCreature?.thisObj);
            this.filledClasses.map((code) => ({
                klass: index_1.default.executor.executeSingle(code, genesisMetaContext),
                id: code.id.name
            })).forEach((klassWrapper) => {
                this.klasses[klassWrapper.id] = klassWrapper.klass;
            });
            this.cache.mounts.push(() => this._genesisCreature.getBaseMethod('onMount')(genesisMetaContext));
            this._genesisCreature.getBaseMethod('constructor')(genesisMetaContext);
            let view = this._genesisCreature.getBaseMethod('render')(genesisMetaContext);
            this.oldVersions[this._genesisCreature._key] = view;
            resolve(new Runnable(view, () => {
                this.firstMount = true;
                this.cache.mounts.reverse().forEach((onMount) => onMount());
            }));
        });
    }
    constructor(key, modules) {
        this._key = key;
        this._modules = modules ? modules : {};
    }
}
exports.default = Applet;
