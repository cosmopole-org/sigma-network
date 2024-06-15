
import BaseProp from './BaseProp'

class FuncProp extends BaseProp {

    _value?: () => void
    public get value() { return this._value }
    public setValue(v: any) { this._value = v}
    public getValue() { return this._value}

    _defaultValue?: () => void
    public get defaultValue() { return this._defaultValue }

    constructor(defaultValue?: () => void) {
        super('function')
        this._value = defaultValue
        this._defaultValue = defaultValue
    }
}

export default FuncProp
