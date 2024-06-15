
import Utils from './utils'

class Func {

    private _key: string
    public get key(): string { return this._key }

    private _code: string
    public get code(): string { return this._code }
    public setCode(code: string): void { this._code = code }

    private _ast: any
    public get ast(): any { return this._ast }
    public setAst(ast: any): void { this._ast = ast }

    constructor(code: string, ast?: any) {
        this._key = Utils.generator.generateKey()
        this._code = code
        this._ast = ast
    }
}

export default Func
