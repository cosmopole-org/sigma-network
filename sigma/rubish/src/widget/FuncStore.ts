import Func from "./Func"
import Creature from "./Creature";

class FuncStore {

    private _store: {[id: string]: Func}
    public get store(): {[id: string]: Func} { return this._store }
    public putFunc(func: Func): void { this._store[func.key] = func }
    public removeFunc(key: string): void { delete this._store[key] }
    public findFunc(key: string): Func { return this._store[key] }

    constructor() {
        this._store = {}
    }
}

export default FuncStore
