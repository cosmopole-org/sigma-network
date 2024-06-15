
import BaseProp from './BaseProp'

class StringProp extends BaseProp {

    _value?: string
    public get value() { return this._value }
    public setValue(v: any) { this._value = v}
    public getValue() { return this._value}

    _defaultValue: string
    public get defaultValue() { return this._defaultValue }

    constructor(defaultValue: string) {
        super('string')
        this._value = defaultValue
        this._defaultValue = defaultValue
    }
}

export default StringProp
