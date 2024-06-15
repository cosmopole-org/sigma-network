"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseControl_1 = require("./BaseControl");
const utils_1 = require("../utils");
class ScriptControl extends BaseControl_1.default {
    static TYPE = 'script';
    static defaultProps = {};
    static defaultStyles = {};
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(ScriptControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
exports.default = ScriptControl;
