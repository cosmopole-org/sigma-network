"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseControl_1 = require("./BaseControl");
const StringProp_1 = require("../props/StringProp");
const utils_1 = require("../utils");
const FuncProp_1 = require("../props/FuncProp");
class ButtonControl extends BaseControl_1.default {
    static TYPE = 'button';
    static defaultProps = {
        caption: new StringProp_1.default(''),
        variant: new StringProp_1.default('filled'),
        onClick: new FuncProp_1.default(undefined)
    };
    static defaultStyles = {};
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(ButtonControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
exports.default = ButtonControl;
