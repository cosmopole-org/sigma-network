/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 836:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Nb: () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_1__.Nb),
/* harmony export */   _3: () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_1__._3),
/* harmony export */   hZ: () => (/* reexport safe */ _index_bg_js__WEBPACK_IMPORTED_MODULE_1__.hZ)
/* harmony export */ });
/* harmony import */ var _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(352);
/* harmony import */ var _index_bg_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__]);
_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


(0,_index_bg_js__WEBPACK_IMPORTED_MODULE_1__/* .__wbg_set_wasm */ .lI)(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__);


_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_start();

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 0:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $Z: () => (/* binding */ __wbg_new_63b92bc8671ed464),
/* harmony export */   BZ: () => (/* binding */ __wbindgen_object_clone_ref),
/* harmony export */   D1: () => (/* binding */ __wbg_versions_f686565e586dd935),
/* harmony export */   Fm: () => (/* binding */ __wbg_buffer_12d079cc21e14bdb),
/* harmony export */   Gu: () => (/* binding */ __wbindgen_is_string),
/* harmony export */   KY: () => (/* binding */ __wbg_getTimezoneOffset_38257122e236c190),
/* harmony export */   Kc: () => (/* binding */ __wbg_globalThis_d1e6af4856ba331b),
/* harmony export */   L4: () => (/* binding */ __wbg_now_abd80e969af37148),
/* harmony export */   Lo: () => (/* binding */ __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb),
/* harmony export */   NL: () => (/* binding */ __wbg_node_104a2ff8d6ea03a2),
/* harmony export */   Nb: () => (/* binding */ register_messaging),
/* harmony export */   PR: () => (/* binding */ __wbindgen_is_function),
/* harmony export */   Pf: () => (/* binding */ __wbg_newnoargs_e258087cd0daa0ea),
/* harmony export */   Py: () => (/* binding */ __wbindgen_memory),
/* harmony export */   QR: () => (/* binding */ __wbindgen_number_new),
/* harmony export */   Qn: () => (/* binding */ __wbindgen_throw),
/* harmony export */   V5: () => (/* binding */ __wbg_new_abda76e883ba8a5f),
/* harmony export */   VF: () => (/* binding */ __wbg_getRandomValues_3aa56aa6edec874c),
/* harmony export */   Wv: () => (/* binding */ __wbg_set_a47bac70306a19a7),
/* harmony export */   Xu: () => (/* binding */ __wbg_error_f851667af71bcfc6),
/* harmony export */   Ym: () => (/* binding */ __wbg_getTime_2bc4375165f02d15),
/* harmony export */   _3: () => (/* binding */ evaluate),
/* harmony export */   _m: () => (/* binding */ __wbg_call_b3ca7c6051f9bec1),
/* harmony export */   bk: () => (/* binding */ __wbindgen_object_drop_ref),
/* harmony export */   c7: () => (/* binding */ __wbg_performance_a1b8bde2ee512264),
/* harmony export */   cA: () => (/* binding */ __wbg_process_4a72847cc503995b),
/* harmony export */   cX: () => (/* binding */ __wbg_self_ce0dbfc45cf2f5be),
/* harmony export */   cl: () => (/* binding */ __wbg_msCrypto_eb05e62b530a1508),
/* harmony export */   cq: () => (/* binding */ __wbg_call_27c0f87801dedf93),
/* harmony export */   hW: () => (/* binding */ __wbg_randomFillSync_5c9c955aa56b6049),
/* harmony export */   hZ: () => (/* binding */ trigger),
/* harmony export */   h_: () => (/* binding */ __wbg_crypto_1d1f22824a6a080c),
/* harmony export */   "if": () => (/* binding */ __wbg_subarray_a1f73cd4b5b42fe1),
/* harmony export */   kh: () => (/* binding */ __wbg_window_c6fb939a7f436783),
/* harmony export */   lI: () => (/* binding */ __wbg_set_wasm),
/* harmony export */   qD: () => (/* binding */ __wbg_new_cf3ec55744a78578),
/* harmony export */   qv: () => (/* binding */ __wbindgen_is_object),
/* harmony export */   r3: () => (/* binding */ __wbg_new0_7d84e5b2cd9fdc73),
/* harmony export */   s: () => (/* binding */ __wbg_require_cca90b1a94a0255b),
/* harmony export */   u$: () => (/* binding */ __wbg_stack_658279fe44541cf6),
/* harmony export */   v6: () => (/* binding */ __wbg_newwithlength_e9b4878cebadb3d3),
/* harmony export */   vA: () => (/* binding */ __wbg_global_207b558942527489),
/* harmony export */   vU: () => (/* binding */ __wbindgen_is_undefined),
/* harmony export */   yc: () => (/* binding */ __wbindgen_string_new)
/* harmony export */ });
/* unused harmony export main */
/* module decorator */ module = __webpack_require__.hmd(module);
let wasm;
function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}
/**
*/
function main() {
    wasm.main();
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* Register the host messaging.
*
* # Errors
*
* If the execution of the registering throws, returns a `JsValue` with the error string.
* @param {Function} f
*/
function register_messaging(f) {
    try {
        wasm.register_messaging(addBorrowedObject(f));
    } finally {
        heap[stack_pointer++] = undefined;
    }
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* Evaluate the given ECMAScript code.
*
* # Errors
*
* If the execution of the script throws, returns a `JsValue` with the error string.
* @param {string} src
* @returns {string}
*/
function evaluate(src) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(src, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.evaluate(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_2(deferred3_0, deferred3_1, 1);
    }
}

/**
* Evaluate the given ECMAScript code.
*
* # Errors
*
* If the execution of the script throws, returns a `JsValue` with the error string.
* @param {string} callback_id
* @returns {string}
*/
function trigger(callback_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(callback_id, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        wasm.trigger(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export_2(deferred3_0, deferred3_1, 1);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_3(addHeapObject(e));
    }
}

function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_export_2(deferred0_0, deferred0_1, 1);
    }
};

function __wbg_getRandomValues_3aa56aa6edec874c() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

function __wbg_randomFillSync_5c9c955aa56b6049() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

function __wbg_crypto_1d1f22824a6a080c(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

function __wbg_process_4a72847cc503995b(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

function __wbg_versions_f686565e586dd935(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

function __wbg_node_104a2ff8d6ea03a2(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

function __wbg_require_cca90b1a94a0255b() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

function __wbg_msCrypto_eb05e62b530a1508(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

function __wbg_performance_a1b8bde2ee512264(arg0) {
    const ret = getObject(arg0).performance;
    return addHeapObject(ret);
};

function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

function __wbg_now_abd80e969af37148(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

function __wbg_newnoargs_e258087cd0daa0ea(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

function __wbg_call_27c0f87801dedf93() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

function __wbg_call_b3ca7c6051f9bec1() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

function __wbg_getTime_2bc4375165f02d15(arg0) {
    const ret = getObject(arg0).getTime();
    return ret;
};

function __wbg_getTimezoneOffset_38257122e236c190(arg0) {
    const ret = getObject(arg0).getTimezoneOffset();
    return ret;
};

function __wbg_new_cf3ec55744a78578(arg0) {
    const ret = new Date(getObject(arg0));
    return addHeapObject(ret);
};

function __wbg_new0_7d84e5b2cd9fdc73() {
    const ret = new Date();
    return addHeapObject(ret);
};

function __wbg_buffer_12d079cc21e14bdb(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

function __wbg_self_ce0dbfc45cf2f5be() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

function __wbg_window_c6fb939a7f436783() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

function __wbg_globalThis_d1e6af4856ba331b() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

function __wbg_global_207b558942527489() { return handleError(function () {
    const ret = __webpack_require__.g.global;
    return addHeapObject(ret);
}, arguments) };

function __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

function __wbg_new_63b92bc8671ed464(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

function __wbg_set_a47bac70306a19a7(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

function __wbg_newwithlength_e9b4878cebadb3d3(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

function __wbg_subarray_a1f73cd4b5b42fe1(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};



/***/ }),

/***/ 237:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var _engine_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(836);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_engine_index_js__WEBPACK_IMPORTED_MODULE_0__]);
_engine_index_js__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



const render = (element) => {
  if (typeof element != "object") {
    return document.createTextNode(element.toString());
  }
  let rendered = document.createElement(element.tag);
  rendered.setAttribute("id", element.key);
  Object.entries(element.props).forEach(([name, value]) => {
    rendered.setAttribute(name, value);
  })
  Object.entries(element.events).forEach(([name, value]) => {
    if (("on" + name.toLowerCase()) in window) {
      rendered.addEventListener(
        name.toLowerCase(),
        () => {
          (0,_engine_index_js__WEBPACK_IMPORTED_MODULE_0__/* .trigger */ .hZ)(value)
        }
      );
    }
  })
  element.children.forEach(child => {
    rendered.appendChild(render(child));
  })
  return rendered;
}

let root = document.getElementById("root");

(async () => {
  (0,_engine_index_js__WEBPACK_IMPORTED_MODULE_0__/* .register_messaging */ .Nb)(msgStr => {
    let msg = JSON.parse(msgStr);
    switch (msg.action) {
      case "setTimeout": {
        setTimeout(() => (0,_engine_index_js__WEBPACK_IMPORTED_MODULE_0__/* .trigger */ .hZ)(msg.callbackId), msg.time);
        break;
      }
      case "init": {
        console.log(msg);
        root.appendChild(render(msg.element));
        break;
      }
      case "update": {
        console.log(msg);
        let rendered = render(msg.element);
        let old = document.getElementById(msg.element.key);
        console.log(old, rendered);
        old.replaceWith(rendered);
        break;
      }
      case "log": {
        console.log(msg);
        break;
      }
    }
  });
  (0,_engine_index_js__WEBPACK_IMPORTED_MODULE_0__/* .evaluate */ ._3)(await (await fetch("/assets/build.js.txt")).text());
})();

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 352:
/***/ ((module, exports, __webpack_require__) => {

/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(0);
module.exports = __webpack_require__.v(exports, module.id, "06a3b4f666b437e96ed6", {
	"./index_bg.js": {
		"__wbindgen_string_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_string_new */ .yc,
		"__wbindgen_object_drop_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_drop_ref */ .bk,
		"__wbindgen_object_clone_ref": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_object_clone_ref */ .BZ,
		"__wbg_new_abda76e883ba8a5f": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_abda76e883ba8a5f */ .V5,
		"__wbg_stack_658279fe44541cf6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_stack_658279fe44541cf6 */ .u$,
		"__wbg_error_f851667af71bcfc6": WEBPACK_IMPORTED_MODULE_0/* .__wbg_error_f851667af71bcfc6 */ .Xu,
		"__wbg_getRandomValues_3aa56aa6edec874c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getRandomValues_3aa56aa6edec874c */ .VF,
		"__wbg_randomFillSync_5c9c955aa56b6049": WEBPACK_IMPORTED_MODULE_0/* .__wbg_randomFillSync_5c9c955aa56b6049 */ .hW,
		"__wbg_crypto_1d1f22824a6a080c": WEBPACK_IMPORTED_MODULE_0/* .__wbg_crypto_1d1f22824a6a080c */ .h_,
		"__wbindgen_is_object": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_object */ .qv,
		"__wbg_process_4a72847cc503995b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_process_4a72847cc503995b */ .cA,
		"__wbg_versions_f686565e586dd935": WEBPACK_IMPORTED_MODULE_0/* .__wbg_versions_f686565e586dd935 */ .D1,
		"__wbg_node_104a2ff8d6ea03a2": WEBPACK_IMPORTED_MODULE_0/* .__wbg_node_104a2ff8d6ea03a2 */ .NL,
		"__wbindgen_is_string": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_string */ .Gu,
		"__wbg_require_cca90b1a94a0255b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_require_cca90b1a94a0255b */ .s,
		"__wbindgen_is_function": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_function */ .PR,
		"__wbg_msCrypto_eb05e62b530a1508": WEBPACK_IMPORTED_MODULE_0/* .__wbg_msCrypto_eb05e62b530a1508 */ .cl,
		"__wbg_performance_a1b8bde2ee512264": WEBPACK_IMPORTED_MODULE_0/* .__wbg_performance_a1b8bde2ee512264 */ .c7,
		"__wbindgen_is_undefined": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_is_undefined */ .vU,
		"__wbg_now_abd80e969af37148": WEBPACK_IMPORTED_MODULE_0/* .__wbg_now_abd80e969af37148 */ .L4,
		"__wbindgen_number_new": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_number_new */ .QR,
		"__wbg_newnoargs_e258087cd0daa0ea": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newnoargs_e258087cd0daa0ea */ .Pf,
		"__wbg_call_27c0f87801dedf93": WEBPACK_IMPORTED_MODULE_0/* .__wbg_call_27c0f87801dedf93 */ .cq,
		"__wbg_call_b3ca7c6051f9bec1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_call_b3ca7c6051f9bec1 */ ._m,
		"__wbg_getTime_2bc4375165f02d15": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getTime_2bc4375165f02d15 */ .Ym,
		"__wbg_getTimezoneOffset_38257122e236c190": WEBPACK_IMPORTED_MODULE_0/* .__wbg_getTimezoneOffset_38257122e236c190 */ .KY,
		"__wbg_new_cf3ec55744a78578": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_cf3ec55744a78578 */ .qD,
		"__wbg_new0_7d84e5b2cd9fdc73": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new0_7d84e5b2cd9fdc73 */ .r3,
		"__wbg_buffer_12d079cc21e14bdb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_buffer_12d079cc21e14bdb */ .Fm,
		"__wbg_self_ce0dbfc45cf2f5be": WEBPACK_IMPORTED_MODULE_0/* .__wbg_self_ce0dbfc45cf2f5be */ .cX,
		"__wbg_window_c6fb939a7f436783": WEBPACK_IMPORTED_MODULE_0/* .__wbg_window_c6fb939a7f436783 */ .kh,
		"__wbg_globalThis_d1e6af4856ba331b": WEBPACK_IMPORTED_MODULE_0/* .__wbg_globalThis_d1e6af4856ba331b */ .Kc,
		"__wbg_global_207b558942527489": WEBPACK_IMPORTED_MODULE_0/* .__wbg_global_207b558942527489 */ .vA,
		"__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb */ .Lo,
		"__wbg_new_63b92bc8671ed464": WEBPACK_IMPORTED_MODULE_0/* .__wbg_new_63b92bc8671ed464 */ .$Z,
		"__wbg_set_a47bac70306a19a7": WEBPACK_IMPORTED_MODULE_0/* .__wbg_set_a47bac70306a19a7 */ .Wv,
		"__wbg_newwithlength_e9b4878cebadb3d3": WEBPACK_IMPORTED_MODULE_0/* .__wbg_newwithlength_e9b4878cebadb3d3 */ .v6,
		"__wbg_subarray_a1f73cd4b5b42fe1": WEBPACK_IMPORTED_MODULE_0/* .__wbg_subarray_a1f73cd4b5b42fe1 */ ["if"],
		"__wbindgen_throw": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_throw */ .Qn,
		"__wbindgen_memory": WEBPACK_IMPORTED_MODULE_0/* .__wbindgen_memory */ .Py
	}
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			body((deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/wasm loading */
/******/ 	(() => {
/******/ 		__webpack_require__.v = (exports, wasmModuleId, wasmModuleHash, importsObj) => {
/******/ 			var req = fetch(__webpack_require__.p + "" + wasmModuleHash + ".module.wasm");
/******/ 			var fallback = () => (req
/******/ 				.then((x) => (x.arrayBuffer()))
/******/ 				.then((bytes) => (WebAssembly.instantiate(bytes, importsObj)))
/******/ 				.then((res) => (Object.assign(exports, res.instance.exports))));
/******/ 			return req.then((res) => {
/******/ 				if (typeof WebAssembly.instantiateStreaming === "function") {
/******/ 					return WebAssembly.instantiateStreaming(res, importsObj)
/******/ 						.then(
/******/ 							(res) => (Object.assign(exports, res.instance.exports)),
/******/ 							(e) => {
/******/ 								if(res.headers.get("Content-Type") !== "application/wasm") {
/******/ 									console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
/******/ 									return fallback();
/******/ 								}
/******/ 								throw e;
/******/ 							}
/******/ 						);
/******/ 				}
/******/ 				return fallback();
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(237);
/******/ 	
/******/ })()
;