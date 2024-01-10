
import authenticate from "./authenticate";
import authorize from "./authorize";
import rules from "./rules";

export default class Guardian {
    static _instance: Guardian
    public static get instance() {
        return Guardian._instance
    }
    public static initialize() {
        return new Guardian()
    }
    authenticate = authenticate
    authorize=  authorize
    rules = rules
    constructor() {
        Guardian._instance = this
    }
}
