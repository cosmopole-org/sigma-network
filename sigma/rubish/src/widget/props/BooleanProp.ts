
import BaseProp from './BaseProp'

class BooleanProp extends BaseProp {

    _value?: boolean
    public get value() { return this._value }
    public setValue(v: any) { this._value = v}
    public getValue() { return this._value}

    _defaultValue: boolean
    public get defaultValue() { return this._defaultValue }

    constructor(defaultValue: boolean) {
        super('boolean')
        this._value = defaultValue
        this._defaultValue = defaultValue
    }
}

export default BooleanProp
