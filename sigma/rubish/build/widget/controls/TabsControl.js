"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseControl_1 = require("./BaseControl");
const utils_1 = require("../utils");
const FuncProp_1 = require("../props/FuncProp");
class TabsControl extends BaseControl_1.default {
    static TYPE = 'tabs';
    static defaultProps = {
        onChange: new FuncProp_1.default(undefined)
    };
    static defaultStyles = {};
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(TabsControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
exports.default = TabsControl;
