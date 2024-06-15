
import Creature from './Creature'
import Module from './Module'
import BaseElement from './elements/BaseElement'

class DOM {

    private _module: Module
    public get module() { return this._module }

    private _creature: Creature
    public get creature() { return this._creature }

    private _root?: BaseElement
    public get root() { return this._root }
    public setRoot(root: BaseElement) { this._root = root }

    constructor(module: Module, creature?: Creature, root?: BaseElement) {
        this._module = module
        this._creature = creature
        this._root = root
    }
}

export default DOM
