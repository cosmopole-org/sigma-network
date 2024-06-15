
import BaseProp from './BaseProp'

class NumberProp extends BaseProp {

    _value?: number
    public get value() { return this._value }
    public setValue(v: any) { this._value = v}
    public getValue() { return this._value}

    _defaultValue: number
    public get defaultValue() { return this._defaultValue }

    constructor(defaultValue: number) {
        super('number')
        this._value = defaultValue
        this._defaultValue = defaultValue
    }
}

export default NumberProp
