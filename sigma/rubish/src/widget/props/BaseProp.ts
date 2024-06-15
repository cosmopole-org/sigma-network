
abstract class BaseProp {

    _type: string
    public get type() { return this._type }

    public abstract setValue(value: any): void
    public abstract getValue(): any

    constructor(type: string) {
        this._type = type
    }
}

export default BaseProp
