"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseControl_1 = require("./BaseControl");
const utils_1 = require("../utils");
class CardControl extends BaseControl_1.default {
    static TYPE = 'card';
    static defaultProps = {};
    static defaultStyles = {
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
        backgroundColor: '#fff',
        borderRadius: 4
    };
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(CardControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
exports.default = CardControl;
