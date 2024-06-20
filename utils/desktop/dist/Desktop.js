"use strict";
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toESM = function(mod, isNodeMode, target) {
    return target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(// If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod);
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/Desktop.tsx
var Desktop_exports = {};
__export(Desktop_exports, {
    default: function() {
        return Desktop_default;
    }
});
module.exports = __toCommonJS(Desktop_exports);
var RGL = __toESM(require("react-grid-layout"));
var import_styles = require("react-grid-layout/css/styles.css");
// src/AppletHost.tsx
var import_applet_mwc = __toESM(require("applet-mwc"));
var import_react = require("react");
var import_applet_vm = require("applet-vm");
var import_jsx_runtime = require("react/jsx-runtime");
var hostLoaded = {};
var unloadAllHosts = function() {
    hostLoaded = {};
};
var Host = function(props) {
    var hostContainerrId = "AppletHost:".concat(props.appletKey);
    var appletRef = (0, import_react.useRef)(new import_applet_vm.Applet(props.appletKey));
    var rootRef = (0, import_react.useRef)(null);
    (0, import_react.useEffect)(function() {
        hostLoaded[props.appletKey] = true;
        appletRef.current.fill(props.code);
        var root = document.getElementById(hostContainerrId);
        if (root !== null) {
            var driver = new import_applet_mwc.default(appletRef.current, root);
            driver.start("Test", import_applet_vm.Controls);
        }
        setTimeout(function() {
            if (rootRef.current !== null) {
                var root2 = rootRef.current;
                root2.style.transform = "scale(1, 1)";
                root2.style.opacity = "1";
            }
        }, (props.index + 1) * 75);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        ref: rootRef,
        id: hostContainerrId,
        style: {
            width: "100%",
            height: "100%",
            overflow: "hidden",
            transform: "scale(0.65, 0.65)",
            opacity: 0,
            transition: "transform .35s"
        }
    });
};
var AppletHost_default = {
    Host: Host,
    unloadAllHosts: unloadAllHosts
};
// src/Desktop.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var ResponsiveReactGridLayout = RGL.WidthProvider(RGL.Responsive);
var desktops = {};
var DesktopData = /*#__PURE__*/ function() {
    function DesktopData() {
        _class_call_check(this, DesktopData);
        this.layouts = {
            lg: [],
            md: [],
            sm: [],
            xs: [],
            xxs: []
        };
        this.jsxContent = {};
        this.key = Math.random().toString();
        desktops[this.key] = this;
    }
    _create_class(DesktopData, [
        {
            key: "fill",
            value: function fill(layouts, jsxContent) {
                this.jsxContent = jsxContent;
                this.layouts = layouts;
            }
        },
        {
            key: "destroy",
            value: function destroy() {
                delete desktops[this.key];
            }
        },
        {
            key: "addWidget",
            value: function addWidget(widget) {
                var _this = this;
                [
                    "lg",
                    "md",
                    "sm",
                    "xs",
                    "xxs"
                ].forEach(function(sizeKey) {
                    var _Math;
                    var y = _this.layouts[sizeKey].length > 0 ? (_Math = Math).max.apply(_Math, _to_consumable_array(_this.layouts[sizeKey].filter(function(item) {
                        return item.x < widget.gridData.w;
                    }).map(function(item) {
                        return item.y + item.h;
                    }))) : 0;
                    _this.layouts[sizeKey].push(_object_spread_props(_object_spread({}, widget.gridData), {
                        x: 0,
                        y: y,
                        i: widget.id
                    }));
                });
                this.jsxContent[widget.id] = widget.jsxCode;
                this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts);
                this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts);
            }
        },
        {
            key: "removeWidget",
            value: function removeWidget(id) {
                var _this = this;
                delete this.jsxContent[id];
                [
                    "lg",
                    "md",
                    "sm",
                    "xs",
                    "xxs"
                ].forEach(function(sizeKey) {
                    _this.layouts[sizeKey] = _this.layouts[sizeKey].filter(function(w) {
                        return w.i !== id;
                    });
                });
                this.layoutCnangeFromCodeCallback && this.layoutCnangeFromCodeCallback(this.layouts);
                this.layoutCnangeFromCodeInternallCallback && this.layoutCnangeFromCodeInternallCallback(this.layouts);
            }
        },
        {
            key: "onLayoutChangeByUI",
            value: function onLayoutChangeByUI(callback) {
                this.layoutCnangeFromUICallback = callback;
            }
        },
        {
            key: "onLayoutChangeByCode",
            value: function onLayoutChangeByCode(callback) {
                this.layoutCnangeFromCodeCallback = callback;
            }
        },
        {
            key: "onLayoutChangeByCodeInternally",
            value: function onLayoutChangeByCodeInternally(callback) {
                this.layoutCnangeFromCodeInternallCallback = callback;
            }
        },
        {
            key: "updateLayoutsInternally",
            value: function updateLayoutsInternally(layouts, updates) {
                this.layouts = layouts;
                this.layoutCnangeFromUICallback && this.layoutCnangeFromUICallback(layouts, updates);
            }
        }
    ]);
    return DesktopData;
}();
var Host2 = function(props) {
    var _ref = _sliced_to_array((0, import_react2.useState)(false), 2), trigger = _ref[0], setTrigger = _ref[1];
    var desktop = desktops[props.desktopKey];
    desktop.onLayoutChangeByCodeInternally(function(_) {
        return setTrigger(!trigger);
    });
    console.log(desktop.layouts);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ResponsiveReactGridLayout, {
        className: "layout",
        style: {
            minWidth: "100%"
        },
        measureBeforeMount: true,
        useCSSTransforms: false,
        breakpoints: {
            lg: 1200,
            md: 996,
            sm: 768,
            xs: 480,
            xxs: 0
        },
        cols: {
            lg: 12,
            md: 10,
            sm: 6,
            xs: 4,
            xxs: 2
        },
        rowHeight: 30,
        width: props.style.width,
        layouts: structuredClone(desktop.layouts),
        isDraggable: props.editMode,
        isResizable: props.editMode,
        onLayoutChange: function(currentLayout, layouts) {
            var _loop = function(sizeKey) {
                var dict = {};
                for(var i = 0; i < oldLayouts[sizeKey].length; i++){
                    var item = oldLayouts[sizeKey][i];
                    dict[item.i] = item;
                }
                clonedLayouts[sizeKey].forEach(function(item) {
                    var oldItem = dict[item.i];
                    if (oldItem) {
                        if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
                            updates.push({
                                sizeKey: sizeKey,
                                item: item,
                                __action__: "updated"
                            });
                        }
                    } else {
                        updates.push({
                            sizeKey: sizeKey,
                            item: item,
                            __action__: "created"
                        });
                    }
                });
            };
            var updates = [];
            var oldLayouts = desktop.layouts;
            var clonedLayouts = structuredClone(layouts);
            for(var sizeKey in oldLayouts)_loop(sizeKey);
            desktop.updateLayoutsInternally(clonedLayouts, updates);
        },
        children: desktop.layouts["lg"].map(function(item) {
            return item.i;
        }).map(function(key, index) {
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", {
                style: {
                    overflow: "hidden",
                    borderRadius: 4
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AppletHost_default.Host, {
                    appletKey: key,
                    code: desktop.jsxContent[key],
                    index: index
                })
            }, key);
        })
    });
};
var Desktop_default = {
    Host: Host2,
    DesktopData: DesktopData
};
//# sourceMappingURL=Desktop.js.map