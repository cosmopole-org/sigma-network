
import Module from './Module'
import Utils from './utils/index'
import INative from './INative'
import Creature from './Creature'
import BaseElement from './elements/BaseElement'

export class Runnable {

    root: BaseElement
    mount: () => void

    constructor(root: BaseElement, mount: () => void) {
        this.root = root
        this.mount = mount
    }
}

class Applet {

    _key: string
    public get key() { return this._key }

    _genesisCreature: Creature | undefined

    _nativeBuilder: ((mod: Module) => INative) | undefined

    private _modules: { [id: string]: Module }
    public findModule(id: string) { return this._modules[id] }
    public putModule(module: Module) {
        module.setApplet(this)
        this._modules[module.key] = module
    }
    public removeModule(key: string) { delete this._modules[key] }

    middleCode: any
    filledClasses: Array<any>

    public fill(jsxCode: any) {
        this.middleCode = Utils.compiler.parse(jsxCode)
        console.log(Utils.json.prettify(this.middleCode))
        let extracted = Utils.compiler.extractModules(this.middleCode, this)
        extracted.map((ex: any) => ex.module).forEach((module: Module) => this.putModule(module))
        this.filledClasses = extracted.map((ex: any) => ex.code)
    }

    cache = {
        elements: {},
        contexts: {},
        mounts: []
    }

    oldVersions = {}

    onCreatureStateChange(creature: Creature, newVersion: BaseElement) {
        let oldVersion = this.oldVersions[creature._key]
        this.oldVersions[creature._key] = newVersion
        let updates = Utils.json.diff(oldVersion, newVersion)
        let allDeletedKeys = {}
        updates.forEach((u: any) => {
            if (u.__action__ === 'element_deleted') {
                let keys = Object.keys(this.cache.elements).filter(k => {
                    if (k.startsWith(u.__key__)) {
                        allDeletedKeys[k] = this.cache.elements[k]
                        delete this.cache.elements[k]
                        return true
                    } else {
                        return false
                    }
                })
                if (keys.length > 0) {
                    let temp = keys[keys.length - 1].split('-')
                    if (temp.length > 1) {
                        let temp2 = temp.slice(0, temp.length - 1).join('-')
                        allDeletedKeys[temp2] = this.cache.elements[temp2]
                        delete this.cache.elements[temp2]
                    }
                }
            }
        })
        Object.keys(allDeletedKeys).forEach((k: string) => {
            let c = this.cache.elements[k]
            if (c?.module) {
                c.getBaseMethod('onUnmount')(this.cache.contexts[k])
                delete this.cache.contexts[k]
            }
        })
        this.update(oldVersion._key, updates)
    }

    update: (key: string, u: any) => void
    firstMount: boolean = false;
    klasses: { [id: string]: any } = {}

    public runRaw(update: (key: string, u: any) => void) {
        return new Promise(resolve => {
            this.update = update
            this.firstMount = false
            this.cache.elements = {}
            this.cache.mounts = []
            let dummyClassMiddleCode = Utils.compiler.parse('class Main {}')
            let extracted = Utils.compiler.extractModules(dummyClassMiddleCode, this)
            let r = extracted.map((ex: { module: Module, code: any }) => ex.module)
            let genesisMod = r[0]
            this.putModule(genesisMod)
            this._genesisCreature = genesisMod.instantiate()
            let genesisMetaContext = Utils.generator.nestedContext(this._genesisCreature)
            this.filledClasses.map((code: any) => (
                {
                    klass: Utils.executor.executeSingle(code, genesisMetaContext),
                    id: code.id.name
                }
            )).forEach((klassWrapper: { klass: any, id: string }) => {
                this.klasses[klassWrapper.id] = klassWrapper.klass
            });
            let view = Utils.executor.executeBlock(this.middleCode.body, genesisMetaContext)
            resolve(
                new Runnable(
                    view,
                    () => {
                        this.firstMount = true
                        this.cache.mounts.reverse().forEach((onMount: any) => onMount())
                    }
                )
            )
        })
    }

    public buildContext(mod: Module) {
        return { ...this._nativeBuilder(mod), ...this.klasses }
    }

    public setContextBuilder(ctxBuilder: (mod: Module) => INative) {
        this._nativeBuilder = ctxBuilder
    }

    public run(genesis: string, update: (key: string, u: any) => void) {
        return new Promise(resolve => {
            this.update = update
            this.firstMount = false
            this.cache.elements = {}
            this.cache.mounts = []
            let genesisMod = this._modules[genesis]
            this._genesisCreature = genesisMod.instantiate()
            let genesisMetaContext = Utils.generator.nestedContext(this._genesisCreature)
            this._genesisCreature._runtime.stack[0].putUnit('this', this._genesisCreature?.thisObj)
            this.filledClasses.map((code: any) => (
                {
                    klass: Utils.executor.executeSingle(code, genesisMetaContext),
                    id: code.id.name
                }
            )).forEach((klassWrapper: { klass: any, id: string }) => {
                this.klasses[klassWrapper.id] = klassWrapper.klass
            });
            this.cache.mounts.push(() => this._genesisCreature.getBaseMethod('onMount')(genesisMetaContext))
            this._genesisCreature.getBaseMethod('constructor')(genesisMetaContext)
            let view = this._genesisCreature.getBaseMethod('render')(genesisMetaContext)
            this.oldVersions[this._genesisCreature._key] = view
            resolve(
                new Runnable(
                    view,
                    () => {
                        this.firstMount = true
                        this.cache.mounts.reverse().forEach((onMount: any) => onMount())
                    }
                )
            )
        })
    }

    constructor(key: string, modules?: { [id: string]: Module }) {
        this._key = key
        this._modules = modules ? modules : {}
    }
}

export default Applet
