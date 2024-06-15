"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Applet_1 = require("./widget/Applet");
const utils_1 = require("./widget/utils");
const controls_1 = require("./widget/controls");
const native_1 = require("./native");
function run(name, entry, code) {
    let applet = new Applet_1.default(name);
    applet.fill(code);
    applet.setContextBuilder((mod) => ({ ...globalThis, ...new native_1.default(globalThis, mod, controls_1.default) }));
    applet.run(entry, (key, u) => {
        globalThis.output(key, u);
    }).then((runnable) => {
        globalThis.output(utils_1.default.json.prettify(runnable.root));
        runnable.mount();
    });
}
exports.default = run;
