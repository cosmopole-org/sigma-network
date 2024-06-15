import Creature from './Creature'
import INative from './INative'
import MemoryLayer from './MemoryLayer'
import Memory from './MemoryLayer'
import Module from './Module'
import Utils from './utils'
import Func from "./Func";

class Runtime {

    private _module: Module
    public get module(): Module { return this._module }

    private _creature: Creature
    public get creature(): Creature { return this._creature }

    private _native: INative
    public get native(): INative { return this._native }

    public stack: Array<Memory> = []
    public pushOnStack(initialUnits?: {[id: string]: any}) { this.stack.push(new MemoryLayer(initialUnits)) }
    public popFromStack(): void { this.stack.pop() }
    public get stackTop(): Memory { return this.stack[this.stack.length - 1] }
    public resetStack(): void {
        this.stack = []
        this.pushOnStack({ ...this._native })
    }

    public reset(): void {
        this.resetStack()
    }

    public execute(ast: any): void {
        Utils.executor.executeBlock(ast, new Utils.executor.ExecutionMeta({ creature: this._creature }))
    }

    public load(): void {
        this.execute(this.module.ast.body.body)
    }

    public clone(): Runtime {
        return new Runtime(this.module, this.creature, {native: this.native, stack: new Array(...this.stack)})
    }

    constructor(mod: Module, creature: Creature, reusableTools?: any) {
        this._module = mod
        this._creature = creature
        this._native = reusableTools?.native ? reusableTools.native : this._module.applet.buildContext(this._module)
        if (reusableTools?.stack) {
            this.stack = reusableTools.stack
        } else {
            this.reset()
        }
    }
}


export default Runtime
