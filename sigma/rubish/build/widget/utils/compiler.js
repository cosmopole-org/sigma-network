"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acorn_1 = require("acorn");
const jsx_1 = require("./jsx");
const Module_1 = require("../Module");
const cssProperty_1 = require("./cssProperty");
const hyphenateStyleName_1 = require("./hyphenateStyleName");
let { isUnitlessNumber } = cssProperty_1.default;
let jsxCompiler = acorn_1.Parser.extend((0, jsx_1.default)());
var isArray = Array.isArray;
var keys = Object.keys;
var counter = 1;
// Follows syntax at https://developer.mozilla.org/en-US/docs/Web/CSS/content,
// including multiple space separated values.
var unquotedContentValueRegex = /^(normal|none|(\b(url\([^)]*\)|chapter_counter|attr\([^)]*\)|(no-)?(open|close)-quote|inherit)((\b\s*)|$|\s+))+)$/;
function buildRule(key, value) {
    if (!isUnitlessNumber[key] && typeof value === 'number') {
        value = '' + value + 'px';
    }
    else if (key === 'content' && !unquotedContentValueRegex.test(value)) {
        value = "'" + value.replace(/'/g, "\\'") + "'";
    }
    return (0, hyphenateStyleName_1.default)(key) + ': ' + value + ';  ';
}
function buildValue(key, value) {
    if (!isUnitlessNumber[key] && typeof value === 'number') {
        value = '' + value + 'px';
    }
    else if (key === 'content' && !unquotedContentValueRegex.test(value)) {
        value = "'" + value.replace(/'/g, "\\'") + "'";
    }
    return value + '';
}
function styleToCssString(rules) {
    var result = '';
    if (!rules || keys(rules).length === 0) {
        return result;
    }
    var styleKeys = keys(rules);
    for (var j = 0, l = styleKeys.length; j < l; j++) {
        var styleKey = styleKeys[j];
        var value = rules[styleKey];
        if (isArray(value)) {
            for (var i = 0, len = value.length; i < len; i++) {
                result += buildRule(styleKey, value[i]);
            }
        }
        else {
            result += buildRule(styleKey, value);
        }
    }
    return result;
}
let parse = (jsxCode) => {
    return jsxCompiler.parse(jsxCode, { sourceType: 'module', ecmaVersion: 'latest' });
};
let extractModules = (middleCode, applet) => {
    return middleCode.body
        .filter((declaration) => declaration.type === 'ClassDeclaration')
        .map((declaration) => {
        return { module: new Module_1.default(declaration.id.name, applet, declaration), code: declaration };
    });
};
exports.default = { parse, extractModules, styleToCssString, buildRule, buildValue };
