
import Applet from "./Applet"
import Creature from "./Creature"
import CreatureStore from "./CreatureStore"
import DOM from "./DOM"
import FuncStore from "./FuncStore"
import Runtime from "./Runtime"
import BaseElement from "./elements/BaseElement"
import Utils from './utils'

class Module {

    private _applet: Applet
    public get applet() { return this._applet }
    public setApplet(applet: Applet) { this._applet = applet }

    private _creatures: CreatureStore
    public get creatures() { return this._creatures }

    private _key: string
    get key() { return this._key }

    private _funcs: FuncStore
    public get funcs() { return this._funcs }

    private _dom: DOM
    public get dom() { return this._dom }

    private _ast?: any
    public get ast() { return this._ast }
    public setAst(ast: any) { this._ast = ast }

    public instantiate(props?: { [id: string]: any }, styles?: { [id: string]: any }, children?: Array<BaseElement>, thisObj?: any) {
        let creature = new Creature(
            this,
            {
                cosmoId: props?.key,
                thisObj: thisObj ?
                    {
                        ...thisObj,
                        props: props ? props : {},
                        styles: styles ? styles : {},
                        children: children ? children : []
                    } : {
                        props: props ? props : {},
                        styles: styles ? styles : {},
                        children: children ? children : []
                    }
            }
        )
        this._creatures.putCreature(creature)
        return creature
    }

    constructor(key: string, applet: Applet, ast?: any) {
        this._key = key
        this._applet = applet
        this._ast = ast
        this._creatures = new CreatureStore()
        this._funcs = new FuncStore()
        this._dom = new DOM(this)
    }
}

export default Module
