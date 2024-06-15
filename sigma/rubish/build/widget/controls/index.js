"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BoxControl_1 = require("./BoxControl");
const ButtonControl_1 = require("./ButtonControl");
const CardControl_1 = require("./CardControl");
const TabsControl_1 = require("./TabsControl");
const PrimaryTabControl_1 = require("./PrimaryTabControl");
const TextControl_1 = require("./TextControl");
const HtmlControl_1 = require("./HtmlControl");
const BodyControl_1 = require("./BodyControl");
const ScriptControl_1 = require("./ScriptControl");
const ImageControl_1 = require("./ImageControl");
const FrameControl_1 = require("./FrameControl");
exports.default = {
    [TextControl_1.default.TYPE]: TextControl_1.default,
    [ButtonControl_1.default.TYPE]: ButtonControl_1.default,
    [BoxControl_1.default.TYPE]: BoxControl_1.default,
    [CardControl_1.default.TYPE]: CardControl_1.default,
    [TabsControl_1.default.TYPE]: TabsControl_1.default,
    [PrimaryTabControl_1.default.TYPE]: PrimaryTabControl_1.default,
    [HtmlControl_1.default.TYPE]: HtmlControl_1.default,
    [BodyControl_1.default.TYPE]: BodyControl_1.default,
    [ScriptControl_1.default.TYPE]: ScriptControl_1.default,
    [ImageControl_1.default.TYPE]: ImageControl_1.default,
    [FrameControl_1.default.TYPE]: FrameControl_1.default
};
