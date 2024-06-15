"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Func {
    _key;
    get key() { return this._key; }
    _code;
    get code() { return this._code; }
    setCode(code) { this._code = code; }
    _ast;
    get ast() { return this._ast; }
    setAst(ast) { this._ast = ast; }
    constructor(code, ast) {
        this._key = utils_1.default.generator.generateKey();
        this._code = code;
        this._ast = ast;
    }
}
exports.default = Func;
