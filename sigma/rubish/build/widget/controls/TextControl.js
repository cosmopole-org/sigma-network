"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseControl_1 = require("./BaseControl");
const StringProp_1 = require("../props/StringProp");
const utils_1 = require("../utils");
class TextControl extends BaseControl_1.default {
    static TYPE = 'text';
    static defaultProps = {
        text: new StringProp_1.default('')
    };
    static defaultStyles = {};
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(TextControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
exports.default = TextControl;
