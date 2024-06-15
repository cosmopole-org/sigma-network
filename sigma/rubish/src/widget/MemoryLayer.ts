import Func from "./Func";

class MemoryLayer {

    private _units: {[id: string]: any}
    public get units(): {[id: string]: Func} { return this._units }
    public findUnit(key: string): any { return this._units[key] }
    public putUnit(key: string, unit: any): void { this._units[key] = unit }
    public removeUnit(key: string): void { delete this._units[key] }

    constructor(initialUnits?: {[id: string]: Func}) {
        this._units = initialUnits ? initialUnits : {}
    }
}

export default MemoryLayer
