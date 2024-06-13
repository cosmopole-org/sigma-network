'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const env = {
    SERVER_ADDRESS: "http://localhost:9010",
};

class Network {
    safelyRequest(layer, path, method, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (method === 'GET') {
                    const myHeaders = new Headers();
                    myHeaders.append("layer", layer.toString());
                    let params = Object.keys(body);
                    if (params.length > 0) {
                        path += "?";
                        params.forEach(key => {
                            if (path[path.length - 1] != "?") {
                                path += "&";
                            }
                            path += (key + "=" + body[key]);
                        });
                    }
                    let rawRes = yield fetch(`${env.SERVER_ADDRESS}/${path}`, {
                        method: method,
                        headers: myHeaders,
                        redirect: "follow"
                    });
                    return { success: true, result: yield rawRes.json() };
                }
                else {
                    const myHeaders = new Headers();
                    myHeaders.append("layer", layer.toString());
                    myHeaders.append("Content-Type", "application/json");
                    let rawRes = yield fetch(`${env.SERVER_ADDRESS}/${path}`, {
                        method: method,
                        headers: myHeaders,
                        body: JSON.stringify(body),
                        redirect: "follow"
                    });
                    return { success: true, result: yield rawRes.json() };
                }
            }
            catch (ex) {
                return { success: false, result: ex };
            }
        });
    }
}

function _typeof$1(o) {
  "@babel/helpers - typeof";

  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof$1(o);
}

function toPrimitive(t, r) {
  if ("object" != _typeof$1(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r );
    if ("object" != _typeof$1(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof$1(i) ? i : i + "";
}

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}

function toArray(input) {
  return Array.isArray(input) ? input.slice(0) : [input];
}

/**
 * returns true if the supplied argument is either an Array<T> or a Readonly<Array<T>>
 */
function isMaybeReadonlyArray(x) {
  // While this looks strange, it's a workaround for an issue in TypeScript:
  // https://github.com/microsoft/TypeScript/issues/17002
  //
  // The problem is that `Array.isArray` as a type guard returns `false` for a readonly array,
  // but at runtime the object is an array and the runtime call to `Array.isArray` would return `true`.
  // The type predicate here allows for both `Array<T>` and `Readonly<Array<T>>` to pass a type check while
  // still performing runtime type inspection.
  return Array.isArray(x);
}

/**
 * Use this in array.filter() to remove all empty slots
 * and have the correct typings afterwards.
 * @link https://stackoverflow.com/a/46700791/3443137
 */
function arrayFilterNotEmpty(value) {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
}
function countUntilNotMatching(ar, matchingFn) {
  var count = 0;
  var idx = -1;
  for (var item of ar) {
    idx = idx + 1;
    var matching = matchingFn(item, idx);
    if (matching) {
      count = count + 1;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Appends the given documents to the given array.
 * This will mutate the first given array.
 * Mostly used as faster alternative to Array.concat()
 * because .concat() is so slow.
 * @link https://www.measurethat.net/Benchmarks/Show/4223/0/array-concat-vs-spread-operator-vs-push#latest_results_block
 */
function appendToArray(ar, add) {
  var amount = add.length;
  for (var i = 0; i < amount; ++i) {
    var element = add[i];
    ar.push(element);
  }
}

/**
 * @link https://gist.github.com/telekosmos/3b62a31a5c43f40849bb
 */
function uniqueArray(arrArg) {
  return arrArg.filter(function (elem, pos, arr) {
    return arr.indexOf(elem) === pos;
  });
}

/**
 * Parses the full revision.
 * Do NOT use this if you only need the revision height,
 * then use getHeightOfRevision() instead which is faster.
 */

/**
 * @hotPath Performance is very important here
 * because we need to parse the revision height very often.
 * Do not use `parseInt(revision.split('-')[0], 10)` because
 * only fetching the start-number chars is faster.
 */
function getHeightOfRevision(revision) {
  var useChars = '';
  for (var index = 0; index < revision.length; index++) {
    var char = revision[index];
    if (char === '-') {
      return parseInt(useChars, 10);
    }
    useChars += char;
  }
  throw new Error('malformatted revision: ' + revision);
}

/**
 * Creates the next write revision for a given document.
 */
function createRevision(databaseInstanceToken, previousDocData) {
  var newRevisionHeight = !previousDocData ? 1 : getHeightOfRevision(previousDocData._rev) + 1;
  return newRevisionHeight + '-' + databaseInstanceToken;
}

function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (Object.prototype.hasOwnProperty.call(o, prop) && o[prop] !== null && (typeof o[prop] === 'object' || typeof o[prop] === 'function') && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

/**
 * To get specific nested path values from objects,
 * RxDB normally uses the 'dot-prop' npm module.
 * But when performance is really relevant, this is not fast enough.
 * Instead we use a monad that can prepare some stuff up front
 * and we can reuse the generated function.
 */

function objectPathMonad(objectPath) {
  var split = objectPath.split('.');

  // reuse this variable for better performance.
  var splitLength = split.length;

  /**
   * Performance shortcut,
   * if no nested path is used,
   * directly return the field of the object.
   */
  if (splitLength === 1) {
    return obj => obj[objectPath];
  }
  return obj => {
    var currentVal = obj;
    for (var i = 0; i < splitLength; ++i) {
      var subPath = split[i];
      currentVal = currentVal[subPath];
      if (typeof currentVal === 'undefined') {
        return currentVal;
      }
    }
    return currentVal;
  };
}

/**
 * returns a flattened object
 * @link https://gist.github.com/penguinboy/762197
 */
function flattenObject(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if (typeof ob[i] === 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

/**
 * does a flat copy on the objects,
 * is about 3 times faster then using deepClone
 * @link https://jsperf.com/object-rest-spread-vs-clone/2
 */
function flatClone(obj) {
  return Object.assign({}, obj);
}

/**
 * @link https://stackoverflow.com/a/11509718/3443137
 */
function firstPropertyNameOfObject(obj) {
  return Object.keys(obj)[0];
}

/**
 * deep-sort an object so its attributes are in lexical order.
 * Also sorts the arrays inside of the object if no-array-sort not set
 */
function sortObject(obj, noArraySort = false) {
  if (!obj) return obj; // do not sort null, false or undefined

  // array
  if (!noArraySort && Array.isArray(obj)) {
    return obj.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);
      if (typeof a === 'object') return 1;else return -1;
    }).map(i => sortObject(i, noArraySort));
  }

  // object
  // array is also of type object
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    var out = {};
    Object.keys(obj).sort((a, b) => a.localeCompare(b)).forEach(key => {
      out[key] = sortObject(obj[key], noArraySort);
    });
    return out;
  }

  // everything else
  return obj;
}

/**
 * Deep clone a plain json object.
 * Does not work with recursive stuff
 * or non-plain-json.
 * IMPORTANT: Performance of this is very important,
 * do not change it without running performance tests!
 *
 * @link https://github.com/zxdong262/deep-copy/blob/master/src/index.ts
 */
function deepClone(src) {
  if (!src) {
    return src;
  }
  if (src === null || typeof src !== 'object') {
    return src;
  }
  if (Array.isArray(src)) {
    var ret = new Array(src.length);
    var i = ret.length;
    while (i--) {
      ret[i] = deepClone(src[i]);
    }
    return ret;
  }
  var dest = {};
  // eslint-disable-next-line guard-for-in
  for (var key in src) {
    dest[key] = deepClone(src[key]);
  }
  return dest;
}
var clone = deepClone;

/**
 * overwrites the getter with the actual value
 * Mostly used for caching stuff on the first run
 */
function overwriteGetterForCaching(obj, getterName, value) {
  Object.defineProperty(obj, getterName, {
    get: function () {
      return value;
    }
  });
  return value;
}

/**
 * We use 1 as minimum so that the value is never falsy.
 * This const is used in several places because querying
 * with a value lower then the minimum could give false results.
 */
var RX_META_LWT_MINIMUM = 1;
function getDefaultRxDocumentMeta() {
  return {
    /**
     * Set this to 1 to not waste performance
     * while calling new Date()..
     * The storage wrappers will anyway update
     * the lastWrite time while calling transformDocumentDataFromRxDBToRxStorage()
     */
    lwt: RX_META_LWT_MINIMUM
  };
}

/**
 * Returns a revision that is not valid.
 * Use this to have correct typings
 * while the storage wrapper anyway will overwrite the revision.
 */
function getDefaultRevision() {
  /**
   * Use a non-valid revision format,
   * to ensure that the RxStorage will throw
   * when the revision is not replaced downstream.
   */
  return '';
}
function stripMetaDataFromDocument(docData) {
  return Object.assign({}, docData, {
    _meta: undefined,
    _deleted: undefined,
    _rev: undefined
  });
}

/**
 * Faster way to check the equality of document lists
 * compared to doing a deep-equal.
 * Here we only check the ids and revisions.
 */
function areRxDocumentArraysEqual(primaryPath, ar1, ar2) {
  if (ar1.length !== ar2.length) {
    return false;
  }
  var i = 0;
  var len = ar1.length;
  while (i < len) {
    var row1 = ar1[i];
    var row2 = ar2[i];
    i++;
    if (row1._rev !== row2._rev || row1[primaryPath] !== row2[primaryPath]) {
      return false;
    }
  }
  return true;
}

class WordArray {
  constructor(words, sigBytes) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    this._data = new WordArray();
    this._nDataBytes = 0;
    this._minBufferSize = 0;
    this.blockSize = 512 / 32;
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    this._hash = new WordArray([...H]);
  }
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256(message) {
  return new SHA256().finalize(message).toString();
}

/**
 * TODO in the future we should no longer provide a
 * fallback to crypto.subtle.digest.
 * Instead users without crypto.subtle.digest support, should have to provide their own
 * hash function.
 */
function jsSha256(input) {
  return Promise.resolve(sha256(input));
}
async function nativeSha256(input) {
  var data = new TextEncoder().encode(input);
  var hashBuffer = await crypto.subtle.digest('SHA-256', data);
  /**
   * @link https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world/
   */
  var hash = Array.prototype.map.call(new Uint8Array(hashBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  return hash;
}
var canUseCryptoSubtle = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined' && typeof crypto.subtle.digest === 'function';

/**
 * Default hash method used to hash
 * strings and do equal comparisons.
 *
 * IMPORTANT: Changing the default hashing method
 * requires a BREAKING change!
 */

var defaultHashSha256 = canUseCryptoSubtle ? nativeSha256 : jsSha256;

/**
 * returns a promise that resolves on the next tick
 */
function nextTick() {
  return new Promise(res => setTimeout(res, 0));
}
function promiseWait(ms = 0) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Reusing resolved promises has a better
 * performance than creating new ones each time.
 */
Promise.resolve(true);
var PROMISE_RESOLVE_FALSE = Promise.resolve(false);
var PROMISE_RESOLVE_NULL = Promise.resolve(null);
var PROMISE_RESOLVE_VOID = Promise.resolve();
function requestIdlePromiseNoQueue(
/**
 * We always set a timeout!
 * RxDB might be used on the server side where the
 * server runs 24/4 on 99% CPU. So without a timeout
 * this would never resolve which could cause a memory leak.
 */
timeout = 10000) {
  /**
   * Do not use window.requestIdleCallback
   * because some javascript runtimes like react-native,
   * do not have a window object, but still have a global
   * requestIdleCallback function.
   * @link https://github.com/pubkey/rxdb/issues/4804
  */
  if (typeof requestIdleCallback === 'function') {
    return new Promise(res => {
      requestIdleCallback(() => res(), {
        timeout
      });
    });
  } else {
    return promiseWait(0);
  }
}

/**
 * If multiple operations wait for an requestIdlePromise
 * we do not want them to resolve all at the same time.
 * So we have to queue the calls.
 */
var idlePromiseQueue = PROMISE_RESOLVE_VOID;
function requestIdlePromise(timeout = undefined) {
  idlePromiseQueue = idlePromiseQueue.then(() => {
    return requestIdlePromiseNoQueue(timeout);
  });
  return idlePromiseQueue;
}

/**
 * like Promise.all() but runs in series instead of parallel
 * @link https://github.com/egoist/promise.series/blob/master/index.js
 * @param tasks array with functions that return a promise
 */
function promiseSeries(tasks, initial) {
  return tasks.reduce((current, next) => current.then(next), Promise.resolve(initial));
}

var REGEX_ALL_DOTS = /\./g;

var COUCH_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz';
/**
 * get a random string which can be used with couchdb
 * @link http://stackoverflow.com/a/1349426/3443137
 */
function randomCouchString(length = 10) {
  var text = '';
  for (var i = 0; i < length; i++) {
    text += COUCH_NAME_CHARS.charAt(Math.floor(Math.random() * COUCH_NAME_CHARS.length));
  }
  return text;
}

/**
 * uppercase first char
 */
function ucfirst(str) {
  str += '';
  var f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}

/**
 * removes trailing and ending dots from the string
 */
function trimDots(str) {
  // start
  while (str.charAt(0) === '.') {
    str = str.substr(1);
  }

  // end
  while (str.slice(-1) === '.') {
    str = str.slice(0, -1);
  }
  return str;
}

/**
 * returns true if the given name is likely a folder path
 */
function isFolderPath(name) {
  // do not check, if foldername is given
  if (name.includes('/') ||
  // unix
  name.includes('\\') // windows
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Copied from the fast-deep-equal package
 * because it does not support es modules and causes optimization bailouts.
 * TODO use the npm package again when this is merged:
 * @link https://github.com/epoberezkin/fast-deep-equal/pull/105
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;
    var length;
    var i;
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length; i-- !== 0;) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    var keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0;) {
      var key = keys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

/**
 * Copied from
 * @link https://github.com/sindresorhus/dot-prop/blob/main/index.js
 * because it is currently an esm only module.
 * TODO use the npm package again when RxDB is also fully esm.
 */

var isObject$2 = value => {
  var type = typeof value;
  return value !== null && (type === 'object' || type === 'function');
};
var disallowedKeys = new Set(['__proto__', 'prototype', 'constructor']);
var digits = new Set('0123456789');
function getPathSegments(path) {
  var parts = [];
  var currentSegment = '';
  var currentPart = 'start';
  var isIgnoring = false;
  for (var character of path) {
    switch (character) {
      case '\\':
        {
          if (currentPart === 'index') {
            throw new Error('Invalid character in an index');
          }
          if (currentPart === 'indexEnd') {
            throw new Error('Invalid character after an index');
          }
          if (isIgnoring) {
            currentSegment += character;
          }
          currentPart = 'property';
          isIgnoring = !isIgnoring;
          break;
        }
      case '.':
        {
          if (currentPart === 'index') {
            throw new Error('Invalid character in an index');
          }
          if (currentPart === 'indexEnd') {
            currentPart = 'property';
            break;
          }
          if (isIgnoring) {
            isIgnoring = false;
            currentSegment += character;
            break;
          }
          if (disallowedKeys.has(currentSegment)) {
            return [];
          }
          parts.push(currentSegment);
          currentSegment = '';
          currentPart = 'property';
          break;
        }
      case '[':
        {
          if (currentPart === 'index') {
            throw new Error('Invalid character in an index');
          }
          if (currentPart === 'indexEnd') {
            currentPart = 'index';
            break;
          }
          if (isIgnoring) {
            isIgnoring = false;
            currentSegment += character;
            break;
          }
          if (currentPart === 'property') {
            if (disallowedKeys.has(currentSegment)) {
              return [];
            }
            parts.push(currentSegment);
            currentSegment = '';
          }
          currentPart = 'index';
          break;
        }
      case ']':
        {
          if (currentPart === 'index') {
            parts.push(Number.parseInt(currentSegment, 10));
            currentSegment = '';
            currentPart = 'indexEnd';
            break;
          }
          if (currentPart === 'indexEnd') {
            throw new Error('Invalid character after an index');
          }

          // Falls through
        }
      default:
        {
          if (currentPart === 'index' && !digits.has(character)) {
            throw new Error('Invalid character in an index');
          }
          if (currentPart === 'indexEnd') {
            throw new Error('Invalid character after an index');
          }
          if (currentPart === 'start') {
            currentPart = 'property';
          }
          if (isIgnoring) {
            isIgnoring = false;
            currentSegment += '\\';
          }
          currentSegment += character;
        }
    }
  }
  if (isIgnoring) {
    currentSegment += '\\';
  }
  switch (currentPart) {
    case 'property':
      {
        if (disallowedKeys.has(currentSegment)) {
          return [];
        }
        parts.push(currentSegment);
        break;
      }
    case 'index':
      {
        throw new Error('Index was not closed');
      }
    case 'start':
      {
        parts.push('');
        break;
      }
    // No default
  }
  return parts;
}
function isStringIndex$1(object, key) {
  if (typeof key !== 'number' && Array.isArray(object)) {
    var index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}
function assertNotStringIndex(object, key) {
  if (isStringIndex$1(object, key)) {
    throw new Error('Cannot use string index');
  }
}

/**
 * TODO we need some performance tests and improvements here.
 */
function getProperty$1(object, path, value) {
  if (Array.isArray(path)) {
    path = path.join('.');
  }

  /**
   * Performance shortcut.
   * In most cases we just have a simple property name
   * so we can directly return it.
   */
  if (!path.includes('.') && !path.includes('[')) {
    return object[path];
  }
  if (!isObject$2(object) || typeof path !== 'string') {
    return value === undefined ? object : value;
  }
  var pathArray = getPathSegments(path);
  if (pathArray.length === 0) {
    return value;
  }
  for (var index = 0; index < pathArray.length; index++) {
    var key = pathArray[index];
    if (isStringIndex$1(object, key)) {
      object = index === pathArray.length - 1 ? undefined : null;
    } else {
      object = object[key];
    }
    if (object === undefined || object === null) {
      // `object` is either `undefined` or `null` so we want to stop the loop, and
      // if this is not the last bit of the path, and
      // if it didn't return `undefined`
      // it would return `null` if `object` is `null`
      // but we want `get({foo: null}, 'foo.bar')` to equal `undefined`, or the supplied value, not `null`
      if (index !== pathArray.length - 1) {
        return value;
      }
      break;
    }
  }
  return object === undefined ? value : object;
}
function setProperty(object, path, value) {
  if (Array.isArray(path)) {
    path = path.join('.');
  }
  if (!isObject$2(object) || typeof path !== 'string') {
    return object;
  }
  var root = object;
  var pathArray = getPathSegments(path);
  for (var index = 0; index < pathArray.length; index++) {
    var key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      object[key] = value;
    } else if (!isObject$2(object[key])) {
      object[key] = typeof pathArray[index + 1] === 'number' ? [] : {};
    }
    object = object[key];
  }
  return root;
}

function getFromMapOrThrow(map, key) {
  var val = map.get(key);
  if (typeof val === 'undefined') {
    throw new Error('missing value from map ' + key);
  }
  return val;
}
function getFromMapOrCreate(map, index, creator, ifWasThere) {
  var value = map.get(index);
  if (typeof value === 'undefined') {
    value = creator();
    map.set(index, value);
  }
  return value;
}

/**
 * Returns an error that indicates that a plugin is missing
 * We do not throw a RxError because this should not be handled
 * programmatically but by using the correct import
 */
function pluginMissing(pluginKey) {
  var keyParts = pluginKey.split('-');
  var pluginName = 'RxDB';
  keyParts.forEach(part => {
    pluginName += ucfirst(part);
  });
  pluginName += 'Plugin';
  return new Error("You are using a function which must be overwritten by a plugin.\n        You should either prevent the usage of this function or add the plugin via:\n            import { " + pluginName + " } from 'rxdb/plugins/" + pluginKey + "';\n            addRxPlugin(" + pluginName + ");\n        ");
}

/**
 * Returns the current unix time in milliseconds (with two decimals!)
 * Because the accuracy of getTime() in javascript is bad,
 * and we cannot rely on performance.now() on all platforms,
 * this method implements a way to never return the same value twice.
 * This ensures that when now() is called often, we do not loose the information
 * about which call came first and which came after.
 *
 * We had to move from having no decimals, to having two decimal
 * because it turned out that some storages are such fast that
 * calling this method too often would return 'the future'.
 */
var _lastNow = 0;
/**
 * Returns the current time in milliseconds,
 * also ensures to not return the same value twice.
 */
function now$2() {
  var ret = Date.now();
  ret = ret + 0.01;
  if (ret <= _lastNow) {
    ret = _lastNow + 0.01;
  }

  /**
   * Strip the returned number to max two decimals.
   * In theory we would not need this but
   * in practice JavaScript has no such good number precision
   * so rounding errors could add another decimal place.
   */
  var twoDecimals = parseFloat(ret.toFixed(2));
  _lastNow = twoDecimals;
  return twoDecimals;
}

function ensureNotFalsy(obj, message) {
  if (!obj) {
    if (!message) {
      message = '';
    }
    throw new Error('ensureNotFalsy() is falsy: ' + message);
  }
  return obj;
}

/**
 * Using shareReplay() without settings will not unsubscribe
 * if there are no more subscribers.
 * So we use these defaults.
 * @link https://cartant.medium.com/rxjs-whats-changed-with-sharereplay-65c098843e95
 */
var RXJS_SHARE_REPLAY_DEFAULTS = {
  bufferSize: 1,
  refCount: true
};

/**
 * This file is replaced in the 'npm run build:version' script.
 */
var RXDB_VERSION = '15.24.0';

/**
 * Can be used by some plugins to have a "global" object that
 * can be imported and mutated at will.
 */
var RXDB_UTILS_GLOBAL = {};
var PREMIUM_FLAG_HASH = '6da4936d1425ff3a5c44c02342c6daf791d266be3ae8479b8ec59e261df41b93';

function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}

function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}

function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}

function _isNativeFunction(t) {
  try {
    return -1 !== Function.toString.call(t).indexOf("[native code]");
  } catch (n) {
    return "function" == typeof t;
  }
}

function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
    return !!t;
  })();
}

function _construct(t, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t.bind.apply(t, o))();
  return r && _setPrototypeOf(p, r.prototype), p;
}

function _wrapNativeSuper(t) {
  var r = "function" == typeof Map ? new Map() : void 0;
  return _wrapNativeSuper = function _wrapNativeSuper(t) {
    if (null === t || !_isNativeFunction(t)) return t;
    if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
    if (void 0 !== r) {
      if (r.has(t)) return r.get(t);
      r.set(t, Wrapper);
    }
    function Wrapper() {
      return _construct(t, arguments, _getPrototypeOf(this).constructor);
    }
    return Wrapper.prototype = Object.create(t.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), _setPrototypeOf(Wrapper, t);
  }, _wrapNativeSuper(t);
}

/**
 * functions that can or should be overwritten by plugins
 * IMPORTANT: Do not import any big stuff from RxDB here!
 * An 'overwritable' can be used inside WebWorkers for RxStorage only,
 * and we do not want to have the full RxDB lib bundled in them.
 */

var overwritable = {
  /**
   * if this method is overwritten with one
   * that returns true, we do additional checks
   * which help the developer but have bad performance
   */
  isDevMode() {
    return false;
  },
  /**
   * Deep freezes and object when in dev-mode.
   * Deep-Freezing has the same performance as deep-cloning, so we only do that in dev-mode.
   * Also, we can ensure the readonly state via typescript
   * @link https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   */
  deepFreezeWhenDevMode(obj) {
    return obj;
  },
  /**
   * overwritten to map error-codes to text-messages
   */
  tunnelErrorMessage(message) {
    return "RxDB Error-Code " + message + ".\n        Error messages are not included in RxDB core to reduce build size.\n        ";
  }
};

/**
 * transform an object of parameters to a presentable string
 */
function parametersToString(parameters) {
  var ret = '';
  if (Object.keys(parameters).length === 0) return ret;
  ret += 'Given parameters: {\n';
  ret += Object.keys(parameters).map(k => {
    var paramStr = '[object Object]';
    try {
      if (k === 'errors') {
        paramStr = parameters[k].map(err => JSON.stringify(err, Object.getOwnPropertyNames(err)));
      } else {
        paramStr = JSON.stringify(parameters[k], function (_k, v) {
          return v === undefined ? null : v;
        }, 2);
      }
    } catch (e) {}
    return k + ':' + paramStr;
  }).join('\n');
  ret += '}';
  return ret;
}
function messageForError(message, code, parameters) {
  return 'RxError (' + code + '):' + '\n' + message + '\n' + parametersToString(parameters);
}
var RxError = /*#__PURE__*/function (_Error) {
  // always true, use this to detect if its an rxdb-error

  function RxError(code, message, parameters = {}) {
    var _this;
    var mes = messageForError(message, code, parameters);
    _this = _Error.call(this, mes) || this;
    _this.code = code;
    _this.message = mes;
    _this.url = getErrorUrl(code);
    _this.parameters = parameters;
    _this.rxdb = true; // tag them as internal
    return _this;
  }
  _inheritsLoose(RxError, _Error);
  var _proto = RxError.prototype;
  _proto.toString = function toString() {
    return this.message;
  };
  return _createClass(RxError, [{
    key: "name",
    get: function () {
      return 'RxError (' + this.code + ')';
    }
  }, {
    key: "typeError",
    get: function () {
      return false;
    }
  }]);
}( /*#__PURE__*/_wrapNativeSuper(Error));
var RxTypeError = /*#__PURE__*/function (_TypeError) {
  // always true, use this to detect if its an rxdb-error

  function RxTypeError(code, message, parameters = {}) {
    var _this2;
    var mes = messageForError(message, code, parameters);
    _this2 = _TypeError.call(this, mes) || this;
    _this2.code = code;
    _this2.message = mes;
    _this2.url = getErrorUrl(code);
    _this2.parameters = parameters;
    _this2.rxdb = true; // tag them as internal
    return _this2;
  }
  _inheritsLoose(RxTypeError, _TypeError);
  var _proto2 = RxTypeError.prototype;
  _proto2.toString = function toString() {
    return this.message;
  };
  return _createClass(RxTypeError, [{
    key: "name",
    get: function () {
      return 'RxTypeError (' + this.code + ')';
    }
  }, {
    key: "typeError",
    get: function () {
      return true;
    }
  }]);
}( /*#__PURE__*/_wrapNativeSuper(TypeError));
function getErrorUrl(code) {
  return 'https://rxdb.info/errors.html?console=errors#' + code;
}
function errorUrlHint(code) {
  return '\n You can find out more about this error here: ' + getErrorUrl(code) + ' ';
}
function newRxError(code, parameters) {
  return new RxError(code, overwritable.tunnelErrorMessage(code) + errorUrlHint(code), parameters);
}
function newRxTypeError(code, parameters) {
  return new RxTypeError(code, overwritable.tunnelErrorMessage(code) + errorUrlHint(code), parameters);
}

/**
 * Returns the error if it is a 409 conflict,
 * return false if it is another error.
 */
function isBulkWriteConflictError(err) {
  if (err && err.status === 409) {
    return err;
  } else {
    return false;
  }
}
var STORAGE_WRITE_ERROR_CODE_TO_MESSAGE = {
  409: 'document write conflict',
  422: 'schema validation error',
  510: 'attachment data missing'
};
function rxStorageWriteErrorToRxError(err) {
  return newRxError('COL20', {
    name: STORAGE_WRITE_ERROR_CODE_TO_MESSAGE[err.status],
    document: err.documentId,
    writeError: err
  });
}

/**
 * hook-functions that can be extended by the plugin
 */
var HOOKS = {
  /**
   * Runs before a plugin is added.
   * Use this to block the usage of non-compatible plugins.
   */
  preAddRxPlugin: [],
  /**
   * functions that run before the database is created
   */
  preCreateRxDatabase: [],
  /**
   * runs after the database is created and prepared
   * but before the instance is returned to the user
   * @async
   */
  createRxDatabase: [],
  preCreateRxCollection: [],
  createRxCollection: [],
  createRxState: [],
  /**
  * runs at the end of the destroy-process of a collection
  * @async
  */
  postDestroyRxCollection: [],
  /**
   * Runs after a collection is removed.
   * @async
   */
  postRemoveRxCollection: [],
  /**
    * functions that get the json-schema as input
    * to do additionally checks/manipulation
    */
  preCreateRxSchema: [],
  /**
   * functions that run after the RxSchema is created
   * gets RxSchema as attribute
   */
  createRxSchema: [],
  preCreateRxQuery: [],
  /**
   * Runs before a query is send to the
   * prepareQuery function of the storage engine.
   */
  prePrepareQuery: [],
  createRxDocument: [],
  /**
   * runs after a RxDocument is created,
   * cannot be async
   */
  postCreateRxDocument: [],
  /**
   * Runs before a RxStorageInstance is created
   * gets the params of createStorageInstance()
   * as attribute so you can manipulate them.
   * Notice that you have to clone stuff before mutating the inputs.
   */
  preCreateRxStorageInstance: [],
  preStorageWrite: [],
  /**
   * runs on the document-data before the document is migrated
   * {
   *   doc: Object, // original doc-data
   *   migrated: // migrated doc-data after run through migration-strategies
   * }
   */
  preMigrateDocument: [],
  /**
   * runs after the migration of a document has been done
   */
  postMigrateDocument: [],
  /**
   * runs at the beginning of the destroy-process of a database
   */
  preDestroyRxDatabase: [],
  /**
   * runs after a database has been removed
   * @async
   */
  postRemoveRxDatabase: [],
  /**
   * runs before the replication writes the rows to master
   * but before the rows have been modified
   * @async
   */
  preReplicationMasterWrite: [],
  /**
   * runs after the replication has been sent to the server
   * but before the new documents have been handled
   * @async
   */
  preReplicationMasterWriteDocumentsHandle: []
};
function runPluginHooks(hookKey, obj) {
  if (HOOKS[hookKey].length > 0) {
    HOOKS[hookKey].forEach(fun => fun(obj));
  }
}

/**
 * TODO
 * we should not run the hooks in parallel
 * this makes stuff unpredictable.
 */
function runAsyncPluginHooks(hookKey, obj) {
  return Promise.all(HOOKS[hookKey].map(fun => fun(obj)));
}

/**
 * Returns the sub-schema for a given path
 */
function getSchemaByObjectPath(rxJsonSchema, path) {
  var usePath = path;
  usePath = usePath.replace(REGEX_ALL_DOTS, '.properties.');
  usePath = 'properties.' + usePath;
  usePath = trimDots(usePath);
  var ret = getProperty$1(rxJsonSchema, usePath);
  return ret;
}
function fillPrimaryKey(primaryPath, jsonSchema, documentData) {
  // optimization shortcut.
  if (typeof jsonSchema.primaryKey === 'string') {
    return documentData;
  }
  var newPrimary = getComposedPrimaryKeyOfDocumentData(jsonSchema, documentData);
  var existingPrimary = documentData[primaryPath];
  if (existingPrimary && existingPrimary !== newPrimary) {
    throw newRxError('DOC19', {
      args: {
        documentData,
        existingPrimary,
        newPrimary
      },
      schema: jsonSchema
    });
  }
  documentData[primaryPath] = newPrimary;
  return documentData;
}
function getPrimaryFieldOfPrimaryKey(primaryKey) {
  if (typeof primaryKey === 'string') {
    return primaryKey;
  } else {
    return primaryKey.key;
  }
}

/**
 * Returns the composed primaryKey of a document by its data.
 */
function getComposedPrimaryKeyOfDocumentData(jsonSchema, documentData) {
  if (typeof jsonSchema.primaryKey === 'string') {
    return documentData[jsonSchema.primaryKey];
  }
  var compositePrimary = jsonSchema.primaryKey;
  return compositePrimary.fields.map(field => {
    var value = getProperty$1(documentData, field);
    if (typeof value === 'undefined') {
      throw newRxError('DOC18', {
        args: {
          field,
          documentData
        }
      });
    }
    return value;
  }).join(compositePrimary.separator);
}

/**
 * Normalize the RxJsonSchema.
 * We need this to ensure everything is set up properly
 * and we have the same hash on schemas that represent the same value but
 * have different json.
 *
 * - Orders the schemas attributes by alphabetical order
 * - Adds the primaryKey to all indexes that do not contain the primaryKey
 * - We need this for deterministic sort order on all queries, which is required for event-reduce to work.
 *
 * @return RxJsonSchema - ordered and filled
 */
function normalizeRxJsonSchema(jsonSchema) {
  var normalizedSchema = sortObject(jsonSchema, true);
  return normalizedSchema;
}

/**
 * If the schema does not specify any index,
 * we add this index so we at least can run RxQuery()
 * and only select non-deleted fields.
 */
function getDefaultIndex(primaryPath) {
  return ['_deleted', primaryPath];
}

/**
 * fills the schema-json with default-settings
 * @return cloned schemaObj
 */
function fillWithDefaultSettings(schemaObj) {
  schemaObj = flatClone(schemaObj);
  var primaryPath = getPrimaryFieldOfPrimaryKey(schemaObj.primaryKey);
  schemaObj.properties = flatClone(schemaObj.properties);

  // additionalProperties is always false
  schemaObj.additionalProperties = false;

  // fill with key-compression-state ()
  if (!Object.prototype.hasOwnProperty.call(schemaObj, 'keyCompression')) {
    schemaObj.keyCompression = false;
  }

  // indexes must be array
  schemaObj.indexes = schemaObj.indexes ? schemaObj.indexes.slice(0) : [];

  // required must be array
  schemaObj.required = schemaObj.required ? schemaObj.required.slice(0) : [];

  // encrypted must be array
  schemaObj.encrypted = schemaObj.encrypted ? schemaObj.encrypted.slice(0) : [];

  // add _rev
  schemaObj.properties._rev = {
    type: 'string',
    minLength: 1
  };

  // add attachments
  schemaObj.properties._attachments = {
    type: 'object'
  };

  // add deleted flag
  schemaObj.properties._deleted = {
    type: 'boolean'
  };

  // add meta property
  schemaObj.properties._meta = RX_META_SCHEMA;

  /**
   * meta fields are all required
   */
  schemaObj.required = schemaObj.required ? schemaObj.required.slice(0) : [];
  schemaObj.required.push('_deleted');
  schemaObj.required.push('_rev');
  schemaObj.required.push('_meta');
  schemaObj.required.push('_attachments');

  // final fields are always required
  var finalFields = getFinalFields(schemaObj);
  appendToArray(schemaObj.required, finalFields);
  schemaObj.required = schemaObj.required.filter(field => !field.includes('.')).filter((elem, pos, arr) => arr.indexOf(elem) === pos); // unique;

  // version is 0 by default
  schemaObj.version = schemaObj.version || 0;
  var useIndexes = schemaObj.indexes.map(index => {
    var arIndex = isMaybeReadonlyArray(index) ? index.slice(0) : [index];
    /**
     * Append primary key to indexes that do not contain the primaryKey.
     * All indexes must have the primaryKey to ensure a deterministic sort order.
     */
    if (!arIndex.includes(primaryPath)) {
      arIndex.push(primaryPath);
    }

    // add _deleted flag to all indexes so we can query only non-deleted fields
    // in RxDB itself
    if (arIndex[0] !== '_deleted') {
      arIndex.unshift('_deleted');
    }
    return arIndex;
  });
  if (useIndexes.length === 0) {
    useIndexes.push(getDefaultIndex(primaryPath));
  }

  // we need this index for the getChangedDocumentsSince() method
  useIndexes.push(['_meta.lwt', primaryPath]);

  // also add the internalIndexes
  if (schemaObj.internalIndexes) {
    schemaObj.internalIndexes.map(idx => {
      useIndexes.push(idx);
    });
  }

  // make indexes unique
  var hasIndex = new Set();
  useIndexes.filter(index => {
    var indexStr = index.join(',');
    if (hasIndex.has(indexStr)) {
      return false;
    } else {
      hasIndex.add(indexStr);
      return true;
    }
  });
  schemaObj.indexes = useIndexes;
  return schemaObj;
}
var RX_META_SCHEMA = {
  type: 'object',
  properties: {
    /**
     * The last-write time.
     * Unix time in milliseconds.
     */
    lwt: {
      type: 'number',
      /**
       * We use 1 as minimum so that the value is never falsy.
       */
      minimum: RX_META_LWT_MINIMUM,
      maximum: 1000000000000000,
      multipleOf: 0.01
    }
  },
  /**
   * Additional properties are allowed
   * and can be used by plugins to set various flags.
   */
  additionalProperties: true,
  required: ['lwt']
};

/**
 * returns the final-fields of the schema
 * @return field-names of the final-fields
 */
function getFinalFields(jsonSchema) {
  var ret = Object.keys(jsonSchema.properties).filter(key => jsonSchema.properties[key].final);

  // primary is also final
  var primaryPath = getPrimaryFieldOfPrimaryKey(jsonSchema.primaryKey);
  ret.push(primaryPath);

  // fields of composite primary are final
  if (typeof jsonSchema.primaryKey !== 'string') {
    jsonSchema.primaryKey.fields.forEach(field => ret.push(field));
  }
  return ret;
}

/**
 * fills all unset fields with default-values if set
 * @hotPath
 */
function fillObjectWithDefaults(rxSchema, obj) {
  var defaultKeys = Object.keys(rxSchema.defaultValues);
  for (var i = 0; i < defaultKeys.length; ++i) {
    var key = defaultKeys[i];
    if (!Object.prototype.hasOwnProperty.call(obj, key) || typeof obj[key] === 'undefined') {
      obj[key] = rxSchema.defaultValues[key];
    }
  }
  return obj;
}

var RxSchema = /*#__PURE__*/function () {
  function RxSchema(jsonSchema, hashFunction) {
    this.jsonSchema = jsonSchema;
    this.hashFunction = hashFunction;
    this.indexes = getIndexes(this.jsonSchema);

    // primary is always required
    this.primaryPath = getPrimaryFieldOfPrimaryKey(this.jsonSchema.primaryKey);
    this.finalFields = getFinalFields(this.jsonSchema);
  }
  var _proto = RxSchema.prototype;
  /**
   * checks if a given change on a document is allowed
   * Ensures that:
   * - final fields are not modified
   * @throws {Error} if not valid
   */
  _proto.validateChange = function validateChange(dataBefore, dataAfter) {
    this.finalFields.forEach(fieldName => {
      if (!deepEqual(dataBefore[fieldName], dataAfter[fieldName])) {
        throw newRxError('DOC9', {
          dataBefore,
          dataAfter,
          fieldName,
          schema: this.jsonSchema
        });
      }
    });
  }

  /**
   * creates the schema-based document-prototype,
   * see RxCollection.getDocumentPrototype()
   */;
  _proto.getDocumentPrototype = function getDocumentPrototype() {
    var proto = {};

    /**
     * On the top level, we know all keys
     * and therefore do not have to create a new Proxy object
     * for each document. Instead we define the getter in the prototype once.
     */
    var pathProperties = getSchemaByObjectPath(this.jsonSchema, '');
    Object.keys(pathProperties).forEach(key => {
      var fullPath = key;

      // getter - value
      proto.__defineGetter__(key, function () {
        if (!this.get || typeof this.get !== 'function') {
          /**
           * When an object gets added to the state of a vuejs-component,
           * it happens that this getter is called with another scope.
           * To prevent errors, we have to return undefined in this case
           */
          return undefined;
        }
        var ret = this.get(fullPath);
        return ret;
      });
      // getter - observable$
      Object.defineProperty(proto, key + '$', {
        get: function () {
          return this.get$(fullPath);
        },
        enumerable: false,
        configurable: false
      });
      // getter - reactivity$$
      Object.defineProperty(proto, key + '$$', {
        get: function () {
          return this.get$$(fullPath);
        },
        enumerable: false,
        configurable: false
      });
      // getter - populate_
      Object.defineProperty(proto, key + '_', {
        get: function () {
          return this.populate(fullPath);
        },
        enumerable: false,
        configurable: false
      });
    });
    overwriteGetterForCaching(this, 'getDocumentPrototype', () => proto);
    return proto;
  };
  _proto.getPrimaryOfDocumentData = function getPrimaryOfDocumentData(documentData) {
    return getComposedPrimaryKeyOfDocumentData(this.jsonSchema, documentData);
  };
  return _createClass(RxSchema, [{
    key: "version",
    get: function () {
      return this.jsonSchema.version;
    }
  }, {
    key: "defaultValues",
    get: function () {
      var values = {};
      Object.entries(this.jsonSchema.properties).filter(([, v]) => Object.prototype.hasOwnProperty.call(v, 'default')).forEach(([k, v]) => values[k] = v.default);
      return overwriteGetterForCaching(this, 'defaultValues', values);
    }

    /**
     * @overrides itself on the first call
     *
     * TODO this should be a pure function that
     * caches the hash in a WeakMap.
     */
  }, {
    key: "hash",
    get: function () {
      return overwriteGetterForCaching(this, 'hash', this.hashFunction(JSON.stringify(this.jsonSchema)));
    }
  }]);
}();
function getIndexes(jsonSchema) {
  return (jsonSchema.indexes || []).map(index => isMaybeReadonlyArray(index) ? index : [index]);
}

/**
 * array with previous version-numbers
 */
function getPreviousVersions(schema) {
  var version = schema.version ? schema.version : 0;
  var c = 0;
  return new Array(version).fill(0).map(() => c++);
}
function createRxSchema(jsonSchema, hashFunction, runPreCreateHooks = true) {
  if (runPreCreateHooks) {
    runPluginHooks('preCreateRxSchema', jsonSchema);
  }
  var useJsonSchema = fillWithDefaultSettings(jsonSchema);
  useJsonSchema = normalizeRxJsonSchema(useJsonSchema);
  overwritable.deepFreezeWhenDevMode(useJsonSchema);
  var schema = new RxSchema(useJsonSchema, hashFunction);
  runPluginHooks('createRxSchema', schema);
  return schema;
}

function isFunction$1(value) {
    return typeof value === 'function';
}

function hasLift(source) {
    return isFunction$1(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}

var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

function isPromise$1(value) {
    return isFunction$1(value === null || value === void 0 ? void 0 : value.then);
}

function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}

var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction$1(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError) {
                                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction$1(value.remove) && isFunction$1(value.add) && isFunction$1(value.unsubscribe)));
}
function execFinalizer(finalizer) {
    if (isFunction$1(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

var timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};

function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function () {
        {
            throw err;
        }
    });
}

function noop() { }

function errorContext(cb) {
    {
        cb();
    }
}

var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) ;
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction$1(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
function handleUnhandledError(error) {
    {
        reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop,
};

var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

function identity(x) {
    return x;
}

function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
        errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction$1(value.next) && isFunction$1(value.error) && isFunction$1(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}

function isInteropObservable(input) {
    return isFunction$1(input[observable]);
}

function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction$1(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}

function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}

function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = getSymbolIterator();

function isIterable(input) {
    return isFunction$1(input === null || input === void 0 ? void 0 : input[iterator]);
}

function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
        var reader, _a, value, done;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 9, 10]);
                    _b.label = 2;
                case 2:
                    return [4, __await(reader.read())];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (!done) return [3, 5];
                    return [4, __await(void 0)];
                case 4: return [2, _b.sent()];
                case 5: return [4, __await(value)];
                case 6: return [4, _b.sent()];
                case 7:
                    _b.sent();
                    return [3, 2];
                case 8: return [3, 10];
                case 9:
                    reader.releaseLock();
                    return [7];
                case 10: return [2];
            }
        });
    });
}
function isReadableStreamLike(obj) {
    return isFunction$1(obj === null || obj === void 0 ? void 0 : obj.getReader);
}

function innerFrom(input) {
    if (input instanceof Observable) {
        return input;
    }
    if (input != null) {
        if (isInteropObservable(input)) {
            return fromInteropObservable(input);
        }
        if (isArrayLike(input)) {
            return fromArrayLike(input);
        }
        if (isPromise$1(input)) {
            return fromPromise(input);
        }
        if (isAsyncIterable(input)) {
            return fromAsyncIterable(input);
        }
        if (isIterable(input)) {
            return fromIterable(input);
        }
        if (isReadableStreamLike(input)) {
            return fromReadableStreamLike(input);
        }
    }
    throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
    return new Observable(function (subscriber) {
        var obs = obj[observable]();
        if (isFunction$1(obs.subscribe)) {
            return obs.subscribe(subscriber);
        }
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
    });
}
function fromArrayLike(array) {
    return new Observable(function (subscriber) {
        for (var i = 0; i < array.length && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    });
}
function fromPromise(promise) {
    return new Observable(function (subscriber) {
        promise
            .then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, reportUnhandledError);
    });
}
function fromIterable(iterable) {
    return new Observable(function (subscriber) {
        var e_1, _a;
        try {
            for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                subscriber.next(value);
                if (subscriber.closed) {
                    return;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        subscriber.complete();
    });
}
function fromAsyncIterable(asyncIterable) {
    return new Observable(function (subscriber) {
        process$1(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
    });
}
function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process$1(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var value, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    asyncIterable_1 = __asyncValues(asyncIterable);
                    _b.label = 1;
                case 1: return [4, asyncIterable_1.next()];
                case 2:
                    if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                    value = asyncIterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return [2];
                    }
                    _b.label = 3;
                case 3: return [3, 1];
                case 4: return [3, 11];
                case 5:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                    return [4, _a.call(asyncIterable_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3, 10];
                case 9:
                    if (e_2) throw e_2.error;
                    return [7];
                case 10: return [7];
                case 11:
                    subscriber.complete();
                    return [2];
            }
        });
    });
}

function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = (function (_super) {
    __extends(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this.shouldUnsubscribe = shouldUnsubscribe;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
            var closed_1 = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        }
    };
    return OperatorSubscriber;
}(Subscriber));

var dateTimestampProvider = {
    now: function () {
        return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: undefined,
};

function isScheduler(value) {
    return value && isFunction$1(value.schedule);
}

function last(arr) {
    return arr[arr.length - 1];
}
function popScheduler(args) {
    return isScheduler(last(args)) ? args.pop() : undefined;
}
function popNumber(args, defaultValue) {
    return typeof last(args) === 'number' ? args.pop() : defaultValue;
}

function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) { delay = 0; }
    if (repeat === void 0) { repeat = false; }
    var scheduleSubscription = scheduler.schedule(function () {
        work();
        if (repeat) {
            parentSubscription.add(this.schedule(null, delay));
        }
        else {
            this.unsubscribe();
        }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
        return scheduleSubscription;
    }
}

function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return operate(function (source, subscriber) {
        source.subscribe(createOperatorSubscriber(subscriber, function (value) { return executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
    });
}

function subscribeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return operate(function (source, subscriber) {
        subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
    });
}

function scheduleObservable(input, scheduler) {
    return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

function schedulePromise(input, scheduler) {
    return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}

function scheduleArray(input, scheduler) {
    return new Observable(function (subscriber) {
        var i = 0;
        return scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
            }
            else {
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    this.schedule();
                }
            }
        });
    });
}

function scheduleIterable(input, scheduler) {
    return new Observable(function (subscriber) {
        var iterator$1;
        executeSchedule(subscriber, scheduler, function () {
            iterator$1 = input[iterator]();
            executeSchedule(subscriber, scheduler, function () {
                var _a;
                var value;
                var done;
                try {
                    (_a = iterator$1.next(), value = _a.value, done = _a.done);
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                }
            }, 0, true);
        });
        return function () { return isFunction$1(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return(); };
    });
}

function scheduleAsyncIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable(function (subscriber) {
        executeSchedule(subscriber, scheduler, function () {
            var iterator = input[Symbol.asyncIterator]();
            executeSchedule(subscriber, scheduler, function () {
                iterator.next().then(function (result) {
                    if (result.done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(result.value);
                    }
                });
            }, 0, true);
        });
    });
}

function scheduleReadableStreamLike(input, scheduler) {
    return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
}

function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable(input)) {
            return scheduleObservable(input, scheduler);
        }
        if (isArrayLike(input)) {
            return scheduleArray(input, scheduler);
        }
        if (isPromise$1(input)) {
            return schedulePromise(input, scheduler);
        }
        if (isAsyncIterable(input)) {
            return scheduleAsyncIterable(input, scheduler);
        }
        if (isIterable(input)) {
            return scheduleIterable(input, scheduler);
        }
        if (isReadableStreamLike(input)) {
            return scheduleReadableStreamLike(input, scheduler);
        }
    }
    throw createInvalidObservableTypeError(input);
}

function from(input, scheduler) {
    return scheduler ? scheduled(input, scheduler) : innerFrom(input);
}

function map(project, thisArg) {
    return operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(createOperatorSubscriber(subscriber, function (value) {
            subscriber.next(project.call(thisArg, value, index++));
        }));
    });
}

function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
    var doInnerSub = function (value) {
        active++;
        var innerComplete = false;
        innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function (innerValue) {
            {
                subscriber.next(innerValue);
            }
        }, function () {
            innerComplete = true;
        }, undefined, function () {
            if (innerComplete) {
                try {
                    active--;
                    var _loop_1 = function () {
                        var bufferedValue = buffer.shift();
                        if (innerSubScheduler) ;
                        else {
                            doInnerSub(bufferedValue);
                        }
                    };
                    while (buffer.length && active < concurrent) {
                        _loop_1();
                    }
                    checkComplete();
                }
                catch (err) {
                    subscriber.error(err);
                }
            }
        }));
    };
    source.subscribe(createOperatorSubscriber(subscriber, outerNext, function () {
        isComplete = true;
        checkComplete();
    }));
    return function () {
    };
}

function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if (isFunction$1(resultSelector)) {
        return mergeMap(function (a, i) { return map(function (b, ii) { return resultSelector(a, b, i, ii); })(innerFrom(project(a, i))); }, concurrent);
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return operate(function (source, subscriber) { return mergeInternals(source, subscriber, project, concurrent); });
}

var isArray$1 = Array.isArray;
function argsOrArgArray(args) {
    return args.length === 1 && isArray$1(args[0]) ? args[0] : args;
}

function mergeAll(concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return mergeMap(identity, concurrent);
}

function concatAll() {
    return mergeAll(1);
}

var ObjectUnsubscribedError = createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription(function () {
            _this.currentObservers = null;
            arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));

function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return concatAll()(from(args, popScheduler(args)));
}

var EMPTY = new Observable(function (subscriber) { return subscriber.complete(); });

function distinctUntilChanged(comparator, keySelector) {
    if (keySelector === void 0) { keySelector = identity; }
    comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
    return operate(function (source, subscriber) {
        var previousKey;
        var first = true;
        source.subscribe(createOperatorSubscriber(subscriber, function (value) {
            var currentKey = keySelector(value);
            if (first || !comparator(previousKey, currentKey)) {
                first = false;
                previousKey = currentKey;
                subscriber.next(value);
            }
        }));
    });
}
function defaultCompare(a, b) {
    return a === b;
}

function filter(predicate, thisArg) {
    return operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(createOperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
    });
}

var EmptyError = createErrorClass(function (_super) { return function EmptyErrorImpl() {
    _super(this);
    this.name = 'EmptyError';
    this.message = 'no elements in sequence';
}; });

function merge$2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    var concurrent = popNumber(args, Infinity);
    args = argsOrArgArray(args);
    return operate(function (source, subscriber) {
        mergeAll(concurrent)(from(__spreadArray([source], __read(args)), scheduler)).subscribe(subscriber);
    });
}

function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return merge$2.apply(void 0, __spreadArray([], __read(otherSources)));
}

var BehaviorSubject = (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: false,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        !subscription.closed && subscriber.next(this._value);
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
        if (hasError) {
            throw thrownError;
        }
        this._throwIfClosed();
        return _value;
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, (this._value = value));
    };
    return BehaviorSubject;
}(Subject));

var ReplaySubject = (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
        if (_bufferSize === void 0) { _bufferSize = Infinity; }
        if (_windowTime === void 0) { _windowTime = Infinity; }
        if (_timestampProvider === void 0) { _timestampProvider = dateTimestampProvider; }
        var _this = _super.call(this) || this;
        _this._bufferSize = _bufferSize;
        _this._windowTime = _windowTime;
        _this._timestampProvider = _timestampProvider;
        _this._buffer = [];
        _this._infiniteTimeWindow = true;
        _this._infiniteTimeWindow = _windowTime === Infinity;
        _this._bufferSize = Math.max(1, _bufferSize);
        _this._windowTime = Math.max(1, _windowTime);
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
        if (!isStopped) {
            _buffer.push(value);
            !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
        }
        this._trimBuffer();
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._trimBuffer();
        var subscription = this._innerSubscribe(subscriber);
        var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
        var copy = _buffer.slice();
        for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    };
    ReplaySubject.prototype._trimBuffer = function () {
        var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
        var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
        _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
        if (!_infiniteTimeWindow) {
            var now = _timestampProvider.now();
            var last = 0;
            for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                last = i;
            }
            last && _buffer.splice(0, last + 1);
        }
    };
    return ReplaySubject;
}(Subject));

function share(options) {
    if (options === void 0) { options = {}; }
    var _a = options.connector, connector = _a === void 0 ? function () { return new Subject(); } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
    return function (wrapperSource) {
        var connection;
        var resetConnection;
        var subject;
        var refCount = 0;
        var hasCompleted = false;
        var hasErrored = false;
        var cancelReset = function () {
            resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
            resetConnection = undefined;
        };
        var reset = function () {
            cancelReset();
            connection = subject = undefined;
            hasCompleted = hasErrored = false;
        };
        var resetAndUnsubscribe = function () {
            var conn = connection;
            reset();
            conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
        };
        return operate(function (source, subscriber) {
            refCount++;
            if (!hasErrored && !hasCompleted) {
                cancelReset();
            }
            var dest = (subject = subject !== null && subject !== void 0 ? subject : connector());
            subscriber.add(function () {
                refCount--;
                if (refCount === 0 && !hasErrored && !hasCompleted) {
                    resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
                }
            });
            dest.subscribe(subscriber);
            if (!connection &&
                refCount > 0) {
                connection = new SafeSubscriber({
                    next: function (value) { return dest.next(value); },
                    error: function (err) {
                        hasErrored = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnError, err);
                        dest.error(err);
                    },
                    complete: function () {
                        hasCompleted = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnComplete);
                        dest.complete();
                    },
                });
                innerFrom(source).subscribe(connection);
            }
        })(wrapperSource);
    };
}
function handleReset(reset, on) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (on === true) {
        reset();
        return;
    }
    if (on === false) {
        return;
    }
    var onSubscriber = new SafeSubscriber({
        next: function () {
            onSubscriber.unsubscribe();
            reset();
        },
    });
    return innerFrom(on.apply(void 0, __spreadArray([], __read(args)))).subscribe(onSubscriber);
}

function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var _a, _b, _c;
    var bufferSize;
    var refCount = false;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        (_a = configOrBufferSize.bufferSize, bufferSize = _a === void 0 ? Infinity : _a, _b = configOrBufferSize.windowTime, windowTime = _b === void 0 ? Infinity : _b, _c = configOrBufferSize.refCount, refCount = _c === void 0 ? false : _c, scheduler = configOrBufferSize.scheduler);
    }
    else {
        bufferSize = (configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity);
    }
    return share({
        connector: function () { return new ReplaySubject(bufferSize, windowTime, scheduler); },
        resetOnError: true,
        resetOnComplete: false,
        resetOnRefCountZero: refCount,
    });
}

function startWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var scheduler = popScheduler(values);
    return operate(function (source, subscriber) {
        (scheduler ? concat(values, source, scheduler) : concat(values, source)).subscribe(subscriber);
    });
}

/**
 * RxChangeEvents a emitted when something in the database changes
 * they can be grabbed by the observables of database, collection and document
 */

function getDocumentDataOfRxChangeEvent(rxChangeEvent) {
  if (rxChangeEvent.documentData) {
    return rxChangeEvent.documentData;
  } else {
    return rxChangeEvent.previousDocumentData;
  }
}

/**
 * Might return null which means an
 * already deleted document got modified but still is deleted.
 * These kind of events are not relevant for the event-reduce algorithm
 * and must be filtered out.
 */
function rxChangeEventToEventReduceChangeEvent(rxChangeEvent) {
  switch (rxChangeEvent.operation) {
    case 'INSERT':
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: rxChangeEvent.documentData,
        previous: null
      };
    case 'UPDATE':
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: overwritable.deepFreezeWhenDevMode(rxChangeEvent.documentData),
        previous: rxChangeEvent.previousDocumentData ? rxChangeEvent.previousDocumentData : 'UNKNOWN'
      };
    case 'DELETE':
      return {
        operation: rxChangeEvent.operation,
        id: rxChangeEvent.documentId,
        doc: null,
        previous: rxChangeEvent.previousDocumentData
      };
  }
}

function firstValueFrom(source, config) {
    return new Promise(function (resolve, reject) {
        var subscriber = new SafeSubscriber({
            next: function (value) {
                resolve(value);
                subscriber.unsubscribe();
            },
            error: reject,
            complete: function () {
                {
                    reject(new EmptyError());
                }
            },
        });
        source.subscribe(subscriber);
    });
}

function merge$1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    var concurrent = popNumber(args, Infinity);
    var sources = args;
    return !sources.length
        ?
            EMPTY
        : sources.length === 1
            ?
                innerFrom(sources[0])
            :
                mergeAll(concurrent)(from(sources, scheduler));
}

function lastOfArray(ar) {
    return ar[ar.length - 1];
}
function isObject$1(value) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
}
function getProperty(object, path, value) {
    if (Array.isArray(path)) {
        path = path.join('.');
    }
    if (!isObject$1(object) || typeof path !== 'string') {
        return object ;
    }
    const pathArray = path.split('.');
    if (pathArray.length === 0) {
        return value;
    }
    for (let index = 0; index < pathArray.length; index++) {
        const key = pathArray[index];
        if (isStringIndex(object, key)) {
            object = index === pathArray.length - 1 ? undefined : null;
        }
        else {
            object = object[key];
        }
        if (object === undefined || object === null) {
            // `object` is either `undefined` or `null` so we want to stop the loop, and
            // if this is not the last bit of the path, and
            // if it didn't return `undefined`
            // it would return `null` if `object` is `null`
            // but we want `get({foo: null}, 'foo.bar')` to equal `undefined`, or the supplied value, not `null`
            if (index !== pathArray.length - 1) {
                return value;
            }
            break;
        }
    }
    return object === undefined ? value : object;
}
function isStringIndex(object, key) {
    if (typeof key !== 'number' && Array.isArray(object)) {
        const index = Number.parseInt(key, 10);
        return Number.isInteger(index) && object[index] === object[key];
    }
    return false;
}

const hasLimit = (input) => {
    return !!input.queryParams.limit;
};
const isFindOne = (input) => {
    return input.queryParams.limit === 1;
};
const hasSkip = (input) => {
    if (input.queryParams.skip && input.queryParams.skip > 0) {
        return true;
    }
    else {
        return false;
    }
};
const isDelete = (input) => {
    return input.changeEvent.operation === 'DELETE';
};
const isInsert = (input) => {
    return input.changeEvent.operation === 'INSERT';
};
const isUpdate = (input) => {
    return input.changeEvent.operation === 'UPDATE';
};
const wasLimitReached = (input) => {
    return hasLimit(input) && input.previousResults.length >= input.queryParams.limit;
};
const sortParamsChanged = (input) => {
    const sortFields = input.queryParams.sortFields;
    const prev = input.changeEvent.previous;
    const doc = input.changeEvent.doc;
    if (!doc) {
        return false;
    }
    if (!prev) {
        return true;
    }
    for (let i = 0; i < sortFields.length; i++) {
        const field = sortFields[i];
        const beforeData = getProperty(prev, field);
        const afterData = getProperty(doc, field);
        if (beforeData !== afterData) {
            return true;
        }
    }
    return false;
};
const wasInResult = (input) => {
    const id = input.changeEvent.id;
    if (input.keyDocumentMap) {
        const has = input.keyDocumentMap.has(id);
        return has;
    }
    else {
        const primary = input.queryParams.primaryKey;
        const results = input.previousResults;
        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            if (item[primary] === id) {
                return true;
            }
        }
        return false;
    }
};
const wasFirst = (input) => {
    const first = input.previousResults[0];
    if (first && first[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    else {
        return false;
    }
};
const wasLast = (input) => {
    const last = lastOfArray(input.previousResults);
    if (last && last[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    else {
        return false;
    }
};
const wasSortedBeforeFirst = (input) => {
    const prev = input.changeEvent.previous;
    if (!prev) {
        return false;
    }
    const first = input.previousResults[0];
    if (!first) {
        return false;
    }
    /**
     * If the changed document is the same as the first,
     * we cannot sort-compare them, because it might end in a non-deterministic
     * sort order. Because both document could be equal.
     * So instead we have to return true.
     */
    if (first[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    const comp = input.queryParams.sortComparator(prev, first);
    return comp < 0;
};
const wasSortedAfterLast = (input) => {
    const prev = input.changeEvent.previous;
    if (!prev) {
        return false;
    }
    const last = lastOfArray(input.previousResults);
    if (!last) {
        return false;
    }
    if (last[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    const comp = input.queryParams.sortComparator(prev, last);
    return comp > 0;
};
const isSortedBeforeFirst = (input) => {
    const doc = input.changeEvent.doc;
    if (!doc) {
        return false;
    }
    const first = input.previousResults[0];
    if (!first) {
        return false;
    }
    if (first[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    const comp = input.queryParams.sortComparator(doc, first);
    return comp < 0;
};
const isSortedAfterLast = (input) => {
    const doc = input.changeEvent.doc;
    if (!doc) {
        return false;
    }
    const last = lastOfArray(input.previousResults);
    if (!last) {
        return false;
    }
    if (last[input.queryParams.primaryKey] === input.changeEvent.id) {
        return true;
    }
    const comp = input.queryParams.sortComparator(doc, last);
    return comp > 0;
};
const wasMatching = (input) => {
    const prev = input.changeEvent.previous;
    if (!prev) {
        return false;
    }
    return input.queryParams.queryMatcher(prev);
};
const doesMatchNow = (input) => {
    const doc = input.changeEvent.doc;
    if (!doc) {
        return false;
    }
    const ret = input.queryParams.queryMatcher(doc);
    return ret;
};
const wasResultsEmpty = (input) => {
    return input.previousResults.length === 0;
};

const stateResolveFunctionByIndex = {
    0: isInsert,
    1: isUpdate,
    2: isDelete,
    3: hasLimit,
    4: isFindOne,
    5: hasSkip,
    6: wasResultsEmpty,
    7: wasLimitReached,
    8: wasFirst,
    9: wasLast,
    10: sortParamsChanged,
    11: wasInResult,
    12: wasSortedBeforeFirst,
    13: wasSortedAfterLast,
    14: isSortedBeforeFirst,
    15: isSortedAfterLast,
    16: wasMatching,
    17: doesMatchNow
};

/**
 * copied and adapted from npm 'binary-search-insert'
 * @link https://www.npmjs.com/package/binary-search-insert
 */
function pushAtSortPosition(array, item, compareFunction, low) {
  var length = array.length;
  var high = length - 1;
  var mid = 0;

  /**
   * Optimization shortcut.
   */
  if (length === 0) {
    array.push(item);
    return 0;
  }

  /**
   * So we do not have to get the ret[mid] doc again
   * at the last we store it here.
   */
  var lastMidDoc;
  while (low <= high) {
    // https://github.com/darkskyapp/binary-search
    // http://googleresearch.blogspot.com/2006/06/extra-extra-read-all-about-it-nearly.html
    mid = low + (high - low >> 1);
    lastMidDoc = array[mid];
    if (compareFunction(lastMidDoc, item) <= 0.0) {
      // searching too low
      low = mid + 1;
    } else {
      // searching too high
      high = mid - 1;
    }
  }
  if (compareFunction(lastMidDoc, item) <= 0.0) {
    mid++;
  }

  /**
   * Insert at correct position
   */
  array.splice(mid, 0, item);
  return mid;
}

const doNothing = (_input) => { };
const insertFirst = (input) => {
    input.previousResults.unshift(input.changeEvent.doc);
    if (input.keyDocumentMap) {
        input.keyDocumentMap.set(input.changeEvent.id, input.changeEvent.doc);
    }
};
const insertLast = (input) => {
    input.previousResults.push(input.changeEvent.doc);
    if (input.keyDocumentMap) {
        input.keyDocumentMap.set(input.changeEvent.id, input.changeEvent.doc);
    }
};
const removeFirstItem = (input) => {
    const first = input.previousResults.shift();
    if (input.keyDocumentMap && first) {
        input.keyDocumentMap.delete(first[input.queryParams.primaryKey]);
    }
};
const removeLastItem = (input) => {
    const last = input.previousResults.pop();
    if (input.keyDocumentMap && last) {
        input.keyDocumentMap.delete(last[input.queryParams.primaryKey]);
    }
};
const removeFirstInsertLast = (input) => {
    removeFirstItem(input);
    insertLast(input);
};
const removeLastInsertFirst = (input) => {
    removeLastItem(input);
    insertFirst(input);
};
const removeFirstInsertFirst = (input) => {
    removeFirstItem(input);
    insertFirst(input);
};
const removeLastInsertLast = (input) => {
    removeLastItem(input);
    insertLast(input);
};
const removeExisting = (input) => {
    if (input.keyDocumentMap) {
        input.keyDocumentMap.delete(input.changeEvent.id);
    }
    // find index of document
    const primary = input.queryParams.primaryKey;
    const results = input.previousResults;
    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        // remove
        if (item[primary] === input.changeEvent.id) {
            results.splice(i, 1);
            break;
        }
    }
};
const replaceExisting = (input) => {
    // find index of document
    const doc = input.changeEvent.doc;
    const primary = input.queryParams.primaryKey;
    const results = input.previousResults;
    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        // replace
        if (item[primary] === input.changeEvent.id) {
            results[i] = doc;
            if (input.keyDocumentMap) {
                input.keyDocumentMap.set(input.changeEvent.id, doc);
            }
            break;
        }
    }
};
/**
 * this function always returns wrong results
 * it must be later optimised out
 * otherwise there is something broken
 */
const alwaysWrong = (input) => {
    const wrongHuman = {
        _id: 'wrongHuman' + new Date().getTime()
    };
    input.previousResults.length = 0; // clear array
    input.previousResults.push(wrongHuman);
    if (input.keyDocumentMap) {
        input.keyDocumentMap.clear();
        input.keyDocumentMap.set(wrongHuman._id, wrongHuman);
    }
};
const insertAtSortPosition = (input) => {
    const docId = input.changeEvent.id;
    const doc = input.changeEvent.doc;
    if (input.keyDocumentMap) {
        if (input.keyDocumentMap.has(docId)) {
            /**
             * If document is already in results,
             * we cannot add it again because it would throw on non-deterministic ordering.
             */
            return;
        }
        input.keyDocumentMap.set(docId, doc);
    }
    else {
        const isDocInResults = input.previousResults.find((d) => d[input.queryParams.primaryKey] === docId);
        /**
         * If document is already in results,
         * we cannot add it again because it would throw on non-deterministic ordering.
         */
        if (isDocInResults) {
            return;
        }
    }
    pushAtSortPosition(input.previousResults, doc, input.queryParams.sortComparator, 0);
};
const removeExistingAndInsertAtSortPosition = (input) => {
    removeExisting(input);
    insertAtSortPosition(input);
};
const runFullQueryAgain = (_input) => {
    throw new Error('Action runFullQueryAgain must be implemented by yourself');
};
const unknownAction = (_input) => {
    throw new Error('Action unknownAction should never be called');
};

/**
 * all actions ordered by performance-cost
 * cheapest first
 * TODO run tests on which is really the fastest
 */
const orderedActionList = [
    'doNothing',
    'insertFirst',
    'insertLast',
    'removeFirstItem',
    'removeLastItem',
    'removeFirstInsertLast',
    'removeLastInsertFirst',
    'removeFirstInsertFirst',
    'removeLastInsertLast',
    'removeExisting',
    'replaceExisting',
    'alwaysWrong',
    'insertAtSortPosition',
    'removeExistingAndInsertAtSortPosition',
    'runFullQueryAgain',
    'unknownAction'
];
const actionFunctions = {
    doNothing,
    insertFirst,
    insertLast,
    removeFirstItem,
    removeLastItem,
    removeFirstInsertLast,
    removeLastInsertFirst,
    removeFirstInsertFirst,
    removeLastInsertLast,
    removeExisting,
    replaceExisting,
    alwaysWrong,
    insertAtSortPosition,
    removeExistingAndInsertAtSortPosition,
    runFullQueryAgain,
    unknownAction
};

/*
let t = 0;
while (t < 10000) {
    const char = String.fromCharCode(t);
    console.log(t + ' : ' + char);
    t++;
}
*/
/*

To have a really small string representation, we have to hack some stuff
which makes is complicated but effective.

Rules for the string:
- The string starts with a number like '23' that defines how many leaf-nodes we have
- leaf nodes consist of two chars like 'ab'
    - the first char is the id
    - the second the value is a number you can get via String.charCodeAt()
- Internal nodes have four chars like 'abcd'
    - the first char is the id
    - the second char is the id of the 0-branch
    - the third char is the id of the 1-branch
    - the last char is the id of the boolean-function (= level)
- The last 3 chars of the string is the root node like 'abc'
    - it looks like the internal-node but without the id (first char)

*/
// we use this because 39 is the quotes which causes problems
const CHAR_CODE_OFFSET = 40; // String.fromCharCode(33) === ')'
function getNumberOfChar(char) {
    const charCode = char.charCodeAt(0);
    return charCode - CHAR_CODE_OFFSET;
}

function booleanToBooleanString(b) {
    if (b) {
        return '1';
    }
    else {
        return '0';
    }
}
/**
 * @link https://stackoverflow.com/a/6259536
 */
function splitStringToChunks(str, chunkSize) {
    const chunks = [];
    for (let i = 0, charsLength = str.length; i < charsLength; i += chunkSize) {
        chunks.push(str.substring(i, i + chunkSize));
    }
    return chunks;
}

function minimalStringToSimpleBdd(str) {
    const nodesById = new Map();
    // parse leaf nodes
    const leafNodeAmount = parseInt(str.charAt(0) + str.charAt(1), 10);
    const lastLeafNodeChar = (2 + leafNodeAmount * 2);
    const leafNodeChars = str.substring(2, lastLeafNodeChar);
    const leafNodeChunks = splitStringToChunks(leafNodeChars, 2);
    for (let i = 0; i < leafNodeChunks.length; i++) {
        const chunk = leafNodeChunks[i];
        const id = chunk.charAt(0);
        const value = getNumberOfChar(chunk.charAt(1));
        nodesById.set(id, value);
    }
    // parse internal nodes
    const internalNodeChars = str.substring(lastLeafNodeChar, str.length - 3);
    const internalNodeChunks = splitStringToChunks(internalNodeChars, 4);
    for (let i = 0; i < internalNodeChunks.length; i++) {
        const chunk = internalNodeChunks[i];
        const id = chunk.charAt(0);
        const idOf0Branch = chunk.charAt(1);
        const idOf1Branch = chunk.charAt(2);
        const level = getNumberOfChar(chunk.charAt(3));
        if (!nodesById.has(idOf0Branch)) {
            throw new Error('missing node with id ' + idOf0Branch);
        }
        if (!nodesById.has(idOf1Branch)) {
            throw new Error('missing node with id ' + idOf1Branch);
        }
        const node0 = nodesById.get(idOf0Branch);
        const node1 = nodesById.get(idOf1Branch);
        const node = {
            l: level, // level is first for prettier json output
            0: node0,
            1: node1
        };
        nodesById.set(id, node);
    }
    // parse root node
    const last3 = str.slice(-3);
    const idOf0 = last3.charAt(0);
    const idOf1 = last3.charAt(1);
    const levelOfRoot = getNumberOfChar(last3.charAt(2));
    const nodeOf0 = nodesById.get(idOf0);
    const nodeOf1 = nodesById.get(idOf1);
    const rootNode = {
        l: levelOfRoot,
        0: nodeOf0,
        1: nodeOf1,
    };
    return rootNode;
}

function resolveWithSimpleBdd(simpleBdd, fns, input) {
    let currentNode = simpleBdd;
    let currentLevel = simpleBdd.l;
    while (true) {
        const booleanResult = fns[currentLevel](input);
        const branchKey = booleanToBooleanString(booleanResult);
        currentNode = currentNode[branchKey];
        if (typeof currentNode === 'number' || typeof currentNode === 'string') {
            return currentNode;
        }
        else {
            currentLevel = currentNode.l;
        }
    }
}

const minimalBddString = '14a1b,c+d2e5f0g/h.i4j*k-l)m(n6oeh6pnm6qen6ril6snh6tin6ubo9vce9wmh9xns9yne9zmi9{cm9|ad9}cp9~aq9ae9¡bf9¢bq9£cg9¤ck9¥cn9¦nd9§np9¨nq9©nf9ªng9«nm9¬nk9­mr9®ms9¯mt9°mj9±mk9²ml9³mn9´mc8µ³{8¶¯}8·°¤8¸³§8¹mn8º³«8»³m8¼m´4½z²4¾³w4¿zµ4À¯¶4Á°·4Â³º4Ã³¸4Äm¹4Åv¤7Æyn7ÇÀÁ7È~7É¥¤7ÊÃÄ7Ë¨n7Ìº¹7Í­°7Î®m7Ï¯°7Ð±m7Ñ³m7Ò¼m5ÓÄm5Ô¹m5Õ½°5Ö¾m5×¿°5ØÇÏ5ÙÂm5ÚÊÑ5Û±m5Üºm5ÝÌÑ5ÞÕÍ2ß|2à¡u2á£Å2âÖÎ2ã¦Æ2ä©x2åªÆ2æ×Ø2ç|È2è¡¢2é£É2ê¤¥2ëÙÚ2ì¦Ë2í©n2îªn2ïÛÐ2ðÜÝ2ñ¬n2òÒÓ/óan/ôbn/õcn/öÞâ/÷ßã/øàä/ùáå/úæë/ûçì/üèí/ýéî/þÍÎ/ÿÏÑ/ĀòÔ,ācn,Ăöï,ă¤ñ,Ąúð,ąêñ,ĆþÐ,ćÿÑ,Ĉac0ĉbc0Ċóõ0ċôā0Čßá0čà¤0Ďçé0ďèê0Đ÷ù0đøă0Ēûý0ēüą0ĔmÒ-ĕmĀ-ĖÞæ-ėČĎ-Ęčď-ęĂĄ-ĚĐĒ-ěđē-Ĝ²»-ĝÍÏ-ĞĆć-ğ²³-ĠĔĈ3ġĕĊ3ĢĖė3ģęĚ3ĤĢĝ(ĥĜğ(ĦģĞ(ħĠġ+Ĩĉċ+ĩĤĦ+ĪĘě+īħĨ1ĬĩĪ1ĭĬī*Įĥm*ĭĮ.';
let simpleBdd;
function getSimpleBdd() {
    if (!simpleBdd) {
        simpleBdd = minimalStringToSimpleBdd(minimalBddString);
    }
    return simpleBdd;
}
const resolveInput = (input) => {
    return resolveWithSimpleBdd(getSimpleBdd(), stateResolveFunctionByIndex, input);
};

function calculateActionName(input) {
    const resolvedActionId = resolveInput(input);
    return orderedActionList[resolvedActionId];
}
/**
 * for performance reasons,
 * @mutates the input
 * @returns the new results
 */
function runAction(action, queryParams, changeEvent, previousResults, keyDocumentMap) {
    const fn = actionFunctions[action];
    fn({
        queryParams,
        changeEvent,
        previousResults,
        keyDocumentMap
    });
    return previousResults;
}

var INDEX_MAX = String.fromCharCode(65535);

/**
 * Do not use -Infinity here because it would be
 * transformed to null on JSON.stringify() which can break things
 * when the query plan is send to the storage as json.
 * @link https://stackoverflow.com/a/16644751
 * Notice that for IndexedDB IDBKeyRange we have
 * to transform the value back to -Infinity
 * before we can use it in IDBKeyRange.bound.
 */
var INDEX_MIN = Number.MIN_SAFE_INTEGER;

/**
 * Returns the query plan which contains
 * information about how to run the query
 * and which indexes to use.
 *
 * This is used in some storage like Memory, dexie.js and IndexedDB.
 */
function getQueryPlan(schema, query) {
  var selector = query.selector;
  var indexes = schema.indexes ? schema.indexes.slice(0) : [];
  if (query.index) {
    indexes = [query.index];
  }

  /**
   * Most storages do not support descending indexes
   * so having a 'desc' in the sorting, means we always have to re-sort the results.
   */
  var hasDescSorting = !!query.sort.find(sortField => Object.values(sortField)[0] === 'desc');

  /**
   * Some fields can be part of the selector while not being relevant for sorting
   * because their selector operators specify that in all cases all matching docs
   * would have the same value.
   * For example the boolean field _deleted.
   * TODO similar thing could be done for enums.
   */
  var sortIrrelevevantFields = new Set();
  Object.keys(selector).forEach(fieldName => {
    var schemaPart = getSchemaByObjectPath(schema, fieldName);
    if (schemaPart && schemaPart.type === 'boolean' && Object.prototype.hasOwnProperty.call(selector[fieldName], '$eq')) {
      sortIrrelevevantFields.add(fieldName);
    }
  });
  var optimalSortIndex = query.sort.map(sortField => Object.keys(sortField)[0]);
  var optimalSortIndexCompareString = optimalSortIndex.filter(f => !sortIrrelevevantFields.has(f)).join(',');
  var currentBestQuality = -1;
  var currentBestQueryPlan;

  /**
   * Calculate one query plan for each index
   * and then test which of the plans is best.
   */
  indexes.forEach(index => {
    var inclusiveEnd = true;
    var inclusiveStart = true;
    var opts = index.map(indexField => {
      var matcher = selector[indexField];
      var operators = matcher ? Object.keys(matcher) : [];
      var matcherOpts = {};
      if (!matcher || !operators.length) {
        var startKey = inclusiveStart ? INDEX_MIN : INDEX_MAX;
        matcherOpts = {
          startKey,
          endKey: inclusiveEnd ? INDEX_MAX : INDEX_MIN,
          inclusiveStart: true,
          inclusiveEnd: true
        };
      } else {
        operators.forEach(operator => {
          if (LOGICAL_OPERATORS.has(operator)) {
            var operatorValue = matcher[operator];
            var partialOpts = getMatcherQueryOpts(operator, operatorValue);
            matcherOpts = Object.assign(matcherOpts, partialOpts);
          }
        });
      }

      // fill missing attributes
      if (typeof matcherOpts.startKey === 'undefined') {
        matcherOpts.startKey = INDEX_MIN;
      }
      if (typeof matcherOpts.endKey === 'undefined') {
        matcherOpts.endKey = INDEX_MAX;
      }
      if (typeof matcherOpts.inclusiveStart === 'undefined') {
        matcherOpts.inclusiveStart = true;
      }
      if (typeof matcherOpts.inclusiveEnd === 'undefined') {
        matcherOpts.inclusiveEnd = true;
      }
      if (inclusiveStart && !matcherOpts.inclusiveStart) {
        inclusiveStart = false;
      }
      if (inclusiveEnd && !matcherOpts.inclusiveEnd) {
        inclusiveEnd = false;
      }
      return matcherOpts;
    });
    var startKeys = opts.map(opt => opt.startKey);
    var endKeys = opts.map(opt => opt.endKey);
    var queryPlan = {
      index,
      startKeys,
      endKeys,
      inclusiveEnd,
      inclusiveStart,
      sortSatisfiedByIndex: !hasDescSorting && optimalSortIndexCompareString === index.filter(f => !sortIrrelevevantFields.has(f)).join(','),
      selectorSatisfiedByIndex: isSelectorSatisfiedByIndex(index, query.selector, startKeys, endKeys)
    };
    var quality = rateQueryPlan(schema, query, queryPlan);
    if (quality >= currentBestQuality || query.index) {
      currentBestQuality = quality;
      currentBestQueryPlan = queryPlan;
    }
  });

  /**
   * In all cases and index must be found
   */
  if (!currentBestQueryPlan) {
    throw newRxError('SNH', {
      query
    });
  }
  return currentBestQueryPlan;
}
var LOGICAL_OPERATORS = new Set(['$eq', '$gt', '$gte', '$lt', '$lte']);
var LOWER_BOUND_LOGICAL_OPERATORS = new Set(['$eq', '$gt', '$gte']);
var UPPER_BOUND_LOGICAL_OPERATORS = new Set(['$eq', '$lt', '$lte']);
function isSelectorSatisfiedByIndex(index, selector, startKeys, endKeys) {
  /**
   * Not satisfied if one or more operators are non-logical
   * operators that can never be satisfied by an index.
   */
  var selectorEntries = Object.entries(selector);
  var hasNonMatchingOperator = selectorEntries.find(([fieldName, operation]) => {
    if (!index.includes(fieldName)) {
      return true;
    }
    var hasNonLogicOperator = Object.entries(operation).find(([op, _value]) => !LOGICAL_OPERATORS.has(op));
    return hasNonLogicOperator;
  });
  if (hasNonMatchingOperator) {
    return false;
  }

  /**
   * Not satisfied if contains $and or $or operations.
   */
  if (selector.$and || selector.$or) {
    return false;
  }

  // ensure all lower bound in index
  var satisfieldLowerBound = [];
  var lowerOperatorFieldNames = new Set();
  for (var [fieldName, operation] of Object.entries(selector)) {
    if (!index.includes(fieldName)) {
      return false;
    }

    // If more then one logic op on the same field, we have to selector-match.
    var lowerLogicOps = Object.keys(operation).filter(key => LOWER_BOUND_LOGICAL_OPERATORS.has(key));
    if (lowerLogicOps.length > 1) {
      return false;
    }
    var hasLowerLogicOp = lowerLogicOps[0];
    if (hasLowerLogicOp) {
      lowerOperatorFieldNames.add(fieldName);
    }
    if (hasLowerLogicOp !== '$eq') {
      if (satisfieldLowerBound.length > 0) {
        return false;
      } else {
        satisfieldLowerBound.push(hasLowerLogicOp);
      }
    }
  }

  // ensure all upper bound in index
  var satisfieldUpperBound = [];
  var upperOperatorFieldNames = new Set();
  for (var [_fieldName, _operation] of Object.entries(selector)) {
    if (!index.includes(_fieldName)) {
      return false;
    }

    // If more then one logic op on the same field, we have to selector-match.
    var upperLogicOps = Object.keys(_operation).filter(key => UPPER_BOUND_LOGICAL_OPERATORS.has(key));
    if (upperLogicOps.length > 1) {
      return false;
    }
    var hasUperLogicOp = upperLogicOps[0];
    if (hasUperLogicOp) {
      upperOperatorFieldNames.add(_fieldName);
    }
    if (hasUperLogicOp !== '$eq') {
      if (satisfieldUpperBound.length > 0) {
        return false;
      } else {
        satisfieldUpperBound.push(hasUperLogicOp);
      }
    }
  }

  /**
   * If the index contains a non-relevant field between
   * the relevant fields, then the index is not satisfying.
   */
  var i = 0;
  for (var _fieldName2 of index) {
    for (var set of [lowerOperatorFieldNames, upperOperatorFieldNames]) {
      if (!set.has(_fieldName2) && set.size > 0) {
        return false;
      }
      set.delete(_fieldName2);
    }
    var startKey = startKeys[i];
    var endKey = endKeys[i];
    if (startKey !== endKey && lowerOperatorFieldNames.size > 0 && upperOperatorFieldNames.size > 0) {
      return false;
    }
    i++;
  }
  return true;
}
function getMatcherQueryOpts(operator, operatorValue) {
  switch (operator) {
    case '$eq':
      return {
        startKey: operatorValue,
        endKey: operatorValue,
        inclusiveEnd: true,
        inclusiveStart: true
      };
    case '$lte':
      return {
        endKey: operatorValue,
        inclusiveEnd: true
      };
    case '$gte':
      return {
        startKey: operatorValue,
        inclusiveStart: true
      };
    case '$lt':
      return {
        endKey: operatorValue,
        inclusiveEnd: false
      };
    case '$gt':
      return {
        startKey: operatorValue,
        inclusiveStart: false
      };
    default:
      throw new Error('SNH');
  }
}

/**
 * Returns a number that determines the quality of the query plan.
 * Higher number means better query plan.
 */
function rateQueryPlan(schema, query, queryPlan) {
  var quality = 0;
  var addQuality = value => {
    if (value > 0) {
      quality = quality + value;
    }
  };
  var pointsPerMatchingKey = 10;
  var nonMinKeyCount = countUntilNotMatching(queryPlan.startKeys, keyValue => keyValue !== INDEX_MIN && keyValue !== INDEX_MAX);
  addQuality(nonMinKeyCount * pointsPerMatchingKey);
  var nonMaxKeyCount = countUntilNotMatching(queryPlan.startKeys, keyValue => keyValue !== INDEX_MAX && keyValue !== INDEX_MIN);
  addQuality(nonMaxKeyCount * pointsPerMatchingKey);
  var equalKeyCount = countUntilNotMatching(queryPlan.startKeys, (keyValue, idx) => {
    if (keyValue === queryPlan.endKeys[idx]) {
      return true;
    } else {
      return false;
    }
  });
  addQuality(equalKeyCount * pointsPerMatchingKey * 1.5);
  var pointsIfNoReSortMustBeDone = queryPlan.sortSatisfiedByIndex ? 5 : 0;
  addQuality(pointsIfNoReSortMustBeDone);
  return quality;
}

/** Represents an error reported by the mingo library. */
class MingoError extends Error {
}

/**
 * Utility constants and functions
 */
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;
const MAX_LONG = Number.MAX_SAFE_INTEGER;
const MIN_LONG = Number.MIN_SAFE_INTEGER;
// special value to identify missing items. treated differently from undefined
const MISSING = Symbol("missing");
const CYCLE_FOUND_ERROR = Object.freeze(new Error("mingo: cycle detected while processing object/array"));
const ARRAY_PROTO = Object.getPrototypeOf([]);
const OBJECT_PROTO = Object.getPrototypeOf({});
const OBJECT_TAG = "[object Object]";
const OBJECT_TYPE_RE = /^\[object ([a-zA-Z0-9]+)\]$/;
class Null {
}
class Undefined {
}
const getConstructor = (v) => {
    if (v === null)
        return Null;
    if (v === undefined)
        return Undefined;
    return v.constructor;
};
/**
 * Uses the simple hash method as described in Effective Java.
 * @see https://stackoverflow.com/a/113600/1370481
 * @param value The value to hash
 * @returns {number}
 */
const DEFAULT_HASH_FUNCTION = (value) => {
    const s = stringify(value);
    let hash = 0;
    let i = s.length;
    while (i)
        hash = ((hash << 5) - hash) ^ s.charCodeAt(--i);
    return hash >>> 0;
};
// no array, object, or function types
const JS_SIMPLE_TYPES = new Set([
    "null",
    "undefined",
    "boolean",
    "number",
    "string",
    "date",
    "regexp"
]);
const IMMUTABLE_TYPES_SET = new Set([Undefined, Null, Boolean, String, Number]);
/** Convert simple value to string representation. */
const toString = (v) => v.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
/** Convert a typed array to string representation. */
const typedArrayToString = (v) => `${getConstructor(v).name}[${v.toString()}]`; // eslint-disable-line @typescript-eslint/no-base-to-string
/** Map of constructors to string converter functions */
const STRING_CONVERTERS = new Map([
    [Number, toString],
    [Boolean, toString],
    [RegExp, toString],
    [Function, toString],
    [Symbol, toString],
    [Date, (d) => d.toISOString()],
    [String, JSON.stringify],
    [Null, (_) => "null"],
    [Undefined, (_) => "undefined"],
    [Int8Array, typedArrayToString],
    [Uint8Array, typedArrayToString],
    [Uint8ClampedArray, typedArrayToString],
    [Int16Array, typedArrayToString],
    [Uint16Array, typedArrayToString],
    [Int32Array, typedArrayToString],
    [Uint32Array, typedArrayToString],
    [Float32Array, typedArrayToString],
    [Float64Array, typedArrayToString]
]);
/**
 * Some types like BigInt are not available on more exotic
 * JavaScript runtimes like ReactNative or QuickJS.
 * So we fill them in only if they exist so that it does not throw an error.
 */
if (typeof BigInt !== "undefined") {
    STRING_CONVERTERS.set(BigInt, (n) => "0x" + n.toString(16));
}
if (typeof BigInt64Array !== "undefined") {
    STRING_CONVERTERS.set(BigInt64Array, typedArrayToString);
}
if (typeof BigUint64Array !== "undefined") {
    STRING_CONVERTERS.set(BigUint64Array, typedArrayToString);
}
/** MongoDB sort comparison order. https://www.mongodb.com/docs/manual/reference/bson-type-comparison-order */
const SORT_ORDER_BY_TYPE = {
    null: 0,
    undefined: 0,
    number: 1,
    string: 2,
    object: 3,
    array: 4,
    boolean: 5,
    date: 6,
    regexp: 7,
    function: 8
};
/**
 * Compare function which adheres to MongoDB comparison order.
 *
 * @param a The first value
 * @param b The second value
 * @returns {Number}
 */
const compare$1 = (a, b) => {
    if (a === MISSING)
        a = undefined;
    if (b === MISSING)
        b = undefined;
    const [u, v] = [a, b].map(n => SORT_ORDER_BY_TYPE[getType(n).toLowerCase()]);
    if (u !== v)
        return u - v;
    // number | string | date
    if (u === 1 || u === 2 || u === 6) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
    // check for equivalence equality
    if (isEqual(a, b))
        return 0;
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    // if we get here we are comparing a type that does not make sense.
    return 0;
};
function assert(condition, message) {
    if (!condition)
        throw new MingoError(message);
}
const isTypedArray = (v) => {
    const proto = Object.getPrototypeOf(getConstructor(v));
    return proto && proto.name === "TypedArray";
};
/**
 * Deep clone an object. Value types and immutable objects are returned as is.
 */
const cloneDeep = (obj) => {
    if (IMMUTABLE_TYPES_SET.has(getConstructor(obj)))
        return obj;
    const cycle = new Set();
    const clone = (val) => {
        if (cycle.has(val))
            throw CYCLE_FOUND_ERROR;
        const ctor = getConstructor(val);
        if (IMMUTABLE_TYPES_SET.has(ctor))
            return val;
        try {
            // arrays
            if (isArray(val)) {
                cycle.add(val);
                return val.map(clone);
            }
            // object literals
            if (isObject(val)) {
                cycle.add(val);
                const res = {};
                for (const k in val)
                    res[k] = clone(val[k]);
                return res;
            }
        }
        finally {
            cycle.delete(val);
        }
        // dates, regex, typed arrays
        if (ctor === Date || ctor === RegExp || isTypedArray(val)) {
            return new ctor(val);
        }
        return val;
    };
    return clone(obj);
};
/**
 * Returns the name of type as specified in the tag returned by a call to Object.prototype.toString
 * @param v A value
 */
const getType = (v) => OBJECT_TYPE_RE.exec(Object.prototype.toString.call(v))[1];
const isBoolean = (v) => typeof v === "boolean";
const isString = (v) => typeof v === "string";
const isNumber = (v) => !isNaN(v) && typeof v === "number";
const isArray = Array.isArray;
const isObject = (v) => {
    if (!v)
        return false;
    const proto = Object.getPrototypeOf(v);
    return ((proto === OBJECT_PROTO || proto === null) &&
        OBJECT_TAG === Object.prototype.toString.call(v));
};
//  objects, arrays, functions, date, custom object
const isObjectLike = (v) => v === Object(v);
const isDate = (v) => v instanceof Date;
const isRegExp = (v) => v instanceof RegExp;
const isFunction = (v) => typeof v === "function";
const isNil = (v) => v === null || v === undefined;
const inArray = (arr, item) => arr.includes(item);
const notInArray = (arr, item) => !inArray(arr, item);
const truthy = (arg, strict = true) => !!arg || (strict && arg === "");
const isEmpty = (x) => isNil(x) ||
    (isString(x) && !x) ||
    (x instanceof Array && x.length === 0) ||
    (isObject(x) && Object.keys(x).length === 0);
const isMissing = (v) => v === MISSING;
/** ensure a value is an array or wrapped within one. */
const ensureArray = (x) => x instanceof Array ? x : [x];
const has = (obj, prop) => !!obj && Object.prototype.hasOwnProperty.call(obj, prop);
const mergeable = (left, right) => (isObject(left) && isObject(right)) || (isArray(left) && isArray(right));
/**
 * Deep merge objects or arrays.
 * When the inputs have unmergeable types, the  right hand value is returned.
 * If inputs are arrays and options.flatten is set, elements in the same position are merged together. Remaining elements are appended to the target object.
 * If options.flatten is false, the right hand value is just appended to the left-hand value.
 * @param target {Object|Array} the target to merge into
 * @param obj {Object|Array} the source object
 */
function merge(target, obj, options) {
    // default options
    options = options || { flatten: false };
    // take care of missing inputs
    if (isMissing(target) || isNil(target))
        return obj;
    if (isMissing(obj) || isNil(obj))
        return target;
    // fail only on initial input.
    if (!mergeable(target, obj)) {
        if (options.skipValidation)
            return obj || target;
        throw Error("mismatched types. must both be array or object");
    }
    // skip validation after initial input.
    options.skipValidation = true;
    if (isArray(target)) {
        const result = target;
        const input = obj;
        if (options.flatten) {
            let i = 0;
            let j = 0;
            while (i < result.length && j < input.length) {
                result[i] = merge(result[i++], input[j++], options);
            }
            while (j < input.length) {
                result.push(obj[j++]);
            }
        }
        else {
            into(result, input);
        }
    }
    else {
        for (const k in obj) {
            target[k] = merge(target[k], obj[k], options);
        }
    }
    return target;
}
function buildHashIndex(arr, hashFunction = DEFAULT_HASH_FUNCTION) {
    const map = new Map();
    arr.forEach((o, i) => {
        const h = hashCode(o, hashFunction);
        if (map.has(h)) {
            if (!map.get(h).some(j => isEqual(arr[j], o))) {
                map.get(h).push(i);
            }
        }
        else {
            map.set(h, [i]);
        }
    });
    return map;
}
/**
 * Returns the intersection of multiple arrays.
 *
 * @param  {Array} input An array of arrays from which to find intersection.
 * @param  {Function} hashFunction Custom function to hash values, default the hashCode method
 * @return {Array} Array of intersecting values.
 */
function intersection(input, hashFunction = DEFAULT_HASH_FUNCTION) {
    // if any array is empty, there is no intersection
    if (input.some(arr => arr.length == 0))
        return [];
    if (input.length === 1)
        return Array.from(input);
    // sort input arrays by to get smallest array
    // const sorted = sortBy(input, (a: RawArray) => a.length) as RawArray[];
    const sortedIndex = sortBy(input.map((a, i) => [i, a.length]), (a) => a[1]);
    // get the smallest
    const smallest = input[sortedIndex[0][0]];
    // get hash index of smallest array
    const map = buildHashIndex(smallest, hashFunction);
    // hashIndex for remaining arrays.
    const rmap = new Map();
    // final intersection results and index of first occurrence.
    const results = new Array();
    map.forEach((v, k) => {
        const lhs = v.map(j => smallest[j]);
        const res = lhs.map(_ => 0);
        // used to track first occurence of value in order of the original input array.
        const stable = lhs.map(_ => [sortedIndex[0][0], 0]);
        let found = false;
        for (let i = 1; i < input.length; i++) {
            const [currIndex, _] = sortedIndex[i];
            const arr = input[currIndex];
            if (!rmap.has(i))
                rmap.set(i, buildHashIndex(arr));
            // we found a match. let's confirm.
            if (rmap.get(i).has(k)) {
                const rhs = rmap
                    .get(i)
                    .get(k)
                    .map(j => arr[j]);
                // confirm the intersection with an equivalence check.
                found = lhs
                    .map((s, n) => rhs.some((t, m) => {
                    // we expect only one to match here since these are just collisions.
                    const p = res[n];
                    if (isEqual(s, t)) {
                        res[n]++;
                        // track position of value ordering for stability.
                        if (currIndex < stable[n][0]) {
                            stable[n] = [currIndex, rmap.get(i).get(k)[m]];
                        }
                    }
                    return p < res[n];
                }))
                    .some(Boolean);
            }
            // found nothing, so exclude value. this was just a hash collision.
            if (!found)
                return;
        }
        // extract value into result if we found an intersection.
        // we find an intersection if the frequency counter matches the count of the remaining arrays.
        if (found) {
            into(results, res
                .map((n, i) => {
                return n === input.length - 1 ? [lhs[i], stable[i]] : MISSING;
            })
                .filter(n => n !== MISSING));
        }
    });
    return results
        .sort((a, b) => {
        const [_i, [u, m]] = a;
        const [_j, [v, n]] = b;
        const r = compare$1(u, v);
        if (r !== 0)
            return r;
        return compare$1(m, n);
    })
        .map(v => v[0]);
}
/**
 * Flatten the array
 *
 * @param {Array} xs The array to flatten
 * @param {Number} depth The number of nested lists to iterate
 */
function flatten(xs, depth = 0) {
    const arr = new Array();
    function flatten2(ys, n) {
        for (let i = 0, len = ys.length; i < len; i++) {
            if (isArray(ys[i]) && (n > 0 || n < 0)) {
                flatten2(ys[i], Math.max(-1, n - 1));
            }
            else {
                arr.push(ys[i]);
            }
        }
    }
    flatten2(xs, depth);
    return arr;
}
/** Returns all members of the value in an object literal. */
const getMembersOf = (value) => {
    let [proto, names] = [
        Object.getPrototypeOf(value),
        Object.getOwnPropertyNames(value)
    ];
    // save effective prototype
    let activeProto = proto;
    // traverse the prototype hierarchy until we get property names or hit the bottom prototype.
    while (!names.length && proto !== OBJECT_PROTO && proto !== ARRAY_PROTO) {
        activeProto = proto;
        names = Object.getOwnPropertyNames(proto);
        proto = Object.getPrototypeOf(proto);
    }
    const o = {};
    names.forEach(k => (o[k] = value[k]));
    return [o, activeProto];
};
/**
 * Determine whether two values are the same or strictly equivalent.
 * Checking whether values are the same only applies to built in objects.
 * For user-defined objects this checks for only referential equality so
 * two different instances with the same values are not equal.
 *
 * @param  {*}  a The first value
 * @param  {*}  b The second value
 * @return {Boolean}   Result of comparison
 */
function isEqual(a, b) {
    const args = [[a, b]];
    while (args.length > 0) {
        [a, b] = args.pop();
        // strictly equal must be equal. matches referentially equal values.
        if (a === b)
            continue;
        // unequal types and functions (unless referentially equivalent) cannot be equal.
        const ctor = getConstructor(a);
        if (ctor !== getConstructor(b) || isFunction(a))
            return false;
        // string convertable types
        if (STRING_CONVERTERS.has(ctor)) {
            const str = STRING_CONVERTERS.get(ctor);
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            if (str(a) !== str(b))
                return false;
            // values are equal, so move next
            continue;
        }
        // handle array and object types
        if (ctor === Array || ctor === Object) {
            const ka = Object.keys(a);
            const kb = Object.keys(b);
            if (ka.length !== kb.length)
                return false;
            if (new Set(ka.concat(kb)).size != ka.length)
                return false;
            for (const k of ka)
                args.push([a[k], b[k]]);
            // move next
            continue;
        }
        // user-defined type detected.
        // we don't try to compare user-defined types (even though we could...shhhh).
        return false;
    }
    // nothing left to compare
    return !args.length;
}
/**
 * Encode value to string using a simple non-colliding stable scheme.
 * Handles user-defined types by processing keys on first non-empty prototype.
 * If a user-defined type provides a "toJSON" function, it is used.
 *
 * @param value The value to convert to a string representation.
 * @returns {String}
 */
function stringify(value) {
    const cycle = new Set();
    // stringify with cycle check
    const str = (v) => {
        const ctor = getConstructor(v);
        // string convertable types
        if (STRING_CONVERTERS.has(ctor)) {
            return STRING_CONVERTERS.get(ctor)(v);
        }
        const tag = ctor === Object ? "" : ctor.name;
        // handle JSONable objects.
        if (isFunction(v["toJSON"])) {
            return `${tag}(${JSON.stringify(v)})`;
        }
        // handle cycles
        if (cycle.has(v))
            throw CYCLE_FOUND_ERROR;
        cycle.add(v);
        try {
            // handle array
            if (ctor === Array) {
                return "[" + v.map(str).join(",") + "]";
            }
            // handle user-defined object
            if (ctor !== Object) {
                // handle user-defined types or object literals.
                const [members, _] = getMembersOf(v);
                // custom type derived from array.
                if (isArray(v)) {
                    // include other members as part of array elements.
                    return `${tag}${str([...v, members])}`;
                }
                // get members as literal
                v = members;
            }
            const objKeys = Object.keys(v);
            objKeys.sort();
            return (`${tag}{` +
                objKeys.map(k => `${k}:${str(v[k])}`).join(",") +
                "}");
        }
        finally {
            cycle.delete(v);
        }
    };
    // convert to string
    return str(value);
}
/**
 * Generate hash code
 * This selected function is the result of benchmarking various hash functions.
 * This version performs well and can hash 10^6 documents in ~3s with on average 100 collisions.
 *
 * @param value
 * @returns {number|null}
 */
function hashCode(value, hashFunction) {
    hashFunction = hashFunction || DEFAULT_HASH_FUNCTION;
    if (isNil(value))
        return null;
    return hashFunction(value).toString();
}
/**
 * Returns a (stably) sorted copy of list, ranked in ascending order by the results of running each value through iteratee
 *
 * This implementation treats null/undefined sort keys as less than every other type
 *
 * @param {Array}   collection
 * @param {Function} keyFn The sort key function used to resolve sort keys
 * @param {Function} comparator The comparator function to use for comparing keys. Defaults to standard comparison via `compare(...)`
 * @return {Array} Returns a new sorted array by the given key and comparator function
 */
function sortBy(collection, keyFn, comparator = compare$1) {
    if (isEmpty(collection))
        return collection;
    const sorted = new Array();
    const result = new Array();
    for (let i = 0; i < collection.length; i++) {
        const obj = collection[i];
        const key = keyFn(obj, i);
        if (isNil(key)) {
            result.push(obj);
        }
        else {
            sorted.push([key, obj]);
        }
    }
    // use native array sorting but enforce stableness
    sorted.sort((a, b) => comparator(a[0], b[0]));
    return into(result, sorted.map((o) => o[1]));
}
/**
 * Groups the collection into sets by the returned key
 *
 * @param collection
 * @param keyFn {Function} to compute the group key of an item in the collection
 * @returns {GroupByOutput}
 */
function groupBy(collection, keyFn, hashFunction = DEFAULT_HASH_FUNCTION) {
    if (collection.length < 1)
        return new Map();
    // map of hash to collided values
    const lookup = new Map();
    // map of raw key values to objects.
    const result = new Map();
    for (let i = 0; i < collection.length; i++) {
        const obj = collection[i];
        const key = keyFn(obj, i);
        const hash = hashCode(key, hashFunction);
        if (hash === null) {
            if (result.has(null)) {
                result.get(null).push(obj);
            }
            else {
                result.set(null, [obj]);
            }
        }
        else {
            // find if we can match a hash for which the value is equivalent.
            // this is used to deal with collisions.
            const existingKey = lookup.has(hash)
                ? lookup.get(hash).find(k => isEqual(k, key))
                : null;
            // collision detected or first time seeing key
            if (isNil(existingKey)) {
                // collision detected or first entry so we create a new group.
                result.set(key, [obj]);
                // upload the lookup with the collided key
                if (lookup.has(hash)) {
                    lookup.get(hash).push(key);
                }
                else {
                    lookup.set(hash, [key]);
                }
            }
            else {
                // key exists
                result.get(existingKey).push(obj);
            }
        }
    }
    return result;
}
// max elements to push.
// See argument limit https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
const MAX_ARRAY_PUSH = 50000;
/**
 * Merge elements into the dest
 *
 * @param {*} target The target object
 * @param {*} rest The array of elements to merge into dest
 */
function into(target, ...rest) {
    if (target instanceof Array) {
        return rest.reduce(((acc, arr) => {
            // push arrary in batches to handle large inputs
            let i = Math.ceil(arr.length / MAX_ARRAY_PUSH);
            let begin = 0;
            while (i-- > 0) {
                Array.prototype.push.apply(acc, arr.slice(begin, begin + MAX_ARRAY_PUSH));
                begin += MAX_ARRAY_PUSH;
            }
            return acc;
        }), target);
    }
    else {
        // merge objects. same behaviour as Object.assign
        return rest.filter(isObjectLike).reduce((acc, item) => {
            Object.assign(acc, item);
            return acc;
        }, target);
    }
}
// mingo internal
/**
 * Retrieve the value of a given key on an object
 * @param obj
 * @param key
 * @returns {*}
 * @private
 */
function getValue(obj, key) {
    return isObjectLike(obj) ? obj[key] : undefined;
}
/**
 * Unwrap a single element array to specified depth
 * @param {Array} arr
 * @param {Number} depth
 */
function unwrap(arr, depth) {
    if (depth < 1)
        return arr;
    while (depth-- && arr.length === 1)
        arr = arr[0];
    return arr;
}
/**
 * Resolve the value of the field (dot separated) on the given object
 * @param obj {Object} the object context
 * @param selector {String} dot separated path to field
 * @returns {*}
 */
function resolve(obj, selector, options) {
    let depth = 0;
    function resolve2(o, path) {
        let value = o;
        for (let i = 0; i < path.length; i++) {
            const field = path[i];
            const isText = /^\d+$/.exec(field) === null;
            // using instanceof to aid typescript compiler
            if (isText && value instanceof Array) {
                // On the first iteration, we check if we received a stop flag.
                // If so, we stop to prevent iterating over a nested array value
                // on consecutive object keys in the selector.
                if (i === 0 && depth > 0)
                    break;
                depth += 1;
                // only look at the rest of the path
                const subpath = path.slice(i);
                value = value.reduce((acc, item) => {
                    const v = resolve2(item, subpath);
                    if (v !== undefined)
                        acc.push(v);
                    return acc;
                }, []);
                break;
            }
            else {
                value = getValue(value, field);
            }
            if (value === undefined)
                break;
        }
        return value;
    }
    const result = JS_SIMPLE_TYPES.has(getType(obj).toLowerCase())
        ? obj
        : resolve2(obj, selector.split("."));
    return result instanceof Array && (options === null || options === void 0 ? void 0 : options.unwrapArray)
        ? unwrap(result, depth)
        : result;
}
/**
 * Returns the full object to the resolved value given by the selector.
 * This function excludes empty values as they aren't practically useful.
 *
 * @param obj {Object} the object context
 * @param selector {String} dot separated path to field
 */
function resolveGraph(obj, selector, options) {
    const names = selector.split(".");
    const key = names[0];
    // get the next part of the selector
    const next = names.slice(1).join(".");
    const isIndex = /^\d+$/.exec(key) !== null;
    const hasNext = names.length > 1;
    let result;
    let value;
    if (obj instanceof Array) {
        if (isIndex) {
            result = getValue(obj, Number(key));
            if (hasNext) {
                result = resolveGraph(result, next, options);
            }
            result = [result];
        }
        else {
            result = [];
            for (const item of obj) {
                value = resolveGraph(item, selector, options);
                if (options === null || options === void 0 ? void 0 : options.preserveMissing) {
                    if (value === undefined) {
                        value = MISSING;
                    }
                    result.push(value);
                }
                else if (value !== undefined) {
                    result.push(value);
                }
            }
        }
    }
    else {
        value = getValue(obj, key);
        if (hasNext) {
            value = resolveGraph(value, next, options);
        }
        if (value === undefined)
            return undefined;
        result = (options === null || options === void 0 ? void 0 : options.preserveKeys) ? Object.assign({}, obj) : {};
        result[key] = value;
    }
    return result;
}
/**
 * Filter out all MISSING values from the object in-place
 *
 * @param obj The object to filter
 */
function filterMissing(obj) {
    if (obj instanceof Array) {
        for (let i = obj.length - 1; i >= 0; i--) {
            if (obj[i] === MISSING) {
                obj.splice(i, 1);
            }
            else {
                filterMissing(obj[i]);
            }
        }
    }
    else if (isObject(obj)) {
        for (const k in obj) {
            if (has(obj, k)) {
                filterMissing(obj[k]);
            }
        }
    }
}
const NUMBER_RE = /^\d+$/;
/**
 * Walk the object graph and execute the given transform function
 *
 * @param  {Object|Array} obj   The object to traverse.
 * @param  {String} selector    The selector to navigate.
 * @param  {Callback} fn Callback to execute for value at the end the traversal.
 * @param  {WalkOptions} options The opetions to use for the function.
 * @return {*}
 */
function walk(obj, selector, fn, options) {
    const names = selector.split(".");
    const key = names[0];
    const next = names.slice(1).join(".");
    if (names.length === 1) {
        if (isObject(obj) || (isArray(obj) && NUMBER_RE.test(key))) {
            fn(obj, key);
        }
    }
    else {
        // force the rest of the graph while traversing
        if ((options === null || options === void 0 ? void 0 : options.buildGraph) && isNil(obj[key])) {
            obj[key] = {};
        }
        // get the next item
        const item = obj[key];
        // nothing more to do
        if (!item)
            return;
        // we peek to see if next key is an array index.
        const isNextArrayIndex = !!(names.length > 1 && NUMBER_RE.test(names[1]));
        // if we have an array value but the next key is not an index and the 'descendArray' option is set,
        // we walk each item in the array separately. This allows for handling traversing keys for objects
        // nested within an array.
        //
        // Eg: Given { array: [ {k:1}, {k:2}, {k:3} ] }
        //  - individual objecs can be traversed with "array.k"
        //  - a specific object can be traversed with "array.1"
        if (item instanceof Array && (options === null || options === void 0 ? void 0 : options.descendArray) && !isNextArrayIndex) {
            item.forEach(((e) => walk(e, next, fn, options)));
        }
        else {
            walk(item, next, fn, options);
        }
    }
}
/**
 * Set the value of the given object field
 *
 * @param obj {Object|Array} the object context
 * @param selector {String} path to field
 * @param value {*} the value to set. if it is function, it is invoked with the old value and must return the new value.
 */
function setValue(obj, selector, value) {
    walk(obj, selector, ((item, key) => {
        item[key] = isFunction(value) ? value(item[key]) : value;
    }), { buildGraph: true });
}
/**
 * Removes an element from the container.
 * If the selector resolves to an array and the leaf is a non-numeric key,
 * the remove operation will be performed on objects of the array.
 *
 * @param obj {ArrayOrObject} object or array
 * @param selector {String} dot separated path to element to remove
 */
function removeValue(obj, selector, options) {
    walk(obj, selector, ((item, key) => {
        if (item instanceof Array) {
            if (/^\d+$/.test(key)) {
                item.splice(parseInt(key), 1);
            }
            else if (options && options.descendArray) {
                for (const elem of item) {
                    if (isObject(elem)) {
                        delete elem[key];
                    }
                }
            }
        }
        else if (isObject(item)) {
            delete item[key];
        }
    }), options);
}
const OPERATOR_NAME_PATTERN = /^\$[a-zA-Z0-9_]+$/;
/**
 * Check whether the given name passes for an operator. We assume AnyVal field name starting with '$' is an operator.
 * This is cheap and safe to do since keys beginning with '$' should be reserved for internal use.
 * @param {String} name
 */
function isOperator(name) {
    return OPERATOR_NAME_PATTERN.test(name);
}
/**
 * Simplify expression for easy evaluation with query operators map
 * @param expr
 * @returns {*}
 */
function normalize(expr) {
    // normalized primitives
    if (JS_SIMPLE_TYPES.has(getType(expr).toLowerCase())) {
        return isRegExp(expr) ? { $regex: expr } : { $eq: expr };
    }
    // normalize object expression. using ObjectLike handles custom types
    if (isObjectLike(expr)) {
        const exprObj = expr;
        // no valid query operator found, so we do simple comparison
        if (!Object.keys(exprObj).some(isOperator)) {
            return { $eq: expr };
        }
        // ensure valid regex
        if (has(expr, "$regex")) {
            const newExpr = Object.assign({}, expr);
            newExpr["$regex"] = new RegExp(expr["$regex"], expr["$options"]);
            delete newExpr["$options"];
            return newExpr;
        }
    }
    return expr;
}

/**
 * This controls how input and output documents are processed to meet different application needs.
 * Each mode has different trade offs for; immutability, reference sharing, and performance.
 */
var ProcessingMode;
(function (ProcessingMode) {
    /**
     * Clone inputs prior to processing, and the outputs if some objects graphs may be shared.
     * Use this option to keep input collection immutable and to get distinct output objects.
     *
     * Note: This option is expensive and reduces performance.
     */
    ProcessingMode["CLONE_ALL"] = "CLONE_ALL";
    /**
     * Clones inputs prior to processing.
     * This option will return output objects with shared graphs in their path if specific operators are used.
     * Use this option to keep the input collection immutable.
     *
     */
    ProcessingMode["CLONE_INPUT"] = "CLONE_INPUT";
    /**
     * Clones the output to return distinct objects with no shared paths.
     * This option modifies the input collection and during processing.
     */
    ProcessingMode["CLONE_OUTPUT"] = "CLONE_OUTPUT";
    /**
     * Turn off cloning and modifies the input collection as needed.
     * This option will also return output objects with shared paths in their graph when specific operators are used.
     * This option provides the greatest speedup for the biggest tradeoff.
     * When using the aggregation pipeline, you can use the "$out" operator to collect immutable intermediate results.
     *
     * @default
     */
    ProcessingMode["CLONE_OFF"] = "CLONE_OFF";
})(ProcessingMode || (ProcessingMode = {}));
/** Custom type to facilitate type checking for global options */
class ComputeOptions {
    constructor(_opts, 
    /** Reference to the root object when processing subgraphs of the object. */
    _root, _local, 
    /** The current time in milliseconds. Remains the same throughout all stages of the aggregation pipeline. */
    timestamp = Date.now()) {
        this._opts = _opts;
        this._root = _root;
        this._local = _local;
        this.timestamp = timestamp;
        this.update(_root, _local);
    }
    /**
     * Initialize new ComputeOptions.
     *
     * @param options
     * @param root
     * @param local
     * @returns {ComputeOptions}
     */
    static init(options, root, local) {
        return options instanceof ComputeOptions
            ? new ComputeOptions(options._opts, isNil(options.root) ? root : options.root, Object.assign({}, options.local, local))
            : new ComputeOptions(options, root, local);
    }
    /** Updates the internal mutable state. */
    update(root, local) {
        var _a;
        // NOTE: this is done for efficiency to avoid creating too many intermediate options objects.
        this._root = root;
        this._local = local
            ? Object.assign({}, local, {
                variables: Object.assign({}, (_a = this._local) === null || _a === void 0 ? void 0 : _a.variables, local === null || local === void 0 ? void 0 : local.variables)
            })
            : local;
        return this;
    }
    getOptions() {
        return Object.freeze(Object.assign(Object.assign({}, this._opts), { context: Context.from(this._opts.context) }));
    }
    get root() {
        return this._root;
    }
    get local() {
        return this._local;
    }
    get idKey() {
        return this._opts.idKey;
    }
    get collation() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.collation;
    }
    get processingMode() {
        var _a;
        return ((_a = this._opts) === null || _a === void 0 ? void 0 : _a.processingMode) || ProcessingMode.CLONE_OFF;
    }
    get useStrictMode() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.useStrictMode;
    }
    get scriptEnabled() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.scriptEnabled;
    }
    get useGlobalContext() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.useGlobalContext;
    }
    get hashFunction() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.hashFunction;
    }
    get collectionResolver() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.collectionResolver;
    }
    get jsonSchemaValidator() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.jsonSchemaValidator;
    }
    get variables() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.variables;
    }
    get context() {
        var _a;
        return (_a = this._opts) === null || _a === void 0 ? void 0 : _a.context;
    }
}
/**
 * Creates an Option from another where required keys are initialized.
 * @param options Options
 */
function initOptions(options) {
    return options instanceof ComputeOptions
        ? options.getOptions()
        : Object.freeze(Object.assign(Object.assign({ idKey: "_id", scriptEnabled: true, useStrictMode: true, useGlobalContext: true, processingMode: ProcessingMode.CLONE_OFF }, options), { context: (options === null || options === void 0 ? void 0 : options.context)
                ? Context.from(options === null || options === void 0 ? void 0 : options.context)
                : Context.init({}) }));
}
/**
 * The different groups of operators
 */
var OperatorType;
(function (OperatorType) {
    OperatorType["ACCUMULATOR"] = "accumulator";
    OperatorType["EXPRESSION"] = "expression";
    OperatorType["PIPELINE"] = "pipeline";
    OperatorType["PROJECTION"] = "projection";
    OperatorType["QUERY"] = "query";
    OperatorType["WINDOW"] = "window";
})(OperatorType || (OperatorType = {}));
class Context {
    constructor(ops) {
        this.operators = {
            [OperatorType.ACCUMULATOR]: {},
            [OperatorType.EXPRESSION]: {},
            [OperatorType.PIPELINE]: {},
            [OperatorType.PROJECTION]: {},
            [OperatorType.QUERY]: {},
            [OperatorType.WINDOW]: {}
        };
        for (const [type, operators] of Object.entries(ops)) {
            this.addOperators(type, operators);
        }
    }
    static init(ops = {}) {
        return new Context(ops);
    }
    static from(ctx) {
        return new Context(ctx.operators);
    }
    addOperators(type, ops) {
        for (const [name, fn] of Object.entries(ops)) {
            if (!this.getOperator(type, name)) {
                this.operators[type][name] = fn;
            }
        }
        return this;
    }
    // register
    addAccumulatorOps(ops) {
        return this.addOperators(OperatorType.ACCUMULATOR, ops);
    }
    addExpressionOps(ops) {
        return this.addOperators(OperatorType.EXPRESSION, ops);
    }
    addQueryOps(ops) {
        return this.addOperators(OperatorType.QUERY, ops);
    }
    addPipelineOps(ops) {
        return this.addOperators(OperatorType.PIPELINE, ops);
    }
    addProjectionOps(ops) {
        return this.addOperators(OperatorType.PROJECTION, ops);
    }
    addWindowOps(ops) {
        return this.addOperators(OperatorType.WINDOW, ops);
    }
    // getters
    getOperator(type, name) {
        return type in this.operators ? this.operators[type][name] || null : null;
    }
}
// global context
const GLOBAL_CONTEXT = Context.init();
/**
 * Register fully specified operators for the given operator class.
 *
 * @param type The operator type
 * @param operators Map of the operators
 */
function useOperators(type, operators) {
    for (const [name, fn] of Object.entries(operators)) {
        assert(isFunction(fn) && isOperator(name), `'${name}' is not a valid operator`);
        const currentFn = getOperator(type, name, null);
        assert(!currentFn || fn === currentFn, `${name} already exists for '${type}' operators. Cannot change operator function once registered.`);
    }
    // toss the operator salad :)
    switch (type) {
        case OperatorType.ACCUMULATOR:
            GLOBAL_CONTEXT.addAccumulatorOps(operators);
            break;
        case OperatorType.EXPRESSION:
            GLOBAL_CONTEXT.addExpressionOps(operators);
            break;
        case OperatorType.PIPELINE:
            GLOBAL_CONTEXT.addPipelineOps(operators);
            break;
        case OperatorType.PROJECTION:
            GLOBAL_CONTEXT.addProjectionOps(operators);
            break;
        case OperatorType.QUERY:
            GLOBAL_CONTEXT.addQueryOps(operators);
            break;
        case OperatorType.WINDOW:
            GLOBAL_CONTEXT.addWindowOps(operators);
            break;
    }
}
/**
 * Overrides the current global context with this new one.
 *
 * @param context The new context to override the global one with.
 */
// export const setGlobalContext = (context: Context): void => {
//   GLOBAL_CONTEXT = context;
// };
/**
 * Returns the operator function or undefined if it is not found
 * @param type Type of operator
 * @param operator Name of the operator
 */
function getOperator(type, operator, options) {
    const { context: ctx, useGlobalContext: fallback } = options || {};
    const fn = ctx ? ctx.getOperator(type, operator) : null;
    return !fn && fallback ? GLOBAL_CONTEXT.getOperator(type, operator) : fn;
}
/* eslint-disable unused-imports/no-unused-vars-ts */
/**
 * Implementation of system variables
 * @type {Object}
 */
const systemVariables = {
    $$ROOT(_obj, _expr, options) {
        return options.root;
    },
    $$CURRENT(obj, _expr, _options) {
        return obj;
    },
    $$REMOVE(_obj, _expr, _options) {
        return undefined;
    },
    $$NOW(_obj, _expr, options) {
        return new Date(options.timestamp);
    }
};
/**
 * Implementation of $redact variables
 *
 * Each function accepts 3 arguments (obj, expr, options)
 *
 * @type {Object}
 */
const redactVariables = {
    $$KEEP(obj, _expr, _options) {
        return obj;
    },
    $$PRUNE(_obj, _expr, _options) {
        return undefined;
    },
    $$DESCEND(obj, expr, options) {
        // traverse nested documents iff there is a $cond
        if (!has(expr, "$cond"))
            return obj;
        let result;
        for (const [key, current] of Object.entries(obj)) {
            if (isObjectLike(current)) {
                if (current instanceof Array) {
                    const array = [];
                    for (let elem of current) {
                        if (isObject(elem)) {
                            elem = redact(elem, expr, options.update(elem));
                        }
                        if (!isNil(elem)) {
                            array.push(elem);
                        }
                    }
                    result = array;
                }
                else {
                    result = redact(current, expr, options.update(current));
                }
                if (isNil(result)) {
                    delete obj[key]; // pruned result
                }
                else {
                    obj[key] = result;
                }
            }
        }
        return obj;
    }
};
/* eslint-enable unused-imports/no-unused-vars-ts */
/**
 * Computes the value of the expression on the object for the given operator
 *
 * @param obj the current object from the collection
 * @param expr the expression for the given field
 * @param operator the operator to resolve the field with
 * @param options {Object} extra options
 * @returns {*}
 */
function computeValue(obj, expr, operator, options) {
    var _a;
    // ensure valid options exist on first invocation
    const copts = ComputeOptions.init(options, obj);
    operator = operator || "";
    if (isOperator(operator)) {
        // if the field of the object is a valid operator
        const callExpression = getOperator(OperatorType.EXPRESSION, operator, options);
        if (callExpression)
            return callExpression(obj, expr, copts);
        // we also handle $group accumulator operators
        const callAccumulator = getOperator(OperatorType.ACCUMULATOR, operator, options);
        if (callAccumulator) {
            // if object is not an array, first try to compute using the expression
            if (!(obj instanceof Array)) {
                obj = computeValue(obj, expr, null, copts);
                expr = null;
            }
            // validate that we have an array
            assert(obj instanceof Array, `'${operator}' target must be an array.`);
            // for accumulators, we use the global options since the root is specific to each element within array.
            return callAccumulator(obj, expr, 
            // reset the root object for accumulators.
            copts.update(null, copts.local));
        }
        // operator was not found
        throw new MingoError(`operator '${operator}' is not registered`);
    }
    // if expr is a string and begins with "$$", then we have a variable.
    //  this can be one of; redact variable, system variable, user-defined variable.
    //  we check and process them in that order.
    //
    // if expr begins only a single "$", then it is a path to a field on the object.
    if (isString(expr) && expr.length > 0 && expr[0] === "$") {
        // we return redact variables as literals
        if (has(redactVariables, expr)) {
            return expr;
        }
        // default to root for resolving path.
        let context = copts.root;
        // handle selectors with explicit prefix
        const arr = expr.split(".");
        if (has(systemVariables, arr[0])) {
            // set 'root' only the first time it is required to be used for all subsequent calls
            // if it already available on the options, it will be used
            context = systemVariables[arr[0]](obj, null, copts);
            expr = expr.slice(arr[0].length + 1); //  +1 for '.'
        }
        else if (arr[0].slice(0, 2) === "$$") {
            // handle user-defined variables
            context = Object.assign({}, copts.variables, // global vars
            // current item is added before local variables because the binding may be changed.
            { this: obj }, (_a = copts.local) === null || _a === void 0 ? void 0 : _a.variables // local vars
            );
            const prefix = arr[0].slice(2);
            assert(has(context, prefix), `Use of undefined variable: ${prefix}`);
            expr = expr.slice(2);
        }
        else {
            // 'expr' is a path to a field on the object.
            expr = expr.slice(1);
        }
        if (expr === "")
            return context;
        return resolve(context, expr);
    }
    // check and return value if already in a resolved state
    if (isArray(expr)) {
        return expr.map((item) => computeValue(obj, item, null, copts));
    }
    else if (isObject(expr)) {
        const result = {};
        for (const [key, val] of Object.entries(expr)) {
            result[key] = computeValue(obj, val, key, copts);
            // must run ONLY one aggregate operator per expression
            // if so, return result of the computed value
            if ([OperatorType.EXPRESSION, OperatorType.ACCUMULATOR].some(t => !!getOperator(t, key, options))) {
                // there should be only one operator
                assert(Object.keys(expr).length === 1, "Invalid aggregation expression '" + JSON.stringify(expr) + "'");
                return result[key];
            }
        }
        return result;
    }
    return expr;
}
/**
 * Redact an object
 * @param  {Object} obj The object to redact
 * @param  {*} expr The redact expression
 * @param  {*} options  Options for value
 * @return {*} returns the result of the redacted object
 */
function redact(obj, expr, options) {
    const result = computeValue(obj, expr, null, options);
    return has(redactVariables, result)
        ? redactVariables[result](obj, expr, options)
        : result;
}

/**
 * Returns an iterator
 * @param {*} source An iterable source (Array, Function, Generator, or Iterator)
 */
function Lazy(source) {
    return source instanceof Iterator ? source : new Iterator(source);
}
function compose(...iterators) {
    let index = 0;
    return Lazy(() => {
        while (index < iterators.length) {
            const o = iterators[index].next();
            if (!o.done)
                return o;
            index++;
        }
        return { done: true };
    });
}
/**
 * Checks whether the given object is compatible with a generator i.e Object{next:Function}
 * @param {*} o An object
 */
function isGenerator(o) {
    return (!!o && typeof o === "object" && (o === null || o === void 0 ? void 0 : o.next) instanceof Function);
}
function dropItem(array, i) {
    const rest = array.slice(i + 1);
    array.splice(i);
    Array.prototype.push.apply(array, rest);
}
// stop iteration error
const DONE = new Error();
// Lazy function actions
var Action;
(function (Action) {
    Action[Action["MAP"] = 0] = "MAP";
    Action[Action["FILTER"] = 1] = "FILTER";
    Action[Action["TAKE"] = 2] = "TAKE";
    Action[Action["DROP"] = 3] = "DROP";
})(Action || (Action = {}));
function createCallback(nextFn, iteratees, buffer) {
    let done = false;
    let index = -1;
    let bufferIndex = 0; // index for the buffer
    return function (storeResult) {
        // special hack to collect all values into buffer
        try {
            outer: while (!done) {
                let o = nextFn();
                index++;
                let i = -1;
                const size = iteratees.length;
                let innerDone = false;
                while (++i < size) {
                    const r = iteratees[i];
                    switch (r.action) {
                        case Action.MAP:
                            o = r.func(o, index);
                            break;
                        case Action.FILTER:
                            if (!r.func(o, index))
                                continue outer;
                            break;
                        case Action.TAKE:
                            --r.count;
                            if (!r.count)
                                innerDone = true;
                            break;
                        case Action.DROP:
                            --r.count;
                            if (!r.count)
                                dropItem(iteratees, i);
                            continue outer;
                        default:
                            break outer;
                    }
                }
                done = innerDone;
                if (storeResult) {
                    buffer[bufferIndex++] = o;
                }
                else {
                    return { value: o, done: false };
                }
            }
        }
        catch (e) {
            if (e !== DONE)
                throw e;
        }
        done = true;
        return { done };
    };
}
/**
 * A lazy collection iterator yields a single value at a time upon request.
 */
class Iterator {
    /**
     * @param {*} source An iterable object or function.
     *    Array - return one element per cycle
     *    Object{next:Function} - call next() for the next value (this also handles generator functions)
     *    Function - call to return the next value
     * @param {Function} fn An optional transformation function
     */
    constructor(source) {
        this.iteratees = [];
        this.yieldedValues = [];
        this.isDone = false;
        let nextVal;
        if (source instanceof Function) {
            // make iterable
            source = { next: source };
        }
        if (isGenerator(source)) {
            const src = source;
            nextVal = () => {
                const o = src.next();
                if (o.done)
                    throw DONE;
                return o.value;
            };
        }
        else if (source instanceof Array) {
            const data = source;
            const size = data.length;
            let index = 0;
            nextVal = () => {
                if (index < size)
                    return data[index++];
                throw DONE;
            };
        }
        else if (!(source instanceof Function)) {
            throw new MingoError(`Lazy must be initialized with an array, generator, or function.`);
        }
        // create next function
        this.getNext = createCallback(nextVal, this.iteratees, this.yieldedValues);
    }
    /**
     * Add an iteratee to this lazy sequence
     */
    push(action, value) {
        if (typeof value === "function") {
            this.iteratees.push({ action, func: value });
        }
        else if (typeof value === "number") {
            this.iteratees.push({ action, count: value });
        }
        return this;
    }
    next() {
        return this.getNext();
    }
    // Iteratees methods
    /**
     * Transform each item in the sequence to a new value
     * @param {Function} f
     */
    map(f) {
        return this.push(Action.MAP, f);
    }
    /**
     * Select only items matching the given predicate
     * @param {Function} pred
     */
    filter(predicate) {
        return this.push(Action.FILTER, predicate);
    }
    /**
     * Take given numbe for values from sequence
     * @param {Number} n A number greater than 0
     */
    take(n) {
        return n > 0 ? this.push(Action.TAKE, n) : this;
    }
    /**
     * Drop a number of values from the sequence
     * @param {Number} n Number of items to drop greater than 0
     */
    drop(n) {
        return n > 0 ? this.push(Action.DROP, n) : this;
    }
    // Transformations
    /**
     * Returns a new lazy object with results of the transformation
     * The entire sequence is realized.
     *
     * @param {Callback<Source, RawArray>} fn Tranform function of type (Array) => (Any)
     */
    transform(fn) {
        const self = this;
        let iter;
        return Lazy(() => {
            if (!iter) {
                iter = Lazy(fn(self.value()));
            }
            return iter.next();
        });
    }
    // Terminal methods
    /**
     * Returns the fully realized values of the iterators.
     * The return value will be an array unless `lazy.first()` was used.
     * The realized values are cached for subsequent calls.
     */
    value() {
        if (!this.isDone) {
            this.isDone = this.getNext(true).done;
        }
        return this.yieldedValues;
    }
    /**
     * Execute the funcion for each value. Will stop when an execution returns false.
     * @param {Function} f
     * @returns {Boolean} false iff `f` return false for AnyVal execution, otherwise true
     */
    each(f) {
        for (;;) {
            const o = this.next();
            if (o.done)
                break;
            if (f(o.value) === false)
                return false;
        }
        return true;
    }
    /**
     * Returns the reduction of sequence according the reducing function
     *
     * @param {*} f a reducing function
     * @param {*} initialValue
     */
    reduce(f, initialValue) {
        let o = this.next();
        if (initialValue === undefined && !o.done) {
            initialValue = o.value;
            o = this.next();
        }
        while (!o.done) {
            initialValue = f(initialValue, o.value);
            o = this.next();
        }
        return initialValue;
    }
    /**
     * Returns the number of matched items in the sequence
     */
    size() {
        return this.reduce(((acc, _) => ++acc), 0);
    }
    [Symbol.iterator]() {
        /* eslint-disable @typescript-eslint/no-unsafe-return */
        return this;
    }
}

/**
 * Provides functionality for the mongoDB aggregation pipeline
 *
 * @param pipeline an Array of pipeline operators
 * @param options An optional Options to pass the aggregator
 * @constructor
 */
class Aggregator {
    constructor(pipeline, options) {
        this.pipeline = pipeline;
        this.options = initOptions(options);
    }
    /**
     * Returns an `Lazy` iterator for processing results of pipeline
     *
     * @param {*} collection An array or iterator object
     * @returns {Iterator} an iterator object
     */
    stream(collection) {
        let iterator = Lazy(collection);
        const mode = this.options.processingMode;
        if (mode == ProcessingMode.CLONE_ALL ||
            mode == ProcessingMode.CLONE_INPUT) {
            iterator.map(cloneDeep);
        }
        const pipelineOperators = new Array();
        if (!isEmpty(this.pipeline)) {
            // run aggregation pipeline
            for (const operator of this.pipeline) {
                const operatorKeys = Object.keys(operator);
                const opName = operatorKeys[0];
                const call = getOperator(OperatorType.PIPELINE, opName, this.options);
                assert(operatorKeys.length === 1 && !!call, `invalid pipeline operator ${opName}`);
                pipelineOperators.push(opName);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                iterator = call(iterator, operator[opName], this.options);
            }
        }
        // operators that may share object graphs of inputs.
        // we only need to clone the output for these since the objects will already be distinct for other operators.
        if (mode == ProcessingMode.CLONE_OUTPUT ||
            (mode == ProcessingMode.CLONE_ALL &&
                !!intersection([["$group", "$unwind"], pipelineOperators]).length)) {
            iterator.map(cloneDeep);
        }
        return iterator;
    }
    /**
     * Return the results of the aggregation as an array.
     *
     * @param {*} collection
     * @param {*} query
     */
    run(collection) {
        return this.stream(collection).value();
    }
}

/**
 * Cursor to iterate and perform filtering on matched objects.
 * This object must not be used directly. A cursor may be obtaine from calling `find()` on an instance of `Query`.
 *
 * @param collection The input source of the collection
 * @param predicate A predicate function to test documents
 * @param projection A projection criteria
 * @param options Options
 * @constructor
 */
class Cursor {
    constructor(source, predicate, projection, options) {
        this.source = source;
        this.predicate = predicate;
        this.projection = projection;
        this.options = options;
        this.operators = [];
        this.result = null;
        this.buffer = [];
    }
    /** Returns the iterator from running the query */
    fetch() {
        if (this.result)
            return this.result;
        // add projection operator
        if (isObject(this.projection)) {
            this.operators.push({ $project: this.projection });
        }
        // filter collection
        this.result = Lazy(this.source).filter(this.predicate);
        if (this.operators.length > 0) {
            this.result = new Aggregator(this.operators, this.options).stream(this.result);
        }
        return this.result;
    }
    /** Returns an iterator with the buffered data included */
    fetchAll() {
        const buffered = Lazy([...this.buffer]);
        this.buffer = [];
        return compose(buffered, this.fetch());
    }
    /**
     * Return remaining objects in the cursor as an array. This method exhausts the cursor
     * @returns {Array}
     */
    all() {
        return this.fetchAll().value();
    }
    /**
     * Returns the number of objects return in the cursor. This method exhausts the cursor
     * @returns {Number}
     */
    count() {
        return this.all().length;
    }
    /**
     * Returns a cursor that begins returning results only after passing or skipping a number of documents.
     * @param {Number} n the number of results to skip.
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */
    skip(n) {
        this.operators.push({ $skip: n });
        return this;
    }
    /**
     * Constrains the size of a cursor's result set.
     * @param {Number} n the number of results to limit to.
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */
    limit(n) {
        this.operators.push({ $limit: n });
        return this;
    }
    /**
     * Returns results ordered according to a sort specification.
     * @param {Object} modifier an object of key and values specifying the sort order. 1 for ascending and -1 for descending
     * @return {Cursor} Returns the cursor, so you can chain this call.
     */
    sort(modifier) {
        this.operators.push({ $sort: modifier });
        return this;
    }
    /**
     * Specifies the collation for the cursor returned by the `mingo.Query.find`
     * @param {*} spec
     */
    collation(spec) {
        this.options = Object.assign(Object.assign({}, this.options), { collation: spec });
        return this;
    }
    /**
     * Returns the next document in a cursor.
     * @returns {Object | Boolean}
     */
    next() {
        // yield value obtains in hasNext()
        if (this.buffer.length > 0) {
            return this.buffer.pop();
        }
        const o = this.fetch().next();
        if (o.done)
            return;
        return o.value;
    }
    /**
     * Returns true if the cursor has documents and can be iterated.
     * @returns {boolean}
     */
    hasNext() {
        // there is a value in the buffer
        if (this.buffer.length > 0)
            return true;
        const o = this.fetch().next();
        if (o.done)
            return false;
        this.buffer.push(o.value);
        return true;
    }
    /**
     * Applies a function to each document in a cursor and collects the return values in an array.
     * @param fn
     * @returns {Array}
     */
    map(fn) {
        return this.all().map(fn);
    }
    /**
     * Applies a JavaScript function for every document in a cursor.
     * @param fn
     */
    forEach(fn) {
        this.all().forEach(fn);
    }
    [Symbol.iterator]() {
        return this.fetchAll();
    }
}

/**
 * An object used to filter input documents
 *
 * @param {Object} condition The condition for constructing predicates
 * @param {Options} options Options for use by operators
 * @constructor
 */
class Query {
    constructor(condition, options) {
        this.condition = condition;
        this.options = initOptions(options);
        this.compiled = [];
        this.compile();
    }
    compile() {
        assert(isObject(this.condition), `query criteria must be an object: ${JSON.stringify(this.condition)}`);
        const whereOperator = {};
        for (const [field, expr] of Object.entries(this.condition)) {
            if ("$where" === field) {
                Object.assign(whereOperator, { field: field, expr: expr });
            }
            else if (inArray(["$and", "$or", "$nor", "$expr", "$jsonSchema"], field)) {
                this.processOperator(field, field, expr);
            }
            else {
                // normalize expression
                assert(!isOperator(field), `unknown top level operator: ${field}`);
                for (const [operator, val] of Object.entries(normalize(expr))) {
                    this.processOperator(field, operator, val);
                }
            }
            if (whereOperator.field) {
                this.processOperator(whereOperator.field, whereOperator.field, whereOperator.expr);
            }
        }
    }
    processOperator(field, operator, value) {
        const call = getOperator(OperatorType.QUERY, operator, this.options);
        if (!call) {
            throw new MingoError(`unknown query operator ${operator}`);
        }
        const fn = call(field, value, this.options);
        this.compiled.push(fn);
    }
    /**
     * Checks if the object passes the query criteria. Returns true if so, false otherwise.
     *
     * @param obj The object to test
     * @returns {boolean} True or false
     */
    test(obj) {
        for (let i = 0, len = this.compiled.length; i < len; i++) {
            if (!this.compiled[i](obj)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns a cursor to select matching documents from the input source.
     *
     * @param source A source providing a sequence of documents
     * @param projection An optional projection criteria
     * @returns {Cursor} A Cursor for iterating over the results
     */
    find(collection, projection) {
        return new Cursor(collection, ((x) => this.test(x)), projection || {}, this.options);
    }
    /**
     * Remove matched documents from the collection returning the remainder
     *
     * @param collection An array of documents
     * @returns {Array} A new array with matching elements removed
     */
    remove(collection) {
        return collection.reduce((acc, obj) => {
            if (!this.test(obj))
                acc.push(obj);
            return acc;
        }, []);
    }
}

/**
 * Takes all input documents and returns them in a stream of sorted documents.
 *
 * @param collection
 * @param sortKeys
 * @param  {Object} options
 * @returns {*}
 */
const $sort = (collection, sortKeys, options) => {
    if (isEmpty(sortKeys) || !isObject(sortKeys))
        return collection;
    let cmp = compare$1;
    // check for collation spec on the options
    const collationSpec = options.collation;
    // use collation comparator if provided
    if (isObject(collationSpec) && isString(collationSpec.locale)) {
        cmp = collationComparator(collationSpec);
    }
    return collection.transform((coll) => {
        const modifiers = Object.keys(sortKeys);
        for (const key of modifiers.reverse()) {
            const groups = groupBy(coll, (obj) => resolve(obj, key), options.hashFunction);
            const sortedKeys = Array.from(groups.keys()).sort(cmp);
            if (sortKeys[key] === -1)
                sortedKeys.reverse();
            // reuse collection so the data is available for the next iteration of the sort modifiers.
            coll = [];
            sortedKeys.reduce((acc, key) => into(acc, groups.get(key)), coll);
        }
        return coll;
    });
};
// MongoDB collation strength to JS localeCompare sensitivity mapping.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
const COLLATION_STRENGTH = {
    // Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A.
    1: "base",
    //  Only strings that differ in base letters or accents and other diacritic marks compare as unequal.
    // Examples: a ≠ b, a ≠ á, a = A.
    2: "accent",
    // Strings that differ in base letters, accents and other diacritic marks, or case compare as unequal.
    // Other differences may also be taken into consideration. Examples: a ≠ b, a ≠ á, a ≠ A
    3: "variant"
    // case - Only strings that differ in base letters or case compare as unequal. Examples: a ≠ b, a = á, a ≠ A.
};
/**
 * Creates a comparator function for the given collation spec. See https://docs.mongodb.com/manual/reference/collation/
 *
 * @param spec {Object} The MongoDB collation spec.
 * {
 *   locale: string,
 *   caseLevel: boolean,
 *   caseFirst: string,
 *   strength: int,
 *   numericOrdering: boolean,
 *   alternate: string,
 *   maxVariable: never, // unsupported
 *   backwards: never // unsupported
 * }
 */
function collationComparator(spec) {
    const localeOpt = {
        sensitivity: COLLATION_STRENGTH[spec.strength || 3],
        caseFirst: spec.caseFirst === "off" ? "false" : spec.caseFirst || "false",
        numeric: spec.numericOrdering || false,
        ignorePunctuation: spec.alternate === "shifted"
    };
    // when caseLevel is true for strength  1:base and 2:accent, bump sensitivity to the nearest that supports case comparison
    if ((spec.caseLevel || false) === true) {
        if (localeOpt.sensitivity === "base")
            localeOpt.sensitivity = "case";
        if (localeOpt.sensitivity === "accent")
            localeOpt.sensitivity = "variant";
    }
    const collator = new Intl.Collator(spec.locale, localeOpt);
    return (a, b) => {
        // non strings
        if (!isString(a) || !isString(b))
            return compare$1(a, b);
        // only for strings
        const i = collator.compare(a, b);
        if (i < 0)
            return -1;
        if (i > 0)
            return 1;
        return 0;
    };
}

/**
 * Predicates used for Query and Expression operators.
 */
/**
 * Returns a query operator created from the predicate
 *
 * @param predicate Predicate function
 */
function createQueryOperator(predicate) {
    const f = (selector, value, options) => {
        const opts = { unwrapArray: true };
        const depth = Math.max(1, selector.split(".").length - 1);
        return (obj) => {
            // value of field must be fully resolved.
            const lhs = resolve(obj, selector, opts);
            return predicate(lhs, value, Object.assign(Object.assign({}, options), { depth }));
        };
    };
    f.op = "query";
    return f; // as QueryOperator;
}
/**
 * Checks that two values are equal.
 *
 * @param a         The lhs operand as resolved from the object by the given selector
 * @param b         The rhs operand provided by the user
 * @returns {*}
 */
function $eq$1(a, b, options) {
    // start with simple equality check
    if (isEqual(a, b))
        return true;
    // https://docs.mongodb.com/manual/tutorial/query-for-null-fields/
    if (isNil(a) && isNil(b))
        return true;
    // check
    if (a instanceof Array) {
        const eq = isEqual.bind(null, b);
        return a.some(eq) || flatten(a, options === null || options === void 0 ? void 0 : options.depth).some(eq);
    }
    return false;
}
/**
 * Matches all values that are not equal to the value specified in the query.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $ne$1(a, b, options) {
    return !$eq$1(a, b, options);
}
/**
 * Matches any of the values that exist in an array specified in the query.
 *
 * @param a
 * @param b
 * @returns {*}
 */
function $in$1(a, b, options) {
    // queries for null should be able to find undefined fields
    if (isNil(a))
        return b.some(v => v === null);
    return intersection([ensureArray(a), b], options === null || options === void 0 ? void 0 : options.hashFunction).length > 0;
}
/**
 * Matches values that do not exist in an array specified to the query.
 *
 * @param a
 * @param b
 * @returns {*|boolean}
 */
function $nin$1(a, b, options) {
    return !$in$1(a, b, options);
}
/**
 * Matches values that are less than the value specified in the query.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $lt$1(a, b, _options) {
    return compare(a, b, (x, y) => compare$1(x, y) < 0);
}
/**
 * Matches values that are less than or equal to the value specified in the query.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $lte$1(a, b, _options) {
    return compare(a, b, (x, y) => compare$1(x, y) <= 0);
}
/**
 * Matches values that are greater than the value specified in the query.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $gt$1(a, b, _options) {
    return compare(a, b, (x, y) => compare$1(x, y) > 0);
}
/**
 * Matches values that are greater than or equal to the value specified in the query.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $gte$1(a, b, _options) {
    return compare(a, b, (x, y) => compare$1(x, y) >= 0);
}
/**
 * Performs a modulo operation on the value of a field and selects documents with a specified result.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $mod$1(a, b, _options) {
    return ensureArray(a).some(((x) => b.length === 2 && x % b[0] === b[1]));
}
/**
 * Selects documents where values match a specified regular expression.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $regex$1(a, b, options) {
    const lhs = ensureArray(a);
    const match = (x) => isString(x) && truthy(b.exec(x), options === null || options === void 0 ? void 0 : options.useStrictMode);
    return lhs.some(match) || flatten(lhs, 1).some(match);
}
/**
 * Matches documents that have the specified field.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $exists$1(a, b, _options) {
    return (((b === false || b === 0) && a === undefined) ||
        ((b === true || b === 1) && a !== undefined));
}
/**
 * Matches arrays that contain all elements specified in the query.
 *
 * @param values
 * @param queries
 * @returns boolean
 */
function $all(values, queries, options) {
    if (!isArray(values) ||
        !isArray(queries) ||
        !values.length ||
        !queries.length) {
        return false;
    }
    let matched = true;
    for (const query of queries) {
        // no need to check all the queries.
        if (!matched)
            break;
        if (isObject(query) && inArray(Object.keys(query), "$elemMatch")) {
            matched = $elemMatch$1(values, query["$elemMatch"], options);
        }
        else if (query instanceof RegExp) {
            matched = values.some(s => typeof s === "string" && query.test(s));
        }
        else {
            matched = values.some(v => isEqual(query, v));
        }
    }
    return matched;
}
/**
 * Selects documents if the array field is a specified size.
 *
 * @param a
 * @param b
 * @returns {*|boolean}
 */
function $size$1(a, b, _options) {
    return Array.isArray(a) && a.length === b;
}
function isNonBooleanOperator(name) {
    return isOperator(name) && ["$and", "$or", "$nor"].indexOf(name) === -1;
}
/**
 * Selects documents if element in the array field matches all the specified $elemMatch condition.
 *
 * @param a {Array} element to match against
 * @param b {Object} subquery
 */
function $elemMatch$1(a, b, options) {
    // should return false for non-matching input
    if (isArray(a) && !isEmpty(a)) {
        let format = (x) => x;
        let criteria = b;
        // If we find a boolean operator in the subquery, we fake a field to point to it. This is an
        // attempt to ensure that it is a valid criteria. We cannot make this substitution for operators
        // like $and/$or/$nor; as otherwise, this faking will break our query.
        if (Object.keys(b).every(isNonBooleanOperator)) {
            criteria = { temp: b };
            format = x => ({ temp: x });
        }
        const query = new Query(criteria, options);
        for (let i = 0, len = a.length; i < len; i++) {
            if (query.test(format(a[i]))) {
                return true;
            }
        }
    }
    return false;
}
// helper functions
const isNull = (a) => a === null;
const isInt = (a) => isNumber(a) &&
    a >= MIN_INT &&
    a <= MAX_INT &&
    a.toString().indexOf(".") === -1;
const isLong = (a) => isNumber(a) &&
    a >= MIN_LONG &&
    a <= MAX_LONG &&
    a.toString().indexOf(".") === -1;
/** Mapping of type to predicate */
const compareFuncs = {
    array: isArray,
    bool: isBoolean,
    boolean: isBoolean,
    date: isDate,
    decimal: isNumber,
    double: isNumber,
    int: isInt,
    long: isLong,
    number: isNumber,
    null: isNull,
    object: isObject,
    regex: isRegExp,
    regexp: isRegExp,
    string: isString,
    // added for completeness
    undefined: isNil, // deprecated
    function: (_) => {
        throw new MingoError("unsupported type key `function`.");
    },
    // Mongo identifiers
    1: isNumber, //double
    2: isString,
    3: isObject,
    4: isArray,
    6: isNil, // deprecated
    8: isBoolean,
    9: isDate,
    10: isNull,
    11: isRegExp,
    16: isInt,
    18: isLong,
    19: isNumber //decimal
};
/**
 * Selects documents if a field is of the specified type.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function compareType(a, b, _) {
    const f = compareFuncs[b];
    return f ? f(a) : false;
}
/**
 * Selects documents if a field is of the specified type.
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
function $type$1(a, b, options) {
    return Array.isArray(b)
        ? b.findIndex(t => compareType(a, t)) >= 0
        : compareType(a, b);
}
function compare(a, b, f) {
    return ensureArray(a).some(x => getType(x) === getType(b) && f(x, b));
}

// Date Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#date-expression-operators
const buildMap = (letters, sign) => {
    const h = {};
    letters.split("").forEach((v, i) => (h[v] = sign * (i + 1)));
    return h;
};
Object.assign(Object.assign(Object.assign({}, buildMap("ABCDEFGHIKLM", 1)), buildMap("NOPQRSTUVWXY", -1)), { Z: 0 });

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
const FIXED_POINTS = {
    undefined: null,
    null: null,
    NaN: NaN,
    Infinity: new Error(),
    "-Infinity": new Error()
};
/**
 * Returns an operator for a given trignometric function
 *
 * @param f The trignometric function
 */
function createTrignometryOperator(f, fixedPoints = FIXED_POINTS) {
    const fp = Object.assign({}, FIXED_POINTS, fixedPoints);
    const keySet = new Set(Object.keys(fp));
    return (obj, expr, options) => {
        const n = computeValue(obj, expr, null, options);
        if (keySet.has(`${n}`)) {
            const res = fp[`${n}`];
            if (res instanceof Error) {
                throw new MingoError(`cannot apply $${f.name} to -inf, value must in (-inf,inf)`);
            }
            return res;
        }
        return f(n);
    };
}

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse cosine (arc cosine) of a value in radians. */
createTrignometryOperator(Math.acos, {
    Infinity: Infinity,
    0: new Error(),
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse hyperbolic cosine (hyperbolic arc cosine) of a value in radians. */
createTrignometryOperator(Math.acosh, {
    Infinity: Infinity,
    0: new Error(),
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse sin (arc sine) of a value in radians. */
createTrignometryOperator(Math.asin);

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse hyperbolic sine (hyperbolic arc sine) of a value in radians. */
createTrignometryOperator(Math.asinh, {
    Infinity: Infinity,
    "-Infinity": -Infinity,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse tangent (arc tangent) of a value in radians. */
createTrignometryOperator(Math.atan);

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the inverse hyperbolic tangent (hyperbolic arc tangent) of a value in radians. */
createTrignometryOperator(Math.atanh, {
    1: Infinity,
    "-1": -Infinity,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the cosine of a value that is measured in radians. */
createTrignometryOperator(Math.cos);

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the hyperbolic cosine of a value that is measured in radians. */
createTrignometryOperator(Math.cosh, {
    "-Infinity": Infinity,
    Infinity: Infinity,
    // [Math.PI]: -1,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
const RADIANS_FACTOR = Math.PI / 180;
/** Converts a value from degrees to radians. */
createTrignometryOperator((n) => n * RADIANS_FACTOR, {
    Infinity: Infinity,
    "-Infinity": Infinity,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
const DEGREES_FACTOR = 180 / Math.PI;
/** Converts a value from radians to degrees. */
createTrignometryOperator((n) => n * DEGREES_FACTOR, {
    Infinity: Infinity,
    "-Infinity": -Infinity,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the sine of a value that is measured in radians. */
createTrignometryOperator(Math.sin);

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the hyperbolic sine of a value that is measured in radians. */
createTrignometryOperator(Math.sinh, {
    "-Infinity": -Infinity,
    Infinity: Infinity,
});

// Trignometry Expression Operators: https://docs.mongodb.com/manual/reference/operator/aggregation/#trigonometry-expression-operators
/** Returns the tangent of a value that is measured in radians. */
createTrignometryOperator(Math.tan);

/**
 * Reshapes a document stream.
 * $project can rename, add, or remove fields as well as create computed values and sub-documents.
 *
 * @param collection
 * @param expr
 * @param opt
 * @returns {Array}
 */
const $project = (collection, expr, options) => {
    if (isEmpty(expr))
        return collection;
    // result collection
    let expressionKeys = Object.keys(expr);
    let idOnlyExcluded = false;
    // validate inclusion and exclusion
    validateExpression(expr, options);
    const ID_KEY = options.idKey;
    if (inArray(expressionKeys, ID_KEY)) {
        const id = expr[ID_KEY];
        if (id === 0 || id === false) {
            expressionKeys = expressionKeys.filter(notInArray.bind(null, [ID_KEY]));
            idOnlyExcluded = expressionKeys.length == 0;
        }
    }
    else {
        // if not specified the add the ID field
        expressionKeys.push(ID_KEY);
    }
    const copts = ComputeOptions.init(options);
    return collection.map(((obj) => processObject(obj, expr, copts.update(obj), expressionKeys, idOnlyExcluded)));
};
/**
 * Process the expression value for $project operators
 *
 * @param {Object} obj The object to use as options
 * @param {Object} expr The experssion object of $project operator
 * @param {Array} expressionKeys The key in the 'expr' object
 * @param {Boolean} idOnlyExcluded Boolean value indicating whether only the ID key is excluded
 */
function processObject(obj, expr, options, expressionKeys, idOnlyExcluded) {
    let newObj = {};
    let foundSlice = false;
    let foundExclusion = false;
    const dropKeys = [];
    if (idOnlyExcluded) {
        dropKeys.push(options.idKey);
    }
    for (const key of expressionKeys) {
        // final computed value of the key
        let value = undefined;
        // expression to associate with key
        const subExpr = expr[key];
        if (key !== options.idKey && inArray([0, false], subExpr)) {
            foundExclusion = true;
        }
        if (key === options.idKey && isEmpty(subExpr)) {
            // tiny optimization here to skip over id
            value = obj[key];
        }
        else if (isString(subExpr)) {
            value = computeValue(obj, subExpr, key, options);
        }
        else if (inArray([1, true], subExpr)) ;
        else if (subExpr instanceof Array) {
            value = subExpr.map(v => {
                const r = computeValue(obj, v, null, options);
                if (isNil(r))
                    return null;
                return r;
            });
        }
        else if (isObject(subExpr)) {
            const subExprObj = subExpr;
            const subExprKeys = Object.keys(subExpr);
            const operator = subExprKeys.length == 1 ? subExprKeys[0] : "";
            // first try a projection operator
            const call = getOperator(OperatorType.PROJECTION, operator, options);
            if (call) {
                // apply the projection operator on the operator expression for the key
                if (operator === "$slice") {
                    // $slice is handled differently for aggregation and projection operations
                    if (ensureArray(subExprObj[operator]).every(isNumber)) {
                        // $slice for projection operation
                        value = call(obj, subExprObj[operator], key, options);
                        foundSlice = true;
                    }
                    else {
                        // $slice for aggregation operation
                        value = computeValue(obj, subExprObj, key, options);
                    }
                }
                else {
                    value = call(obj, subExprObj[operator], key, options);
                }
            }
            else if (isOperator(operator)) {
                // compute if operator key
                value = computeValue(obj, subExprObj[operator], operator, options);
            }
            else if (has(obj, key)) {
                // compute the value for the sub expression for the key
                validateExpression(subExprObj, options);
                let target = obj[key];
                if (target instanceof Array) {
                    value = target.map((o) => processObject(o, subExprObj, options, subExprKeys, false));
                }
                else {
                    target = isObject(target) ? target : obj;
                    value = processObject(target, subExprObj, options, subExprKeys, false);
                }
            }
            else {
                // compute the value for the sub expression for the key
                value = computeValue(obj, subExpr, null, options);
            }
        }
        else {
            dropKeys.push(key);
            continue;
        }
        // get value with object graph
        const objPathGraph = resolveGraph(obj, key, {
            preserveMissing: true
        });
        // add the value at the path
        if (objPathGraph !== undefined) {
            merge(newObj, objPathGraph, {
                flatten: true
            });
        }
        // if computed add/or remove accordingly
        if (notInArray([0, 1, false, true], subExpr)) {
            if (value === undefined) {
                removeValue(newObj, key, { descendArray: true });
            }
            else {
                setValue(newObj, key, value);
            }
        }
    }
    // filter out all missing values preserved to support correct merging
    filterMissing(newObj);
    // For the following cases we include all keys on the object that were not explicitly excluded.
    //
    // 1. projection included $slice operator
    // 2. some fields were explicitly excluded
    // 3. only the id field was excluded
    if (foundSlice || foundExclusion || idOnlyExcluded) {
        newObj = into({}, obj, newObj);
        if (dropKeys.length > 0) {
            for (const k of dropKeys) {
                removeValue(newObj, k, { descendArray: true });
            }
        }
    }
    return newObj;
}
/**
 * Validate inclusion and exclusion values in expression
 *
 * @param {Object} expr The expression given for the projection
 */
function validateExpression(expr, options) {
    const check = [false, false];
    for (const [k, v] of Object.entries(expr)) {
        if (k === (options === null || options === void 0 ? void 0 : options.idKey))
            return;
        if (v === 0 || v === false) {
            check[0] = true;
        }
        else if (v === 1 || v === true) {
            check[1] = true;
        }
        assert(!(check[0] && check[1]), "Projection cannot have a mix of inclusion and exclusion.");
    }
}

// Query Logical Operators: https://docs.mongodb.com/manual/reference/operator/query-logical/
/**
 * Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
const $and = (_, rhs, options) => {
    assert(isArray(rhs), "Invalid expression: $and expects value to be an Array.");
    const queries = rhs.map(expr => new Query(expr, options));
    return (obj) => queries.every(q => q.test(obj));
};

// Query Logical Operators: https://docs.mongodb.com/manual/reference/operator/query-logical/
/**
 * Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
const $or = (_, rhs, options) => {
    assert(isArray(rhs), "Invalid expression. $or expects value to be an Array");
    const queries = rhs.map(expr => new Query(expr, options));
    return (obj) => queries.some(q => q.test(obj));
};

// Query Logical Operators: https://docs.mongodb.com/manual/reference/operator/query-logical/
/**
 * Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
const $nor = (_, rhs, options) => {
    assert(isArray(rhs), "Invalid expression. $nor expects value to be an array.");
    const f = $or("$or", rhs, options);
    return (obj) => !f(obj);
};

// Query Logical Operators: https://docs.mongodb.com/manual/reference/operator/query-logical/
/**
 * Inverts the effect of a query expression and returns documents that do not match the query expression.
 *
 * @param selector
 * @param rhs
 * @returns {Function}
 */
const $not = (selector, rhs, options) => {
    const criteria = {};
    criteria[selector] = normalize(rhs);
    const query = new Query(criteria, options);
    return (obj) => !query.test(obj);
};

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches values that are equal to a specified value.
 */
const $eq = createQueryOperator($eq$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches values that are greater than a specified value.
 */
const $gt = createQueryOperator($gt$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * 	Matches values that are greater than or equal to a specified value.
 */
const $gte = createQueryOperator($gte$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches any of the values that exist in an array specified in the query.
 */
const $in = createQueryOperator($in$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches values that are less than the value specified in the query.
 */
const $lt = createQueryOperator($lt$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches values that are less than or equal to the value specified in the query.
 */
const $lte = createQueryOperator($lte$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches all values that are not equal to the value specified in the query.
 */
const $ne = createQueryOperator($ne$1);

// Query Comparison Operators: https://docs.mongodb.com/manual/reference/operator/query-comparison/
/**
 * Matches values that do not exist in an array specified to the query.
 */
const $nin = createQueryOperator($nin$1);

// Query Evaluation Operators: https://docs.mongodb.com/manual/reference/operator/query-evaluation/
/**
 * Performs a modulo operation on the value of a field and selects documents with a specified result.
 */
const $mod = createQueryOperator($mod$1);

// Query Evaluation Operators: https://docs.mongodb.com/manual/reference/operator/query-evaluation/
/**
 * Selects documents where values match a specified regular expression.
 */
const $regex = createQueryOperator($regex$1);

// Query Array Operators: https://docs.mongodb.com/manual/reference/operator/query-array/
/**
 * Matches arrays that contain all elements specified in the query.
 */
createQueryOperator($all);

// Query Array Operators: https://docs.mongodb.com/manual/reference/operator/query-array/
/**
 * Selects documents if element in the array field matches all the specified $elemMatch conditions.
 */
const $elemMatch = createQueryOperator($elemMatch$1);

// Query Array Operators: https://docs.mongodb.com/manual/reference/operator/query-array/
/**
 * Selects documents if the array field is a specified size.
 */
const $size = createQueryOperator($size$1);

// Query Element Operators: https://docs.mongodb.com/manual/reference/operator/query-element/
/**
 * Matches documents that have the specified field.
 */
const $exists = createQueryOperator($exists$1);

// Query Element Operators: https://docs.mongodb.com/manual/reference/operator/query-element/
/**
 * Selects documents if a field is of the specified type.
 */
const $type = createQueryOperator($type$1);

var mingoInitDone = false;

/**
 * The MongoDB query library is huge and we do not need all the operators.
 * If you add an operator here, make sure that you properly add a test in
 * the file /test/unit/rx-storage-query-correctness.test.ts
 *
 * @link https://github.com/kofrasa/mingo#es6
 */
function getMingoQuery(selector) {
  if (!mingoInitDone) {
    useOperators(OperatorType.PIPELINE, {
      $sort,
      $project
    });
    useOperators(OperatorType.QUERY, {
      $and,
      $eq,
      $elemMatch,
      $exists,
      $gt,
      $gte,
      $in,
      $lt,
      $lte,
      $ne,
      $nin,
      $mod,
      $nor,
      $not,
      $or,
      $regex,
      $size,
      $type
    });
    mingoInitDone = true;
  }
  return new Query(selector);
}

/**
 * Normalize the query to ensure we have all fields set
 * and queries that represent the same query logic are detected as equal by the caching.
 */
function normalizeMangoQuery(schema, mangoQuery) {
  var primaryKey = getPrimaryFieldOfPrimaryKey(schema.primaryKey);
  mangoQuery = flatClone(mangoQuery);
  var normalizedMangoQuery = clone(mangoQuery);
  if (typeof normalizedMangoQuery.skip !== 'number') {
    normalizedMangoQuery.skip = 0;
  }
  if (!normalizedMangoQuery.selector) {
    normalizedMangoQuery.selector = {};
  } else {
    normalizedMangoQuery.selector = normalizedMangoQuery.selector;
    /**
     * In mango query, it is possible to have an
     * equals comparison by directly assigning a value
     * to a property, without the '$eq' operator.
     * Like:
     * selector: {
     *   foo: 'bar'
     * }
     * For normalization, we have to normalize this
     * so our checks can perform properly.
     *
     *
     * TODO this must work recursive with nested queries that
     * contain multiple selectors via $and or $or etc.
     */
    Object.entries(normalizedMangoQuery.selector).forEach(([field, matcher]) => {
      if (typeof matcher !== 'object' || matcher === null) {
        normalizedMangoQuery.selector[field] = {
          $eq: matcher
        };
      }
    });
  }

  /**
   * Ensure that if an index is specified,
   * the primaryKey is inside of it.
   */
  if (normalizedMangoQuery.index) {
    var indexAr = toArray(normalizedMangoQuery.index);
    if (!indexAr.includes(primaryKey)) {
      indexAr.push(primaryKey);
    }
    normalizedMangoQuery.index = indexAr;
  }

  /**
   * To ensure a deterministic sorting,
   * we have to ensure the primary key is always part
   * of the sort query.
   * Primary sorting is added as last sort parameter,
   * similar to how we add the primary key to indexes that do not have it.
   *
   */
  if (!normalizedMangoQuery.sort) {
    /**
     * If no sort is given at all,
     * we can assume that the user does not care about sort order at al.
     *
     * we cannot just use the primary key as sort parameter
     * because it would likely cause the query to run over the primary key index
     * which has a bad performance in most cases.
     */
    if (normalizedMangoQuery.index) {
      normalizedMangoQuery.sort = normalizedMangoQuery.index.map(field => {
        return {
          [field]: 'asc'
        };
      });
    } else {
      /**
       * Find the index that best matches the fields with the logical operators
       */
      if (schema.indexes) {
        var fieldsWithLogicalOperator = new Set();
        Object.entries(normalizedMangoQuery.selector).forEach(([field, matcher]) => {
          var hasLogical = false;
          if (typeof matcher === 'object' && matcher !== null) {
            hasLogical = !!Object.keys(matcher).find(operator => LOGICAL_OPERATORS.has(operator));
          } else {
            hasLogical = true;
          }
          if (hasLogical) {
            fieldsWithLogicalOperator.add(field);
          }
        });
        var currentFieldsAmount = -1;
        var currentBestIndexForSort;
        schema.indexes.forEach(index => {
          var useIndex = isMaybeReadonlyArray(index) ? index : [index];
          var firstWrongIndex = useIndex.findIndex(indexField => !fieldsWithLogicalOperator.has(indexField));
          if (firstWrongIndex > 0 && firstWrongIndex > currentFieldsAmount) {
            currentFieldsAmount = firstWrongIndex;
            currentBestIndexForSort = useIndex;
          }
        });
        if (currentBestIndexForSort) {
          normalizedMangoQuery.sort = currentBestIndexForSort.map(field => {
            return {
              [field]: 'asc'
            };
          });
        }
      }

      /**
       * Fall back to the primary key as sort order
       * if no better one has been found
       */
      if (!normalizedMangoQuery.sort) {
        normalizedMangoQuery.sort = [{
          [primaryKey]: 'asc'
        }];
      }
    }
  } else {
    var isPrimaryInSort = normalizedMangoQuery.sort.find(p => firstPropertyNameOfObject(p) === primaryKey);
    if (!isPrimaryInSort) {
      normalizedMangoQuery.sort = normalizedMangoQuery.sort.slice(0);
      normalizedMangoQuery.sort.push({
        [primaryKey]: 'asc'
      });
    }
  }
  return normalizedMangoQuery;
}

/**
 * Returns the sort-comparator,
 * which is able to sort documents in the same way
 * a query over the db would do.
 */
function getSortComparator(schema, query) {
  if (!query.sort) {
    throw newRxError('SNH', {
      query
    });
  }
  var sortParts = [];
  query.sort.forEach(sortBlock => {
    var key = Object.keys(sortBlock)[0];
    var direction = Object.values(sortBlock)[0];
    sortParts.push({
      key,
      direction,
      getValueFn: objectPathMonad(key)
    });
  });
  var fun = (a, b) => {
    for (var i = 0; i < sortParts.length; ++i) {
      var sortPart = sortParts[i];
      var valueA = sortPart.getValueFn(a);
      var valueB = sortPart.getValueFn(b);
      if (valueA !== valueB) {
        var ret = sortPart.direction === 'asc' ? compare$1(valueA, valueB) : compare$1(valueB, valueA);
        return ret;
      }
    }
  };
  return fun;
}

/**
 * Returns a function
 * that can be used to check if a document
 * matches the query.
 */
function getQueryMatcher(_schema, query) {
  if (!query.sort) {
    throw newRxError('SNH', {
      query
    });
  }
  var mingoQuery = getMingoQuery(query.selector);
  var fun = doc => {
    return mingoQuery.test(doc);
  };
  return fun;
}
async function runQueryUpdateFunction(rxQuery, fn) {
  var docs = await rxQuery.exec();
  if (!docs) {
    // only findOne() queries can return null
    return null;
  }
  if (Array.isArray(docs)) {
    return Promise.all(docs.map(doc => fn(doc)));
  } else {
    // via findOne()
    var result = await fn(docs);
    return result;
  }
}

function getSortFieldsOfQuery(primaryKey, query) {
  if (!query.sort || query.sort.length === 0) {
    return [primaryKey];
  } else {
    return query.sort.map(part => Object.keys(part)[0]);
  }
}
var RXQUERY_QUERY_PARAMS_CACHE = new WeakMap();
function getQueryParams(rxQuery) {
  return getFromMapOrCreate(RXQUERY_QUERY_PARAMS_CACHE, rxQuery, () => {
    var collection = rxQuery.collection;
    var normalizedMangoQuery = normalizeMangoQuery(collection.storageInstance.schema, clone(rxQuery.mangoQuery));
    var primaryKey = collection.schema.primaryPath;

    /**
     * Create a custom sort comparator
     * that uses the hooks to ensure
     * we send for example compressed documents to be sorted by compressed queries.
     */
    var sortComparator = getSortComparator(collection.schema.jsonSchema, normalizedMangoQuery);
    var useSortComparator = (docA, docB) => {
      var sortComparatorData = {
        docA,
        docB,
        rxQuery
      };
      return sortComparator(sortComparatorData.docA, sortComparatorData.docB);
    };

    /**
     * Create a custom query matcher
     * that uses the hooks to ensure
     * we send for example compressed documents to match compressed queries.
     */
    var queryMatcher = getQueryMatcher(collection.schema.jsonSchema, normalizedMangoQuery);
    var useQueryMatcher = doc => {
      var queryMatcherData = {
        doc,
        rxQuery
      };
      return queryMatcher(queryMatcherData.doc);
    };
    var ret = {
      primaryKey: rxQuery.collection.schema.primaryPath,
      skip: normalizedMangoQuery.skip,
      limit: normalizedMangoQuery.limit,
      sortFields: getSortFieldsOfQuery(primaryKey, normalizedMangoQuery),
      sortComparator: useSortComparator,
      queryMatcher: useQueryMatcher
    };
    return ret;
  });
}
function calculateNewResults(rxQuery, rxChangeEvents) {
  if (!rxQuery.collection.database.eventReduce) {
    return {
      runFullQueryAgain: true
    };
  }
  var queryParams = getQueryParams(rxQuery);
  var previousResults = ensureNotFalsy(rxQuery._result).docsData.slice(0);
  var previousResultsMap = ensureNotFalsy(rxQuery._result).docsDataMap;
  var changed = false;
  var eventReduceEvents = rxChangeEvents.map(cE => rxChangeEventToEventReduceChangeEvent(cE)).filter(arrayFilterNotEmpty);
  var foundNonOptimizeable = eventReduceEvents.find(eventReduceEvent => {
    var stateResolveFunctionInput = {
      queryParams,
      changeEvent: eventReduceEvent,
      previousResults,
      keyDocumentMap: previousResultsMap
    };
    var actionName = calculateActionName(stateResolveFunctionInput);
    if (actionName === 'runFullQueryAgain') {
      return true;
    } else if (actionName !== 'doNothing') {
      changed = true;
      runAction(actionName, queryParams, eventReduceEvent, previousResults, previousResultsMap);
      return false;
    }
  });
  if (foundNonOptimizeable) {
    return {
      runFullQueryAgain: true
    };
  } else {
    return {
      runFullQueryAgain: false,
      changed,
      newResults: previousResults
    };
  }
}

/**
 * the query-cache makes sure that on every query-state, exactly one instance can exist
 * if you use the same mango-query more then once, it will reuse the first RxQuery
 */

var QueryCache = /*#__PURE__*/function () {
  function QueryCache() {
    this._map = new Map();
  }
  var _proto = QueryCache.prototype;
  /**
   * check if an equal query is in the cache,
   * if true, return the cached one,
   * if false, save the given one and return it
   */
  _proto.getByQuery = function getByQuery(rxQuery) {
    var stringRep = rxQuery.toString();
    return getFromMapOrCreate(this._map, stringRep, () => rxQuery);
  };
  return QueryCache;
}();
function createQueryCache() {
  return new QueryCache();
}
function uncacheRxQuery(queryCache, rxQuery) {
  rxQuery.uncached = true;
  var stringRep = rxQuery.toString();
  queryCache._map.delete(stringRep);
}
function countRxQuerySubscribers(rxQuery) {
  return rxQuery.refCount$.observers.length;
}
var DEFAULT_TRY_TO_KEEP_MAX = 100;
var DEFAULT_UNEXECUTED_LIFETIME = 30 * 1000;

/**
 * The default cache replacement policy
 * See docs-src/query-cache.md to learn how it should work.
 * Notice that this runs often and should block the cpu as less as possible
 * This is a monad which makes it easier to unit test
 */
var defaultCacheReplacementPolicyMonad = (tryToKeepMax, unExecutedLifetime) => (_collection, queryCache) => {
  if (queryCache._map.size < tryToKeepMax) {
    return;
  }
  var minUnExecutedLifetime = now$2() - unExecutedLifetime;
  var maybeUncache = [];
  var queriesInCache = Array.from(queryCache._map.values());
  for (var rxQuery of queriesInCache) {
    // filter out queries with subscribers
    if (countRxQuerySubscribers(rxQuery) > 0) {
      continue;
    }
    // directly uncache queries that never executed and are older then unExecutedLifetime
    if (rxQuery._lastEnsureEqual === 0 && rxQuery._creationTime < minUnExecutedLifetime) {
      uncacheRxQuery(queryCache, rxQuery);
      continue;
    }
    maybeUncache.push(rxQuery);
  }
  var mustUncache = maybeUncache.length - tryToKeepMax;
  if (mustUncache <= 0) {
    return;
  }
  var sortedByLastUsage = maybeUncache.sort((a, b) => a._lastEnsureEqual - b._lastEnsureEqual);
  var toRemove = sortedByLastUsage.slice(0, mustUncache);
  toRemove.forEach(rxQuery => uncacheRxQuery(queryCache, rxQuery));
};
var defaultCacheReplacementPolicy = defaultCacheReplacementPolicyMonad(DEFAULT_TRY_TO_KEEP_MAX, DEFAULT_UNEXECUTED_LIFETIME);
var COLLECTIONS_WITH_RUNNING_CLEANUP = new WeakSet();

/**
 * Triggers the cache replacement policy after waitTime has passed.
 * We do not run this directly because at exactly the time a query is created,
 * we need all CPU to minimize latency.
 * Also this should not be triggered multiple times when waitTime is still waiting.
 */
function triggerCacheReplacement(rxCollection) {
  if (COLLECTIONS_WITH_RUNNING_CLEANUP.has(rxCollection)) {
    // already started
    return;
  }
  COLLECTIONS_WITH_RUNNING_CLEANUP.add(rxCollection);

  /**
   * Do not run directly to not reduce result latency of a new query
   */
  nextTick() // wait at least one tick
  .then(() => requestIdlePromise(200)) // and then wait for the CPU to be idle
  .then(() => {
    if (!rxCollection.destroyed) {
      rxCollection.cacheReplacementPolicy(rxCollection, rxCollection._queryCache);
    }
    COLLECTIONS_WITH_RUNNING_CLEANUP.delete(rxCollection);
  });
}

/**
 * Because we have to create many cache items,
 * we use an array instead of an object with properties
 * for better performance and less memory usage.
 * @link https://stackoverflow.com/questions/17295056/array-vs-object-efficiency-in-javascript
 */

/**
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
 */

/**
 * The DocumentCache stores RxDocument objects
 * by their primary key and revision.
 * This is useful on client side applications where
 * it is not known how much memory can be used, so
 * we de-duplicate RxDocument states to save memory.
 * To not fill up the memory with old document states, the DocumentCache
 * only contains weak references to the RxDocuments themself.
 * @link https://caniuse.com/?search=weakref
 */
var DocumentCache = /*#__PURE__*/function () {
  /**
   * Some JavaScript runtimes like QuickJS,
   * so not have a FinalizationRegistry or WeakRef.
   * Therefore we need a workaround which might waste a lot of memory,
   * but at least works.
   */

  function DocumentCache(primaryPath, changes$,
  /**
   * A method that can create a RxDocument by the given document data.
   */
  documentCreator) {
    this.cacheItemByDocId = new Map();
    this.registry = typeof FinalizationRegistry === 'function' ? new FinalizationRegistry(docMeta => {
      var docId = docMeta.docId;
      var cacheItem = this.cacheItemByDocId.get(docId);
      if (cacheItem) {
        cacheItem[0].delete(docMeta.revisionHeight);
        if (cacheItem[0].size === 0) {
          /**
           * No state of the document is cached anymore,
           * so we can clean up.
           */
          this.cacheItemByDocId.delete(docId);
        }
      }
    }) : undefined;
    this.primaryPath = primaryPath;
    this.changes$ = changes$;
    this.documentCreator = documentCreator;
    changes$.subscribe(changeEvent => {
      var docId = changeEvent.documentId;
      var cacheItem = this.cacheItemByDocId.get(docId);
      if (cacheItem) {
        var documentData = getDocumentDataOfRxChangeEvent(changeEvent);
        cacheItem[1] = documentData;
      }
    });
  }

  /**
   * Get the RxDocument from the cache
   * and create a new one if not exits before.
   * @overwrites itself with the actual function
   * because this is @performance relevant.
   * It is called on each document row for each write and read.
   */
  var _proto = DocumentCache.prototype;
  /**
   * Throws if not exists
   */
  _proto.getLatestDocumentData = function getLatestDocumentData(docId) {
    var cacheItem = getFromMapOrThrow(this.cacheItemByDocId, docId);
    return cacheItem[1];
  };
  _proto.getLatestDocumentDataIfExists = function getLatestDocumentDataIfExists(docId) {
    var cacheItem = this.cacheItemByDocId.get(docId);
    if (cacheItem) {
      return cacheItem[1];
    }
  };
  return _createClass(DocumentCache, [{
    key: "getCachedRxDocuments",
    get: function () {
      var fn = getCachedRxDocumentMonad(this);
      return overwriteGetterForCaching(this, 'getCachedRxDocuments', fn);
    }
  }, {
    key: "getCachedRxDocument",
    get: function () {
      var fn = getCachedRxDocumentMonad(this);
      return overwriteGetterForCaching(this, 'getCachedRxDocument', doc => fn([doc])[0]);
    }
  }]);
}();

/**
 * This function is called very very often.
 * This is likely the most important function for RxDB overall performance
 * @hotPath This is one of the most important methods for performance.
 * It is used in many places to transform the raw document data into RxDocuments.
 */
function getCachedRxDocumentMonad(docCache) {
  var primaryPath = docCache.primaryPath;
  var cacheItemByDocId = docCache.cacheItemByDocId;
  var registry = docCache.registry;
  var deepFreezeWhenDevMode = overwritable.deepFreezeWhenDevMode;
  var documentCreator = docCache.documentCreator;
  var fn = docsData => {
    var ret = new Array(docsData.length);
    var registryTasks = [];
    for (var index = 0; index < docsData.length; index++) {
      var docData = docsData[index];
      var docId = docData[primaryPath];
      var revisionHeight = getHeightOfRevision(docData._rev);
      var byRev = void 0;
      var cachedRxDocumentWeakRef = void 0;
      var cacheItem = cacheItemByDocId.get(docId);
      if (!cacheItem) {
        byRev = new Map();
        cacheItem = [byRev, docData];
        cacheItemByDocId.set(docId, cacheItem);
      } else {
        byRev = cacheItem[0];
        cachedRxDocumentWeakRef = byRev.get(revisionHeight);
      }
      var cachedRxDocument = cachedRxDocumentWeakRef ? cachedRxDocumentWeakRef.deref() : undefined;
      if (!cachedRxDocument) {
        docData = deepFreezeWhenDevMode(docData);
        cachedRxDocument = documentCreator(docData);
        byRev.set(revisionHeight, createWeakRefWithFallback(cachedRxDocument));
        if (registry) {
          registryTasks.push(cachedRxDocument);
        }
      }
      ret[index] = cachedRxDocument;
    }
    if (registryTasks.length > 0 && registry) {
      /**
       * Calling registry.register() has shown to have
       * really bad performance. So we add the cached documents
       * lazily.
       */
      requestIdlePromiseNoQueue().then(() => {
        for (var _index = 0; _index < registryTasks.length; _index++) {
          var doc = registryTasks[_index];
          registry.register(doc, {
            docId: doc.primary,
            revisionHeight: getHeightOfRevision(doc.revision)
          });
        }
      });
    }
    return ret;
  };
  return fn;
}
function mapDocumentsDataToCacheDocs(docCache, docsData) {
  var getCachedRxDocuments = docCache.getCachedRxDocuments;
  return getCachedRxDocuments(docsData);
}

/**
 * Fallback for JavaScript runtimes that do not support WeakRef.
 * The fallback will keep the items in cache forever,
 * but at least works.
 */
var HAS_WEAK_REF = typeof WeakRef === 'function';
var createWeakRefWithFallback = HAS_WEAK_REF ? createWeakRef : createWeakRefFallback;
function createWeakRef(obj) {
  return new WeakRef(obj);
}
function createWeakRefFallback(obj) {
  return {
    deref() {
      return obj;
    }
  };
}

/**
 * RxDB needs the query results in multiple formats.
 * Sometimes as a Map or an array with only the documentData.
 * For better performance we work with this class
 * that initializes stuff lazily so that
 * we can directly work with the query results after RxQuery.exec()
 */
var RxQuerySingleResult = /*#__PURE__*/function () {
  /**
   * Time at which the current _result state was created.
   * Used to determine if the result set has changed since X
   * so that we do not emit the same result multiple times on subscription.
   */

  function RxQuerySingleResult(collection,
  // only used internally, do not use outside, use this.docsData instead
  docsDataFromStorageInstance,
  // can be overwritten for count-queries
  count) {
    this.time = now$2();
    this.collection = collection;
    this.count = count;
    this.documents = mapDocumentsDataToCacheDocs(this.collection._docCache, docsDataFromStorageInstance);
  }

  /**
   * Instead of using the newResultData in the result cache,
   * we directly use the objects that are stored in the RxDocument
   * to ensure we do not store the same data twice and fill up the memory.
   * @overwrites itself with the actual value
   */
  return _createClass(RxQuerySingleResult, [{
    key: "docsData",
    get: function () {
      return overwriteGetterForCaching(this, 'docsData', this.documents.map(d => d._data));
    }

    // A key->document map, used in the event reduce optimization.
  }, {
    key: "docsDataMap",
    get: function () {
      var map = new Map();
      this.documents.forEach(d => {
        map.set(d.primary, d._data);
      });
      return overwriteGetterForCaching(this, 'docsDataMap', map);
    }
  }, {
    key: "docsMap",
    get: function () {
      var map = new Map();
      var documents = this.documents;
      for (var i = 0; i < documents.length; i++) {
        var doc = documents[i];
        map.set(doc.primary, doc);
      }
      return overwriteGetterForCaching(this, 'docsMap', map);
    }
  }]);
}();

var _queryCount = 0;
var newQueryID = function () {
  return ++_queryCount;
};
var RxQueryBase = /*#__PURE__*/function () {
  /**
   * Some stats then are used for debugging and cache replacement policies
   */

  // used in the query-cache to determine if the RxQuery can be cleaned up.

  // used to count the subscribers to the query

  /**
   * Contains the current result state
   * or null if query has not run yet.
   */

  function RxQueryBase(op, mangoQuery, collection,
  // used by some plugins
  other = {}) {
    this.id = newQueryID();
    this._execOverDatabaseCount = 0;
    this._creationTime = now$2();
    this._lastEnsureEqual = 0;
    this.uncached = false;
    this.refCount$ = new BehaviorSubject(null);
    this._result = null;
    this._latestChangeEvent = -1;
    this._lastExecStart = 0;
    this._lastExecEnd = 0;
    this._ensureEqualQueue = PROMISE_RESOLVE_FALSE;
    this.op = op;
    this.mangoQuery = mangoQuery;
    this.collection = collection;
    this.other = other;
    if (!mangoQuery) {
      this.mangoQuery = _getDefaultQuery();
    }
    this.isFindOneByIdQuery = isFindOneByIdQuery(this.collection.schema.primaryPath, mangoQuery);
  }
  var _proto = RxQueryBase.prototype;
  /**
   * Returns an observable that emits the results
   * This should behave like an rxjs-BehaviorSubject which means:
   * - Emit the current result-set on subscribe
   * - Emit the new result-set when an RxChangeEvent comes in
   * - Do not emit anything before the first result-set was created (no null)
   */
  /**
   * set the new result-data as result-docs of the query
   * @param newResultData json-docs that were received from the storage
   */
  _proto._setResultData = function _setResultData(newResultData) {
    if (typeof newResultData === 'number') {
      this._result = new RxQuerySingleResult(this.collection, [], newResultData);
      return;
    } else if (newResultData instanceof Map) {
      newResultData = Array.from(newResultData.values());
    }
    var newQueryResult = new RxQuerySingleResult(this.collection, newResultData, newResultData.length);
    this._result = newQueryResult;
  }

  /**
   * executes the query on the database
   * @return results-array with document-data
   */;
  _proto._execOverDatabase = async function _execOverDatabase() {
    this._execOverDatabaseCount = this._execOverDatabaseCount + 1;
    this._lastExecStart = now$2();
    if (this.op === 'count') {
      var preparedQuery = this.getPreparedQuery();
      var result = await this.collection.storageInstance.count(preparedQuery);
      if (result.mode === 'slow' && !this.collection.database.allowSlowCount) {
        throw newRxError('QU14', {
          collection: this.collection,
          queryObj: this.mangoQuery
        });
      } else {
        return result.count;
      }
    }
    if (this.op === 'findByIds') {
      var ids = ensureNotFalsy(this.mangoQuery.selector)[this.collection.schema.primaryPath].$in;
      var ret = new Map();
      var mustBeQueried = [];
      // first try to fill from docCache
      ids.forEach(id => {
        var docData = this.collection._docCache.getLatestDocumentDataIfExists(id);
        if (docData) {
          if (!docData._deleted) {
            var doc = this.collection._docCache.getCachedRxDocument(docData);
            ret.set(id, doc);
          }
        } else {
          mustBeQueried.push(id);
        }
      });
      // everything which was not in docCache must be fetched from the storage
      if (mustBeQueried.length > 0) {
        var docs = await this.collection.storageInstance.findDocumentsById(mustBeQueried, false);
        docs.forEach(docData => {
          var doc = this.collection._docCache.getCachedRxDocument(docData);
          ret.set(doc.primary, doc);
        });
      }
      return ret;
    }
    var docsPromise = queryCollection(this);
    return docsPromise.then(docs => {
      this._lastExecEnd = now$2();
      return docs;
    });
  }

  /**
   * Execute the query
   * To have an easier implementations,
   * just subscribe and use the first result
   */;
  _proto.exec = function exec(throwIfMissing) {
    if (throwIfMissing && this.op !== 'findOne') {
      throw newRxError('QU9', {
        collection: this.collection.name,
        query: this.mangoQuery,
        op: this.op
      });
    }

    /**
     * run _ensureEqual() here,
     * this will make sure that errors in the query which throw inside of the RxStorage,
     * will be thrown at this execution context and not in the background.
     */
    return _ensureEqual(this).then(() => firstValueFrom(this.$)).then(result => {
      if (!result && throwIfMissing) {
        throw newRxError('QU10', {
          collection: this.collection.name,
          query: this.mangoQuery,
          op: this.op
        });
      } else {
        return result;
      }
    });
  }

  /**
   * cached call to get the queryMatcher
   * @overwrites itself with the actual value
   */;
  /**
   * returns a string that is used for equal-comparisons
   * @overwrites itself with the actual value
   */
  _proto.toString = function toString() {
    var stringObj = sortObject({
      op: this.op,
      query: this.mangoQuery,
      other: this.other
    }, true);
    var value = JSON.stringify(stringObj);
    this.toString = () => value;
    return value;
  }

  /**
   * returns the prepared query
   * which can be send to the storage instance to query for documents.
   * @overwrites itself with the actual value.
   */;
  _proto.getPreparedQuery = function getPreparedQuery() {
    var hookInput = {
      rxQuery: this,
      // can be mutated by the hooks so we have to deep clone first.
      mangoQuery: normalizeMangoQuery(this.collection.schema.jsonSchema, this.mangoQuery)
    };
    hookInput.mangoQuery.selector._deleted = {
      $eq: false
    };
    if (hookInput.mangoQuery.index) {
      hookInput.mangoQuery.index.unshift('_deleted');
    }
    runPluginHooks('prePrepareQuery', hookInput);
    var value = prepareQuery(this.collection.schema.jsonSchema, hookInput.mangoQuery);
    this.getPreparedQuery = () => value;
    return value;
  }

  /**
   * returns true if the document matches the query,
   * does not use the 'skip' and 'limit'
   */;
  _proto.doesDocumentDataMatch = function doesDocumentDataMatch(docData) {
    // if doc is deleted, it cannot match
    if (docData._deleted) {
      return false;
    }
    return this.queryMatcher(docData);
  }

  /**
   * deletes all found documents
   * @return promise with deleted documents
   */;
  _proto.remove = function remove() {
    return this.exec().then(docs => {
      if (Array.isArray(docs)) {
        // TODO use a bulk operation instead of running .remove() on each document
        return Promise.all(docs.map(doc => doc.remove()));
      } else {
        return docs.remove();
      }
    });
  };
  _proto.incrementalRemove = function incrementalRemove() {
    return runQueryUpdateFunction(this.asRxQuery, doc => doc.incrementalRemove());
  }

  /**
   * helper function to transform RxQueryBase to RxQuery type
   */;
  /**
   * updates all found documents
   * @overwritten by plugin (optional)
   */
  _proto.update = function update(_updateObj) {
    throw pluginMissing('update');
  };
  _proto.patch = function patch(_patch) {
    return runQueryUpdateFunction(this.asRxQuery, doc => doc.patch(_patch));
  };
  _proto.incrementalPatch = function incrementalPatch(patch) {
    return runQueryUpdateFunction(this.asRxQuery, doc => doc.incrementalPatch(patch));
  };
  _proto.modify = function modify(mutationFunction) {
    return runQueryUpdateFunction(this.asRxQuery, doc => doc.modify(mutationFunction));
  };
  _proto.incrementalModify = function incrementalModify(mutationFunction) {
    return runQueryUpdateFunction(this.asRxQuery, doc => doc.incrementalModify(mutationFunction));
  }

  // we only set some methods of query-builder here
  // because the others depend on these ones
  ;
  _proto.where = function where(_queryObj) {
    throw pluginMissing('query-builder');
  };
  _proto.sort = function sort(_params) {
    throw pluginMissing('query-builder');
  };
  _proto.skip = function skip(_amount) {
    throw pluginMissing('query-builder');
  };
  _proto.limit = function limit(_amount) {
    throw pluginMissing('query-builder');
  };
  return _createClass(RxQueryBase, [{
    key: "$",
    get: function () {
      if (!this._$) {
        var results$ = this.collection.$.pipe(
        /**
         * Performance shortcut.
         * Changes to local documents are not relevant for the query.
         */
        filter(changeEvent => !changeEvent.isLocal),
        /**
         * Start once to ensure the querying also starts
         * when there where no changes.
         */
        startWith(null),
        // ensure query results are up to date.
        mergeMap(() => _ensureEqual(this)),
        // use the current result set, written by _ensureEqual().
        map(() => this._result),
        // do not run stuff above for each new subscriber, only once.
        shareReplay(RXJS_SHARE_REPLAY_DEFAULTS),
        // do not proceed if result set has not changed.
        distinctUntilChanged((prev, curr) => {
          if (prev && prev.time === ensureNotFalsy(curr).time) {
            return true;
          } else {
            return false;
          }
        }), filter(result => !!result),
        /**
         * Map the result set to a single RxDocument or an array,
         * depending on query type
         */
        map(result => {
          var useResult = ensureNotFalsy(result);
          if (this.op === 'count') {
            return useResult.count;
          } else if (this.op === 'findOne') {
            // findOne()-queries emit RxDocument or null
            return useResult.documents.length === 0 ? null : useResult.documents[0];
          } else if (this.op === 'findByIds') {
            return useResult.docsMap;
          } else {
            // find()-queries emit RxDocument[]
            // Flat copy the array so it won't matter if the user modifies it.
            return useResult.documents.slice(0);
          }
        }));
        this._$ = merge$1(results$,
        /**
         * Also add the refCount$ to the query observable
         * to allow us to count the amount of subscribers.
         */
        this.refCount$.pipe(filter(() => false)));
      }
      return this._$;
    }
  }, {
    key: "$$",
    get: function () {
      var reactivity = this.collection.database.getReactivityFactory();
      return reactivity.fromObservable(this.$, undefined, this.collection.database);
    }

    // stores the changeEvent-number of the last handled change-event

    // time stamps on when the last full exec over the database has run
    // used to properly handle events that happen while the find-query is running

    /**
     * ensures that the exec-runs
     * are not run in parallel
     */
  }, {
    key: "queryMatcher",
    get: function () {
      var schema = this.collection.schema.jsonSchema;
      var normalizedQuery = normalizeMangoQuery(this.collection.schema.jsonSchema, this.mangoQuery);
      return overwriteGetterForCaching(this, 'queryMatcher', getQueryMatcher(schema, normalizedQuery));
    }
  }, {
    key: "asRxQuery",
    get: function () {
      return this;
    }
  }]);
}();
function _getDefaultQuery() {
  return {
    selector: {}
  };
}

/**
 * run this query through the QueryCache
 */
function tunnelQueryCache(rxQuery) {
  return rxQuery.collection._queryCache.getByQuery(rxQuery);
}
function createRxQuery(op, queryObj, collection, other) {
  runPluginHooks('preCreateRxQuery', {
    op,
    queryObj,
    collection,
    other
  });
  var ret = new RxQueryBase(op, queryObj, collection, other);

  // ensure when created with same params, only one is created
  ret = tunnelQueryCache(ret);
  triggerCacheReplacement(collection);
  return ret;
}

/**
 * Check if the current results-state is in sync with the database
 * which means that no write event happened since the last run.
 * @return false if not which means it should re-execute
 */
function _isResultsInSync(rxQuery) {
  var currentLatestEventNumber = rxQuery.asRxQuery.collection._changeEventBuffer.counter;
  if (rxQuery._latestChangeEvent >= currentLatestEventNumber) {
    return true;
  } else {
    return false;
  }
}

/**
 * wraps __ensureEqual()
 * to ensure it does not run in parallel
 * @return true if has changed, false if not
 */
function _ensureEqual(rxQuery) {
  // Optimisation shortcut
  if (rxQuery.collection.database.destroyed || _isResultsInSync(rxQuery)) {
    return PROMISE_RESOLVE_FALSE;
  }
  rxQuery._ensureEqualQueue = rxQuery._ensureEqualQueue.then(() => __ensureEqual(rxQuery));
  return rxQuery._ensureEqualQueue;
}

/**
 * ensures that the results of this query is equal to the results which a query over the database would give
 * @return true if results have changed
 */
function __ensureEqual(rxQuery) {
  rxQuery._lastEnsureEqual = now$2();

  /**
   * Optimisation shortcuts
   */
  if (
  // db is closed
  rxQuery.collection.database.destroyed ||
  // nothing happened since last run
  _isResultsInSync(rxQuery)) {
    return PROMISE_RESOLVE_FALSE;
  }
  var ret = false;
  var mustReExec = false; // if this becomes true, a whole execution over the database is made
  if (rxQuery._latestChangeEvent === -1) {
    // have not executed yet -> must run
    mustReExec = true;
  }

  /**
   * try to use EventReduce to calculate the new results
   */
  if (!mustReExec) {
    var missedChangeEvents = rxQuery.asRxQuery.collection._changeEventBuffer.getFrom(rxQuery._latestChangeEvent + 1);
    if (missedChangeEvents === null) {
      // changeEventBuffer is of bounds -> we must re-execute over the database
      mustReExec = true;
    } else {
      rxQuery._latestChangeEvent = rxQuery.asRxQuery.collection._changeEventBuffer.counter;
      var runChangeEvents = rxQuery.asRxQuery.collection._changeEventBuffer.reduceByLastOfDoc(missedChangeEvents);
      if (rxQuery.op === 'count') {
        // 'count' query
        var previousCount = ensureNotFalsy(rxQuery._result).count;
        var newCount = previousCount;
        runChangeEvents.forEach(cE => {
          var didMatchBefore = cE.previousDocumentData && rxQuery.doesDocumentDataMatch(cE.previousDocumentData);
          var doesMatchNow = rxQuery.doesDocumentDataMatch(cE.documentData);
          if (!didMatchBefore && doesMatchNow) {
            newCount++;
          }
          if (didMatchBefore && !doesMatchNow) {
            newCount--;
          }
        });
        if (newCount !== previousCount) {
          ret = true; // true because results changed
          rxQuery._setResultData(newCount);
        }
      } else {
        // 'find' or 'findOne' query
        var eventReduceResult = calculateNewResults(rxQuery, runChangeEvents);
        if (eventReduceResult.runFullQueryAgain) {
          // could not calculate the new results, execute must be done
          mustReExec = true;
        } else if (eventReduceResult.changed) {
          // we got the new results, we do not have to re-execute, mustReExec stays false
          ret = true; // true because results changed
          rxQuery._setResultData(eventReduceResult.newResults);
        }
      }
    }
  }

  // oh no we have to re-execute the whole query over the database
  if (mustReExec) {
    return rxQuery._execOverDatabase().then(newResultData => {
      /**
       * The RxStorage is defined to always first emit events and then return
       * on bulkWrite() calls. So here we have to use the counter AFTER the execOverDatabase()
       * has been run, not the one from before.
       */
      rxQuery._latestChangeEvent = rxQuery.collection._changeEventBuffer.counter;

      // A count query needs a different has-changed check.
      if (typeof newResultData === 'number') {
        if (!rxQuery._result || newResultData !== rxQuery._result.count) {
          ret = true;
          rxQuery._setResultData(newResultData);
        }
        return ret;
      }
      if (!rxQuery._result || !areRxDocumentArraysEqual(rxQuery.collection.schema.primaryPath, newResultData, rxQuery._result.docsData)) {
        ret = true; // true because results changed
        rxQuery._setResultData(newResultData);
      }
      return ret;
    });
  }
  return Promise.resolve(ret); // true if results have changed
}

/**
 * @returns a format of the query that can be used with the storage
 * when calling RxStorageInstance().query()
 */
function prepareQuery(schema, mutateableQuery) {
  if (!mutateableQuery.sort) {
    throw newRxError('SNH', {
      query: mutateableQuery
    });
  }

  /**
   * Store the query plan together with the
   * prepared query to save performance.
   */
  var queryPlan = getQueryPlan(schema, mutateableQuery);
  return {
    query: mutateableQuery,
    queryPlan
  };
}

/**
 * Runs the query over the storage instance
 * of the collection.
 * Does some optimizations to ensure findById is used
 * when specific queries are used.
 */
async function queryCollection(rxQuery) {
  var docs = [];
  var collection = rxQuery.collection;

  /**
   * Optimizations shortcut.
   * If query is find-one-document-by-id,
   * then we do not have to use the slow query() method
   * but instead can use findDocumentsById()
   */
  if (rxQuery.isFindOneByIdQuery) {
    if (Array.isArray(rxQuery.isFindOneByIdQuery)) {
      var docIds = rxQuery.isFindOneByIdQuery;
      docIds = docIds.filter(docId => {
        // first try to fill from docCache
        var docData = rxQuery.collection._docCache.getLatestDocumentDataIfExists(docId);
        if (docData) {
          if (!docData._deleted) {
            docs.push(docData);
          }
          return false;
        } else {
          return true;
        }
      });
      // otherwise get from storage
      if (docIds.length > 0) {
        var docsFromStorage = await collection.storageInstance.findDocumentsById(docIds, false);
        appendToArray(docs, docsFromStorage);
      }
    } else {
      var docId = rxQuery.isFindOneByIdQuery;

      // first try to fill from docCache
      var docData = rxQuery.collection._docCache.getLatestDocumentDataIfExists(docId);
      if (!docData) {
        // otherwise get from storage
        var fromStorageList = await collection.storageInstance.findDocumentsById([docId], false);
        if (fromStorageList[0]) {
          docData = fromStorageList[0];
        }
      }
      if (docData && !docData._deleted) {
        docs.push(docData);
      }
    }
  } else {
    var preparedQuery = rxQuery.getPreparedQuery();
    var queryResult = await collection.storageInstance.query(preparedQuery);
    docs = queryResult.documents;
  }
  return docs;
}

/**
 * Returns true if the given query
 * selects exactly one document by its id.
 * Used to optimize performance because these kind of
 * queries do not have to run over an index and can use get-by-id instead.
 * Returns false if no query of that kind.
 * Returns the document id otherwise.
 */
function isFindOneByIdQuery(primaryPath, query) {
  // must have exactly one operator which must be $eq || $in
  if (!query.skip && query.selector && Object.keys(query.selector).length === 1 && query.selector[primaryPath]) {
    var value = query.selector[primaryPath];
    if (typeof value === 'string') {
      return value;
    } else if (Object.keys(value).length === 1 && typeof value.$eq === 'string') {
      return value.$eq;
    }

    // same with $in string arrays
    if (Object.keys(value).length === 1 && Array.isArray(value.$eq) &&
    // must only contain strings
    !value.$eq.find(r => typeof r !== 'string')) {
      return value.$eq;
    }
  }
  return false;
}

/**
 * Helper functions for accessing the RxStorage instances.
 */

var INTERNAL_STORAGE_NAME = '_rxdb_internal';
async function getSingleDocument(storageInstance, documentId) {
  var results = await storageInstance.findDocumentsById([documentId], false);
  var doc = results[0];
  if (doc) {
    return doc;
  } else {
    return undefined;
  }
}
function throwIfIsStorageWriteError(collection, documentId, writeData, error) {
  if (error) {
    if (error.status === 409) {
      throw newRxError('CONFLICT', {
        collection: collection.name,
        id: documentId,
        writeError: error,
        data: writeData
      });
    } else if (error.status === 422) {
      throw newRxError('VD2', {
        collection: collection.name,
        id: documentId,
        writeError: error,
        data: writeData
      });
    } else {
      throw error;
    }
  }
}

/**
 * Analyzes a list of BulkWriteRows and determines
 * which documents must be inserted, updated or deleted
 * and which events must be emitted and which documents cause a conflict
 * and must not be written.
 * Used as helper inside of some RxStorage implementations.
 * @hotPath The performance of this function is critical
 */
function categorizeBulkWriteRows(storageInstance, primaryPath,
/**
 * Current state of the documents
 * inside of the storage. Used to determine
 * which writes cause conflicts.
 * This must be a Map for better performance.
 */
docsInDb,
/**
 * The write rows that are passed to
 * RxStorageInstance().bulkWrite().
 */
bulkWriteRows, context,
/**
 * Used by some storages for better performance.
 * For example when get-by-id and insert/update can run in parallel.
 */
onInsert, onUpdate) {
  var hasAttachments = !!storageInstance.schema.attachments;
  var bulkInsertDocs = [];
  var bulkUpdateDocs = [];
  var errors = [];
  var eventBulkId = randomCouchString(10);
  var eventBulk = {
    id: eventBulkId,
    events: [],
    checkpoint: null,
    context,
    startTime: now$2(),
    endTime: 0
  };
  var eventBulkEvents = eventBulk.events;
  var attachmentsAdd = [];
  var attachmentsRemove = [];
  var attachmentsUpdate = [];
  var hasDocsInDb = docsInDb.size > 0;
  var newestRow;

  /**
   * @performance is really important in this loop!
   */
  var rowAmount = bulkWriteRows.length;
  var _loop = function () {
    var writeRow = bulkWriteRows[rowId];

    // use these variables to have less property accesses
    var document = writeRow.document;
    var previous = writeRow.previous;
    var docId = document[primaryPath];
    var documentDeleted = document._deleted;
    var previousDeleted = previous && previous._deleted;
    var documentInDb = undefined;
    if (hasDocsInDb) {
      documentInDb = docsInDb.get(docId);
    }
    var attachmentError;
    if (!documentInDb) {
      /**
       * It is possible to insert already deleted documents,
       * this can happen on replication.
       */
      var insertedIsDeleted = documentDeleted ? true : false;
      if (hasAttachments) {
        Object.entries(document._attachments).forEach(([attachmentId, attachmentData]) => {
          if (!attachmentData.data) {
            attachmentError = {
              documentId: docId,
              isError: true,
              status: 510,
              writeRow,
              attachmentId
            };
            errors.push(attachmentError);
          } else {
            attachmentsAdd.push({
              documentId: docId,
              attachmentId,
              attachmentData: attachmentData,
              digest: attachmentData.digest
            });
          }
        });
      }
      if (!attachmentError) {
        if (hasAttachments) {
          bulkInsertDocs.push(stripAttachmentsDataFromRow(writeRow));
        } else {
          bulkInsertDocs.push(writeRow);
        }
        newestRow = writeRow;
      }
      if (!insertedIsDeleted) {
        var event = {
          documentId: docId,
          operation: 'INSERT',
          documentData: hasAttachments ? stripAttachmentsDataFromDocument(document) : document,
          previousDocumentData: hasAttachments && previous ? stripAttachmentsDataFromDocument(previous) : previous
        };
        eventBulkEvents.push(event);
      }
    } else {
      // update existing document
      var revInDb = documentInDb._rev;

      /**
       * Check for conflict
       */
      if (!previous || !!previous && revInDb !== previous._rev) {
        // is conflict error
        var err = {
          isError: true,
          status: 409,
          documentId: docId,
          writeRow: writeRow,
          documentInDb
        };
        errors.push(err);
        return 1; // continue
      }

      // handle attachments data

      var updatedRow = hasAttachments ? stripAttachmentsDataFromRow(writeRow) : writeRow;
      if (hasAttachments) {
        if (documentDeleted) {
          /**
           * Deleted documents must have cleared all their attachments.
           */
          if (previous) {
            Object.keys(previous._attachments).forEach(attachmentId => {
              attachmentsRemove.push({
                documentId: docId,
                attachmentId,
                digest: ensureNotFalsy(previous)._attachments[attachmentId].digest
              });
            });
          }
        } else {
          // first check for errors
          Object.entries(document._attachments).find(([attachmentId, attachmentData]) => {
            var previousAttachmentData = previous ? previous._attachments[attachmentId] : undefined;
            if (!previousAttachmentData && !attachmentData.data) {
              attachmentError = {
                documentId: docId,
                documentInDb: documentInDb,
                isError: true,
                status: 510,
                writeRow,
                attachmentId
              };
            }
            return true;
          });
          if (!attachmentError) {
            Object.entries(document._attachments).forEach(([attachmentId, attachmentData]) => {
              var previousAttachmentData = previous ? previous._attachments[attachmentId] : undefined;
              if (!previousAttachmentData) {
                attachmentsAdd.push({
                  documentId: docId,
                  attachmentId,
                  attachmentData: attachmentData,
                  digest: attachmentData.digest
                });
              } else {
                var newDigest = updatedRow.document._attachments[attachmentId].digest;
                if (attachmentData.data &&
                /**
                 * Performance shortcut,
                 * do not update the attachment data if it did not change.
                 */
                previousAttachmentData.digest !== newDigest) {
                  attachmentsUpdate.push({
                    documentId: docId,
                    attachmentId,
                    attachmentData: attachmentData,
                    digest: attachmentData.digest
                  });
                }
              }
            });
          }
        }
      }
      if (attachmentError) {
        errors.push(attachmentError);
      } else {
        if (hasAttachments) {
          bulkUpdateDocs.push(stripAttachmentsDataFromRow(updatedRow));
        } else {
          bulkUpdateDocs.push(updatedRow);
        }
        newestRow = updatedRow;
      }
      var eventDocumentData = null;
      var previousEventDocumentData = null;
      var operation = null;
      if (previousDeleted && !documentDeleted) {
        operation = 'INSERT';
        eventDocumentData = hasAttachments ? stripAttachmentsDataFromDocument(document) : document;
      } else if (previous && !previousDeleted && !documentDeleted) {
        operation = 'UPDATE';
        eventDocumentData = hasAttachments ? stripAttachmentsDataFromDocument(document) : document;
        previousEventDocumentData = previous;
      } else if (documentDeleted) {
        operation = 'DELETE';
        eventDocumentData = ensureNotFalsy(document);
        previousEventDocumentData = previous;
      } else {
        throw newRxError('SNH', {
          args: {
            writeRow
          }
        });
      }
      var _event = {
        documentId: docId,
        documentData: eventDocumentData,
        previousDocumentData: previousEventDocumentData,
        operation: operation
      };
      eventBulkEvents.push(_event);
    }
  };
  for (var rowId = 0; rowId < rowAmount; rowId++) {
    if (_loop()) continue;
  }
  return {
    bulkInsertDocs,
    bulkUpdateDocs,
    newestRow,
    errors,
    eventBulk,
    attachmentsAdd,
    attachmentsRemove,
    attachmentsUpdate
  };
}
function stripAttachmentsDataFromRow(writeRow) {
  return {
    previous: writeRow.previous,
    document: stripAttachmentsDataFromDocument(writeRow.document)
  };
}
function getAttachmentSize(attachmentBase64String) {
  return atob(attachmentBase64String).length;
}

/**
 * Used in custom RxStorage implementations.
 */
function attachmentWriteDataToNormalData(writeData) {
  var data = writeData.data;
  if (!data) {
    return writeData;
  }
  var ret = {
    length: getAttachmentSize(data),
    digest: writeData.digest,
    type: writeData.type
  };
  return ret;
}
function stripAttachmentsDataFromDocument(doc) {
  if (!doc._attachments || Object.keys(doc._attachments).length === 0) {
    return doc;
  }
  var useDoc = flatClone(doc);
  useDoc._attachments = {};
  Object.entries(doc._attachments).forEach(([attachmentId, attachmentData]) => {
    useDoc._attachments[attachmentId] = attachmentWriteDataToNormalData(attachmentData);
  });
  return useDoc;
}

/**
 * Flat clone the document data
 * and also the _meta field.
 * Used many times when we want to change the meta
 * during replication etc.
 */
function flatCloneDocWithMeta(doc) {
  return Object.assign({}, doc, {
    _meta: flatClone(doc._meta)
  });
}
/**
 * Wraps the normal storageInstance of a RxCollection
 * to ensure that all access is properly using the hooks
 * and other data transformations and also ensure that database.lockedRun()
 * is used properly.
 */
function getWrappedStorageInstance(database, storageInstance,
/**
 * The original RxJsonSchema
 * before it was mutated by hooks.
 */
rxJsonSchema) {
  overwritable.deepFreezeWhenDevMode(rxJsonSchema);
  var ret = {
    originalStorageInstance: storageInstance,
    schema: storageInstance.schema,
    internals: storageInstance.internals,
    collectionName: storageInstance.collectionName,
    databaseName: storageInstance.databaseName,
    options: storageInstance.options,
    bulkWrite(rows, context) {
      var databaseToken = database.token;
      var toStorageWriteRows = new Array(rows.length);
      /**
       * Use the same timestamp for all docs of this rows-set.
       * This improves performance because calling Date.now() inside of the now() function
       * is too costly.
       */
      var time = now$2();
      for (var index = 0; index < rows.length; index++) {
        var writeRow = rows[index];
        var document = flatCloneDocWithMeta(writeRow.document);
        document._meta.lwt = time;

        /**
         * Yes we really want to set the revision here.
         * If you make a plugin that relies on having its own revision
         * stored into the storage, use this.originalStorageInstance.bulkWrite() instead.
         */
        var previous = writeRow.previous;
        document._rev = createRevision(databaseToken, previous);
        toStorageWriteRows[index] = {
          document,
          previous
        };
      }
      runPluginHooks('preStorageWrite', {
        storageInstance: this.originalStorageInstance,
        rows: toStorageWriteRows
      });
      return database.lockedRun(() => storageInstance.bulkWrite(toStorageWriteRows, context))
      /**
       * The RxStorageInstance MUST NOT allow to insert already _deleted documents,
       * without sending the previous document version.
       * But for better developer experience, RxDB does allow to re-insert deleted documents.
       * We do this by automatically fixing the conflict errors for that case
       * by running another bulkWrite() and merging the results.
       * @link https://github.com/pubkey/rxdb/pull/3839
       */.then(writeResult => {
        var useWriteResult = {
          error: [],
          success: writeResult.success.slice(0)
        };
        var reInsertErrors = writeResult.error.length === 0 ? [] : writeResult.error.filter(error => {
          if (error.status === 409 && !error.writeRow.previous && !error.writeRow.document._deleted && ensureNotFalsy(error.documentInDb)._deleted) {
            return true;
          }
          useWriteResult.error.push(error);
          return false;
        });
        if (reInsertErrors.length > 0) {
          var reInserts = reInsertErrors.map(error => {
            return {
              previous: error.documentInDb,
              document: Object.assign({}, error.writeRow.document, {
                _rev: createRevision(database.token, error.documentInDb)
              })
            };
          });
          return database.lockedRun(() => storageInstance.bulkWrite(reInserts, context)).then(subResult => {
            appendToArray(useWriteResult.error, subResult.error);
            appendToArray(useWriteResult.success, subResult.success);
            return useWriteResult;
          });
        }
        return writeResult;
      });
    },
    query(preparedQuery) {
      return database.lockedRun(() => storageInstance.query(preparedQuery));
    },
    count(preparedQuery) {
      return database.lockedRun(() => storageInstance.count(preparedQuery));
    },
    findDocumentsById(ids, deleted) {
      return database.lockedRun(() => storageInstance.findDocumentsById(ids, deleted));
    },
    getAttachmentData(documentId, attachmentId, digest) {
      return database.lockedRun(() => storageInstance.getAttachmentData(documentId, attachmentId, digest));
    },
    getChangedDocumentsSince: !storageInstance.getChangedDocumentsSince ? undefined : (limit, checkpoint) => {
      return database.lockedRun(() => storageInstance.getChangedDocumentsSince(ensureNotFalsy(limit), checkpoint));
    },
    cleanup(minDeletedTime) {
      return database.lockedRun(() => storageInstance.cleanup(minDeletedTime));
    },
    remove() {
      database.storageInstances.delete(ret);
      return database.lockedRun(() => storageInstance.remove());
    },
    close() {
      database.storageInstances.delete(ret);
      return database.lockedRun(() => storageInstance.close());
    },
    changeStream() {
      return storageInstance.changeStream();
    },
    conflictResultionTasks() {
      return storageInstance.conflictResultionTasks();
    },
    resolveConflictResultionTask(taskSolution) {
      if (taskSolution.output.isEqual) {
        return storageInstance.resolveConflictResultionTask(taskSolution);
      }
      var doc = Object.assign({}, taskSolution.output.documentData, {
        _meta: getDefaultRxDocumentMeta(),
        _rev: getDefaultRevision(),
        _attachments: {}
      });
      var documentData = flatClone(doc);
      delete documentData._meta;
      delete documentData._rev;
      delete documentData._attachments;
      return storageInstance.resolveConflictResultionTask({
        id: taskSolution.id,
        output: {
          isEqual: false,
          documentData
        }
      });
    }
  };
  database.storageInstances.add(ret);
  return ret;
}

/**
 * Each RxStorage implementation should
 * run this method at the first step of createStorageInstance()
 * to ensure that the configuration is correct.
 */
function ensureRxStorageInstanceParamsAreCorrect(params) {
  if (params.schema.keyCompression) {
    throw newRxError('UT5', {
      args: {
        params
      }
    });
  }
  if (hasEncryption(params.schema)) {
    throw newRxError('UT6', {
      args: {
        params
      }
    });
  }
  if (params.schema.attachments && params.schema.attachments.compression) {
    throw newRxError('UT7', {
      args: {
        params
      }
    });
  }
}
function hasEncryption(jsonSchema) {
  if (!!jsonSchema.encrypted && jsonSchema.encrypted.length > 0 || jsonSchema.attachments && jsonSchema.attachments.encrypted) {
    return true;
  } else {
    return false;
  }
}

/**
 * The incremental write queue
 * batches up all incremental writes to a collection
 * so that performance can be improved by:
 * - Running only one write even when there are multiple modifications to the same document.
 * - Run all writes ins a single bulkWrite() call even when there are writes to many documents.
 */
var IncrementalWriteQueue = /*#__PURE__*/function () {
  function IncrementalWriteQueue(storageInstance, primaryPath,
  // can be used to run hooks etc.
  preWrite, postWrite) {
    this.queueByDocId = new Map();
    this.isRunning = false;
    this.storageInstance = storageInstance;
    this.primaryPath = primaryPath;
    this.preWrite = preWrite;
    this.postWrite = postWrite;
  }
  var _proto = IncrementalWriteQueue.prototype;
  _proto.addWrite = function addWrite(lastKnownDocumentState, modifier) {
    var docId = lastKnownDocumentState[this.primaryPath];
    var ar = getFromMapOrCreate(this.queueByDocId, docId, () => []);
    var ret = new Promise((resolve, reject) => {
      var item = {
        lastKnownDocumentState,
        modifier,
        resolve,
        reject
      };
      ensureNotFalsy(ar).push(item);
      this.triggerRun();
    });
    return ret;
  };
  _proto.triggerRun = async function triggerRun() {
    if (this.isRunning === true || this.queueByDocId.size === 0) {
      // already running
      return;
    }
    this.isRunning = true;
    var writeRows = [];

    /**
     * 'take over' so that while the async functions runs,
     * new incremental updates could be added from the outside.
     */
    var itemsById = this.queueByDocId;
    this.queueByDocId = new Map();
    await Promise.all(Array.from(itemsById.entries()).map(async ([_docId, items]) => {
      var oldData = findNewestOfDocumentStates(items.map(i => i.lastKnownDocumentState));
      var newData = oldData;
      for (var item of items) {
        try {
          newData = await item.modifier(
          /**
           * We have to clone() each time because the modifier
           * might throw while it already changed some properties
           * of the document.
           */
          clone(newData));
        } catch (err) {
          item.reject(err);
          item.reject = () => {};
          item.resolve = () => {};
        }
      }
      try {
        await this.preWrite(newData, oldData);
      } catch (err) {
        /**
         * If the before-hooks fail,
         * we reject all of the writes because it is
         * not possible to determine which one is to blame.
         */
        items.forEach(item => item.reject(err));
        return;
      }
      writeRows.push({
        previous: oldData,
        document: newData
      });
    }));
    var writeResult = writeRows.length > 0 ? await this.storageInstance.bulkWrite(writeRows, 'incremental-write') : {
      error: [],
      success: []
    };

    // process success
    await Promise.all(writeResult.success.map(result => {
      var docId = result[this.primaryPath];
      this.postWrite(result);
      var items = getFromMapOrThrow(itemsById, docId);
      items.forEach(item => item.resolve(result));
    }));

    // process errors
    writeResult.error.forEach(error => {
      var docId = error.documentId;
      var items = getFromMapOrThrow(itemsById, docId);
      var isConflict = isBulkWriteConflictError(error);
      if (isConflict) {
        // had conflict -> retry afterwards
        var ar = getFromMapOrCreate(this.queueByDocId, docId, () => []);
        /**
         * Add the items back to this.queueByDocId
         * by maintaining the original order.
         */
        items.reverse().forEach(item => {
          item.lastKnownDocumentState = ensureNotFalsy(isConflict.documentInDb);
          ensureNotFalsy(ar).unshift(item);
        });
      } else {
        // other error -> must be thrown
        var rxError = rxStorageWriteErrorToRxError(error);
        items.forEach(item => item.reject(rxError));
      }
    });
    this.isRunning = false;

    /**
     * Always trigger another run
     * because in between there might be new items
     * been added to the queue.
     */
    return this.triggerRun();
  };
  return IncrementalWriteQueue;
}();
function modifierFromPublicToInternal(publicModifier) {
  var ret = async docData => {
    var withoutMeta = stripMetaDataFromDocument(docData);
    withoutMeta._deleted = docData._deleted;
    var modified = await publicModifier(withoutMeta);
    var reattachedMeta = Object.assign({}, modified, {
      _meta: docData._meta,
      _attachments: docData._attachments,
      _rev: docData._rev,
      _deleted: typeof modified._deleted !== 'undefined' ? modified._deleted : docData._deleted
    });
    if (typeof reattachedMeta._deleted === 'undefined') {
      reattachedMeta._deleted = false;
    }
    return reattachedMeta;
  };
  return ret;
}
function findNewestOfDocumentStates(docs) {
  var newest = docs[0];
  var newestRevisionHeight = getHeightOfRevision(newest._rev);
  docs.forEach(doc => {
    var height = getHeightOfRevision(doc._rev);
    if (height > newestRevisionHeight) {
      newest = doc;
      newestRevisionHeight = height;
    }
  });
  return newest;
}

var basePrototype = {
  get primaryPath() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return undefined;
    }
    return _this.collection.schema.primaryPath;
  },
  get primary() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return undefined;
    }
    return _this._data[_this.primaryPath];
  },
  get revision() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return undefined;
    }
    return _this._data._rev;
  },
  get deleted$() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return undefined;
    }
    return _this.$.pipe(map(d => d._data._deleted));
  },
  get deleted$$() {
    var _this = this;
    var reactivity = _this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(_this.deleted$, _this.getLatest().deleted, _this.collection.database);
  },
  get deleted() {
    var _this = this;
    if (!_this.isInstanceOfRxDocument) {
      return undefined;
    }
    return _this._data._deleted;
  },
  getLatest() {
    var latestDocData = this.collection._docCache.getLatestDocumentData(this.primary);
    return this.collection._docCache.getCachedRxDocument(latestDocData);
  },
  /**
   * returns the observable which emits the plain-data of this document
   */
  get $() {
    var _this = this;
    return _this.collection.$.pipe(filter(changeEvent => !changeEvent.isLocal), filter(changeEvent => changeEvent.documentId === this.primary), map(changeEvent => getDocumentDataOfRxChangeEvent(changeEvent)), startWith(_this.collection._docCache.getLatestDocumentData(this.primary)), distinctUntilChanged((prev, curr) => prev._rev === curr._rev), map(docData => this.collection._docCache.getCachedRxDocument(docData)), shareReplay(RXJS_SHARE_REPLAY_DEFAULTS));
  },
  get $$() {
    var _this = this;
    var reactivity = _this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(_this.$, _this.getLatest()._data, _this.collection.database);
  },
  /**
   * returns observable of the value of the given path
   */
  get$(path) {
    if (overwritable.isDevMode()) {
      if (path.includes('.item.')) {
        throw newRxError('DOC1', {
          path
        });
      }
      if (path === this.primaryPath) {
        throw newRxError('DOC2');
      }

      // final fields cannot be modified and so also not observed
      if (this.collection.schema.finalFields.includes(path)) {
        throw newRxError('DOC3', {
          path
        });
      }
      var schemaObj = getSchemaByObjectPath(this.collection.schema.jsonSchema, path);
      if (!schemaObj) {
        throw newRxError('DOC4', {
          path
        });
      }
    }
    return this.$.pipe(map(data => getProperty$1(data, path)), distinctUntilChanged());
  },
  get$$(path) {
    var obs = this.get$(path);
    var reactivity = this.collection.database.getReactivityFactory();
    return reactivity.fromObservable(obs, this.getLatest().get(path), this.collection.database);
  },
  /**
   * populate the given path
   */
  populate(path) {
    var schemaObj = getSchemaByObjectPath(this.collection.schema.jsonSchema, path);
    var value = this.get(path);
    if (!value) {
      return PROMISE_RESOLVE_NULL;
    }
    if (!schemaObj) {
      throw newRxError('DOC5', {
        path
      });
    }
    if (!schemaObj.ref) {
      throw newRxError('DOC6', {
        path,
        schemaObj
      });
    }
    var refCollection = this.collection.database.collections[schemaObj.ref];
    if (!refCollection) {
      throw newRxError('DOC7', {
        ref: schemaObj.ref,
        path,
        schemaObj
      });
    }
    if (schemaObj.type === 'array') {
      return refCollection.findByIds(value).exec().then(res => {
        var valuesIterator = res.values();
        return Array.from(valuesIterator);
      });
    } else {
      return refCollection.findOne(value).exec();
    }
  },
  /**
   * get data by objectPath
   * @hotPath Performance here is really important,
   * run some tests before changing anything.
   */
  get(objPath) {
    return getFromMapOrCreate(this._propertyCache, objPath, () => {
      var valueObj = getProperty$1(this._data, objPath);

      // direct return if array or non-object
      if (typeof valueObj !== 'object' || valueObj === null || Array.isArray(valueObj)) {
        return overwritable.deepFreezeWhenDevMode(valueObj);
      }
      var _this = this;
      var proxy = new Proxy(
      /**
       * In dev-mode, the _data is deep-frozen
       * so we have to flat clone here so that
       * the proxy can work.
       */
      flatClone(valueObj), {
        get(target, property) {
          if (typeof property !== 'string') {
            return target[property];
          }
          var lastChar = property.charAt(property.length - 1);
          if (property.endsWith('$$')) {
            var key = property.slice(0, -2);
            return _this.get$$(trimDots(objPath + '.' + key));
          } else if (lastChar === '$') {
            var _key = property.slice(0, -1);
            return _this.get$(trimDots(objPath + '.' + _key));
          } else if (lastChar === '_') {
            var _key2 = property.slice(0, -1);
            return _this.populate(trimDots(objPath + '.' + _key2));
          } else {
            return _this.get(trimDots(objPath + '.' + property));
          }
        }
      });
      return proxy;
    });
  },
  toJSON(withMetaFields = false) {
    if (!withMetaFields) {
      var data = flatClone(this._data);
      delete data._rev;
      delete data._attachments;
      delete data._deleted;
      delete data._meta;
      return overwritable.deepFreezeWhenDevMode(data);
    } else {
      return overwritable.deepFreezeWhenDevMode(this._data);
    }
  },
  toMutableJSON(withMetaFields = false) {
    return clone(this.toJSON(withMetaFields));
  },
  /**
   * updates document
   * @overwritten by plugin (optional)
   * @param updateObj mongodb-like syntax
   */
  update(_updateObj) {
    throw pluginMissing('update');
  },
  incrementalUpdate(_updateObj) {
    throw pluginMissing('update');
  },
  updateCRDT(_updateObj) {
    throw pluginMissing('crdt');
  },
  putAttachment() {
    throw pluginMissing('attachments');
  },
  getAttachment() {
    throw pluginMissing('attachments');
  },
  allAttachments() {
    throw pluginMissing('attachments');
  },
  get allAttachments$() {
    throw pluginMissing('attachments');
  },
  async modify(mutationFunction,
  // used by some plugins that wrap the method
  _context) {
    var oldData = this._data;
    var newData = await modifierFromPublicToInternal(mutationFunction)(oldData);
    return this._saveData(newData, oldData);
  },
  /**
   * runs an incremental update over the document
   * @param function that takes the document-data and returns a new data-object
   */
  incrementalModify(mutationFunction,
  // used by some plugins that wrap the method
  _context) {
    return this.collection.incrementalWriteQueue.addWrite(this._data, modifierFromPublicToInternal(mutationFunction)).then(result => this.collection._docCache.getCachedRxDocument(result));
  },
  patch(patch) {
    var oldData = this._data;
    var newData = clone(oldData);
    Object.entries(patch).forEach(([k, v]) => {
      newData[k] = v;
    });
    return this._saveData(newData, oldData);
  },
  /**
   * patches the given properties
   */
  incrementalPatch(patch) {
    return this.incrementalModify(docData => {
      Object.entries(patch).forEach(([k, v]) => {
        docData[k] = v;
      });
      return docData;
    });
  },
  /**
   * saves the new document-data
   * and handles the events
   */
  async _saveData(newData, oldData) {
    newData = flatClone(newData);

    // deleted documents cannot be changed
    if (this._data._deleted) {
      throw newRxError('DOC11', {
        id: this.primary,
        document: this
      });
    }
    await beforeDocumentUpdateWrite(this.collection, newData, oldData);
    var writeResult = await this.collection.storageInstance.bulkWrite([{
      previous: oldData,
      document: newData
    }], 'rx-document-save-data');
    var isError = writeResult.error[0];
    throwIfIsStorageWriteError(this.collection, this.primary, newData, isError);
    await this.collection._runHooks('post', 'save', newData, this);
    return this.collection._docCache.getCachedRxDocument(writeResult.success[0]);
  },
  /**
   * Remove the document.
   * Notice that there is no hard delete,
   * instead deleted documents get flagged with _deleted=true.
   */
  remove() {
    var collection = this.collection;
    if (this.deleted) {
      return Promise.reject(newRxError('DOC13', {
        document: this,
        id: this.primary
      }));
    }
    var deletedData = flatClone(this._data);
    var removedDocData;
    return collection._runHooks('pre', 'remove', deletedData, this).then(async () => {
      deletedData._deleted = true;
      var writeResult = await collection.storageInstance.bulkWrite([{
        previous: this._data,
        document: deletedData
      }], 'rx-document-remove');
      var isError = writeResult.error[0];
      throwIfIsStorageWriteError(collection, this.primary, deletedData, isError);
      return writeResult.success[0];
    }).then(removed => {
      removedDocData = removed;
      return this.collection._runHooks('post', 'remove', deletedData, this);
    }).then(() => {
      return this.collection._docCache.getCachedRxDocument(removedDocData);
    });
  },
  incrementalRemove() {
    return this.incrementalModify(async docData => {
      await this.collection._runHooks('pre', 'remove', docData, this);
      docData._deleted = true;
      return docData;
    }).then(async newDoc => {
      await this.collection._runHooks('post', 'remove', newDoc._data, newDoc);
      return newDoc;
    });
  },
  destroy() {
    throw newRxError('DOC14');
  }
};
function createRxDocumentConstructor(proto = basePrototype) {
  var constructor = function RxDocumentConstructor(collection, docData) {
    this.collection = collection;

    // assume that this is always equal to the doc-data in the database
    this._data = docData;
    this._propertyCache = new Map();

    /**
     * because of the prototype-merge,
     * we can not use the native instanceof operator
     */
    this.isInstanceOfRxDocument = true;
  };
  constructor.prototype = proto;
  return constructor;
}
function createWithConstructor(constructor, collection, jsonData) {
  var doc = new constructor(collection, jsonData);
  runPluginHooks('createRxDocument', doc);
  return doc;
}
function beforeDocumentUpdateWrite(collection, newData, oldData) {
  /**
   * Meta values must always be merged
   * instead of overwritten.
   * This ensures that different plugins do not overwrite
   * each others meta properties.
   */
  newData._meta = Object.assign({}, oldData._meta, newData._meta);

  // ensure modifications are ok
  if (overwritable.isDevMode()) {
    collection.schema.validateChange(oldData, newData);
  }
  return collection._runHooks('pre', 'save', newData, oldData);
}

var INTERNAL_CONTEXT_COLLECTION = 'collection';
var INTERNAL_CONTEXT_STORAGE_TOKEN = 'storage-token';
var INTERNAL_CONTEXT_MIGRATION_STATUS = 'rx-migration-status';

/**
 * Do not change the title,
 * we have to flag the internal schema so that
 * some RxStorage implementations are able
 * to detect if the created RxStorageInstance
 * is from the internals or not,
 * to do some optimizations in some cases.
 */
var INTERNAL_STORE_SCHEMA_TITLE = 'RxInternalDocument';
var INTERNAL_STORE_SCHEMA = fillWithDefaultSettings({
  version: 0,
  title: INTERNAL_STORE_SCHEMA_TITLE,
  primaryKey: {
    key: 'id',
    fields: ['context', 'key'],
    separator: '|'
  },
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 200
    },
    key: {
      type: 'string'
    },
    context: {
      type: 'string',
      enum: [INTERNAL_CONTEXT_COLLECTION, INTERNAL_CONTEXT_STORAGE_TOKEN, INTERNAL_CONTEXT_MIGRATION_STATUS, 'OTHER']
    },
    data: {
      type: 'object',
      additionalProperties: true
    }
  },
  indexes: [],
  required: ['key', 'context', 'data'],
  additionalProperties: false,
  /**
   * If the sharding plugin is used,
   * it must not shard on the internal RxStorageInstance
   * because that one anyway has only a small amount of documents
   * and also its creation is in the hot path of the initial page load,
   * so we should spend less time creating multiple RxStorageInstances.
   */
  sharding: {
    shards: 1,
    mode: 'collection'
  }
});
function getPrimaryKeyOfInternalDocument(key, context) {
  return getComposedPrimaryKeyOfDocumentData(INTERNAL_STORE_SCHEMA, {
    key,
    context
  });
}

/**
 * Returns all internal documents
 * with context 'collection'
 */
async function getAllCollectionDocuments(storageInstance) {
  var getAllQueryPrepared = prepareQuery(storageInstance.schema, {
    selector: {
      context: INTERNAL_CONTEXT_COLLECTION,
      _deleted: {
        $eq: false
      }
    },
    sort: [{
      id: 'asc'
    }],
    skip: 0
  });
  var queryResult = await storageInstance.query(getAllQueryPrepared);
  var allDocs = queryResult.documents;
  return allDocs;
}

/**
 * to not confuse multiInstance-messages with other databases that have the same
 * name and adapter, but do not share state with this one (for example in-memory-instances),
 * we set a storage-token and use it in the broadcast-channel
 */
var STORAGE_TOKEN_DOCUMENT_KEY = 'storageToken';
var STORAGE_TOKEN_DOCUMENT_ID = getPrimaryKeyOfInternalDocument(STORAGE_TOKEN_DOCUMENT_KEY, INTERNAL_CONTEXT_STORAGE_TOKEN);
async function ensureStorageTokenDocumentExists(rxDatabase) {
  /**
   * To have less read-write cycles,
   * we just try to insert a new document
   * and only fetch the existing one if a conflict happened.
   */
  var storageToken = randomCouchString(10);
  var passwordHash = rxDatabase.password ? await rxDatabase.hashFunction(JSON.stringify(rxDatabase.password)) : undefined;
  var docData = {
    id: STORAGE_TOKEN_DOCUMENT_ID,
    context: INTERNAL_CONTEXT_STORAGE_TOKEN,
    key: STORAGE_TOKEN_DOCUMENT_KEY,
    data: {
      rxdbVersion: rxDatabase.rxdbVersion,
      token: storageToken,
      /**
       * We add the instance token here
       * to be able to detect if a given RxDatabase instance
       * is the first instance that was ever created
       * or if databases have existed earlier on that storage
       * with the same database name.
       */
      instanceToken: rxDatabase.token,
      passwordHash
    },
    _deleted: false,
    _meta: getDefaultRxDocumentMeta(),
    _rev: getDefaultRevision(),
    _attachments: {}
  };
  var writeResult = await rxDatabase.internalStore.bulkWrite([{
    document: docData
  }], 'internal-add-storage-token');
  if (writeResult.success[0]) {
    return writeResult.success[0];
  }

  /**
   * If we get a 409 error,
   * it means another instance already inserted the storage token.
   * So we get that token from the database and return that one.
   */
  var error = ensureNotFalsy(writeResult.error[0]);
  if (error.isError && isBulkWriteConflictError(error)) {
    var conflictError = error;
    if (!isDatabaseStateVersionCompatibleWithDatabaseCode(conflictError.documentInDb.data.rxdbVersion, rxDatabase.rxdbVersion)) {
      throw newRxError('DM5', {
        args: {
          database: rxDatabase.name,
          databaseStateVersion: conflictError.documentInDb.data.rxdbVersion,
          codeVersion: rxDatabase.rxdbVersion
        }
      });
    }
    if (passwordHash && passwordHash !== conflictError.documentInDb.data.passwordHash) {
      throw newRxError('DB1', {
        passwordHash,
        existingPasswordHash: conflictError.documentInDb.data.passwordHash
      });
    }
    var storageTokenDocInDb = conflictError.documentInDb;
    return ensureNotFalsy(storageTokenDocInDb);
  }
  throw error;
}
function isDatabaseStateVersionCompatibleWithDatabaseCode(databaseStateVersion, codeVersion) {
  if (!databaseStateVersion) {
    return false;
  }
  if (codeVersion.includes('beta') && codeVersion !== databaseStateVersion) {
    return false;
  }
  var stateMajor = databaseStateVersion.split('.')[0];
  var codeMajor = codeVersion.split('.')[0];
  if (stateMajor !== codeMajor) {
    return false;
  }
  return true;
}

/**
 * returns the primary for a given collection-data
 * used in the internal store of a RxDatabase
 */
function _collectionNamePrimary(name, schema) {
  return name + '-' + schema.version;
}

/**
 * fills in the default data.
 * This also clones the data.
 */
function fillObjectDataBeforeInsert(schema, data) {
  data = flatClone(data);
  data = fillObjectWithDefaults(schema, data);
  data = fillPrimaryKey(schema.primaryPath, schema.jsonSchema, data);
  data._meta = getDefaultRxDocumentMeta();
  if (!Object.prototype.hasOwnProperty.call(data, '_deleted')) {
    data._deleted = false;
  }
  if (!Object.prototype.hasOwnProperty.call(data, '_attachments')) {
    data._attachments = {};
  }
  if (!Object.prototype.hasOwnProperty.call(data, '_rev')) {
    data._rev = getDefaultRevision();
  }
  return data;
}

/**
 * Creates the storage instances that are used internally in the collection
 */
async function createRxCollectionStorageInstance(rxDatabase, storageInstanceCreationParams) {
  storageInstanceCreationParams.multiInstance = rxDatabase.multiInstance;
  var storageInstance = await rxDatabase.storage.createStorageInstance(storageInstanceCreationParams);
  return storageInstance;
}

/**
 * Removes the main storage of the collection
 * and all connected storages like the ones from the replication meta etc.
 */
async function removeCollectionStorages(storage, databaseInternalStorage, databaseInstanceToken, databaseName, collectionName, password,
/**
 * If no hash function is provided,
 * we assume that the whole internal store is removed anyway
 * so we do not have to delete the meta documents.
 */
hashFunction) {
  var allCollectionMetaDocs = await getAllCollectionDocuments(databaseInternalStorage);
  var relevantCollectionMetaDocs = allCollectionMetaDocs.filter(metaDoc => metaDoc.data.name === collectionName);
  var removeStorages = [];
  relevantCollectionMetaDocs.forEach(metaDoc => {
    removeStorages.push({
      collectionName: metaDoc.data.name,
      schema: metaDoc.data.schema,
      isCollection: true
    });
    metaDoc.data.connectedStorages.forEach(row => removeStorages.push({
      collectionName: row.collectionName,
      isCollection: false,
      schema: row.schema
    }));
  });

  // ensure uniqueness
  var alreadyAdded = new Set();
  removeStorages = removeStorages.filter(row => {
    var key = row.collectionName + '||' + row.schema.version;
    if (alreadyAdded.has(key)) {
      return false;
    } else {
      alreadyAdded.add(key);
      return true;
    }
  });

  // remove all the storages
  await Promise.all(removeStorages.map(async row => {
    var storageInstance = await storage.createStorageInstance({
      collectionName: row.collectionName,
      databaseInstanceToken,
      databaseName,
      multiInstance: false,
      options: {},
      schema: row.schema,
      password,
      devMode: overwritable.isDevMode()
    });
    await storageInstance.remove();
    if (row.isCollection) {
      await runAsyncPluginHooks('postRemoveRxCollection', {
        storage,
        databaseName: databaseName,
        collectionName
      });
    }
  }));

  // remove the meta documents
  if (hashFunction) {
    var writeRows = relevantCollectionMetaDocs.map(doc => {
      var writeDoc = flatCloneDocWithMeta(doc);
      writeDoc._deleted = true;
      writeDoc._meta.lwt = now$2();
      writeDoc._rev = createRevision(databaseInstanceToken, doc);
      return {
        previous: doc,
        document: writeDoc
      };
    });
    await databaseInternalStorage.bulkWrite(writeRows, 'rx-database-remove-collection-all');
  }
}
function ensureRxCollectionIsNotDestroyed(collection) {
  if (collection.destroyed) {
    throw newRxError('COL21', {
      collection: collection.name,
      version: collection.schema.version
    });
  }
}

/**
 * a buffer-cache which holds the last X changeEvents of the collection
 */

var ChangeEventBuffer = /*#__PURE__*/function () {
  /**
   * array with changeEvents
   * starts with oldest known event, ends with newest
   */

  function ChangeEventBuffer(collection) {
    this.subs = [];
    this.limit = 100;
    this.counter = 0;
    this.eventCounterMap = new WeakMap();
    this.buffer = [];
    this.collection = collection;
    this.subs.push(this.collection.$.pipe(filter(cE => !cE.isLocal)).subscribe(cE => this._handleChangeEvent(cE)));
  }
  var _proto = ChangeEventBuffer.prototype;
  _proto._handleChangeEvent = function _handleChangeEvent(changeEvent) {
    this.counter++;
    this.buffer.push(changeEvent);
    this.eventCounterMap.set(changeEvent, this.counter);
    while (this.buffer.length > this.limit) {
      this.buffer.shift();
    }
  }

  /**
   * gets the array-index for the given pointer
   * @return arrayIndex which can be used to iterate from there. If null, pointer is out of lower bound
   */;
  _proto.getArrayIndexByPointer = function getArrayIndexByPointer(pointer) {
    var oldestEvent = this.buffer[0];
    var oldestCounter = this.eventCounterMap.get(oldestEvent);
    if (pointer < oldestCounter) return null; // out of bounds

    var rest = pointer - oldestCounter;
    return rest;
  }

  /**
   * get all changeEvents which came in later than the pointer-event
   * @return array with change-events. If null, pointer out of bounds
   */;
  _proto.getFrom = function getFrom(pointer) {
    var ret = [];
    var currentIndex = this.getArrayIndexByPointer(pointer);
    if (currentIndex === null)
      // out of bounds
      return null;
    while (true) {
      var nextEvent = this.buffer[currentIndex];
      currentIndex++;
      if (!nextEvent) {
        return ret;
      } else {
        ret.push(nextEvent);
      }
    }
  };
  _proto.runFrom = function runFrom(pointer, fn) {
    var ret = this.getFrom(pointer);
    if (ret === null) {
      throw new Error('out of bounds');
    } else {
      ret.forEach(cE => fn(cE));
    }
  }

  /**
   * no matter how many operations are done on one document,
   * only the last operation has to be checked to calculate the new state
   * this function reduces the events to the last ChangeEvent of each doc
   */;
  _proto.reduceByLastOfDoc = function reduceByLastOfDoc(changeEvents) {
    return changeEvents.slice(0);
  };
  _proto.destroy = function destroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  };
  return ChangeEventBuffer;
}();
function createChangeEventBuffer(collection) {
  return new ChangeEventBuffer(collection);
}

/**
 * For the ORM capabilities,
 * we have to merge the document prototype
 * with the ORM functions and the data
 * We do this iterating over the properties and
 * adding them to a new object.
 * In the future we should do this by chaining the __proto__ objects
 */

var constructorForCollection = new WeakMap();
function getDocumentPrototype(rxCollection) {
  var schemaProto = rxCollection.schema.getDocumentPrototype();
  var ormProto = getDocumentOrmPrototype(rxCollection);
  var baseProto = basePrototype;
  var proto = {};
  [schemaProto, ormProto, baseProto].forEach(obj => {
    var props = Object.getOwnPropertyNames(obj);
    props.forEach(key => {
      var desc = Object.getOwnPropertyDescriptor(obj, key);
      /**
       * When enumerable is true, it will show on console dir(instance)
       * To not pollute the output, only getters and methods are enumerable
       */
      var enumerable = true;
      if (key.startsWith('_') || key.endsWith('_') || key.startsWith('$') || key.endsWith('$')) enumerable = false;
      if (typeof desc.value === 'function') {
        // when getting a function, we automatically do a .bind(this)
        Object.defineProperty(proto, key, {
          get() {
            return desc.value.bind(this);
          },
          enumerable,
          configurable: false
        });
      } else {
        desc.enumerable = enumerable;
        desc.configurable = false;
        if (desc.writable) desc.writable = false;
        Object.defineProperty(proto, key, desc);
      }
    });
  });
  return proto;
}
function getRxDocumentConstructor(rxCollection) {
  return getFromMapOrCreate(constructorForCollection, rxCollection, () => createRxDocumentConstructor(getDocumentPrototype(rxCollection)));
}

/**
 * Create a RxDocument-instance from the jsonData
 * and the prototype merge.
 * You should never call this method directly,
 * instead you should get the document from collection._docCache.getCachedRxDocument().
 */
function createNewRxDocument(rxCollection, documentConstructor, docData) {
  var doc = createWithConstructor(documentConstructor, rxCollection, overwritable.deepFreezeWhenDevMode(docData));
  rxCollection._runHooksSync('post', 'create', docData, doc);
  runPluginHooks('postCreateRxDocument', doc);
  return doc;
}

/**
 * returns the prototype-object
 * that contains the orm-methods,
 * used in the proto-merge
 */
function getDocumentOrmPrototype(rxCollection) {
  var proto = {};
  Object.entries(rxCollection.methods).forEach(([k, v]) => {
    proto[k] = v;
  });
  return proto;
}

var defaultConflictHandler = function (i, _context) {
  var newDocumentState = stripAttachmentsDataFromDocument(i.newDocumentState);
  var realMasterState = stripAttachmentsDataFromDocument(i.realMasterState);

  /**
   * If the documents are deep equal,
   * we have no conflict.
   * On your custom conflict handler you might only
   * check some properties, like the updatedAt time,
   * for better performance, because deepEqual is expensive.
   */
  if (deepEqual(newDocumentState, realMasterState)) {
    return Promise.resolve({
      isEqual: true
    });
  }

  /**
   * The default conflict handler will always
   * drop the fork state and use the master state instead.
   */
  return Promise.resolve({
    isEqual: false,
    documentData: i.realMasterState
  });
};

var HOOKS_WHEN = ['pre', 'post'];
var HOOKS_KEYS = ['insert', 'save', 'remove', 'create'];
var hooksApplied = false;
var RxCollectionBase = /*#__PURE__*/function () {
  /**
   * Stores all 'normal' documents
   */

  function RxCollectionBase(database, name, schema, internalStorageInstance, instanceCreationOptions = {}, migrationStrategies = {}, methods = {}, attachments = {}, options = {}, cacheReplacementPolicy = defaultCacheReplacementPolicy, statics = {}, conflictHandler = defaultConflictHandler) {
    this.storageInstance = {};
    this.timeouts = new Set();
    this.incrementalWriteQueue = {};
    this._incrementalUpsertQueues = new Map();
    this.synced = false;
    this.hooks = {};
    this._subs = [];
    this._docCache = {};
    this._queryCache = createQueryCache();
    this.$ = {};
    this.checkpoint$ = {};
    this._changeEventBuffer = {};
    this.onDestroy = [];
    this.destroyed = false;
    this.onRemove = [];
    this.database = database;
    this.name = name;
    this.schema = schema;
    this.internalStorageInstance = internalStorageInstance;
    this.instanceCreationOptions = instanceCreationOptions;
    this.migrationStrategies = migrationStrategies;
    this.methods = methods;
    this.attachments = attachments;
    this.options = options;
    this.cacheReplacementPolicy = cacheReplacementPolicy;
    this.statics = statics;
    this.conflictHandler = conflictHandler;
    _applyHookFunctions(this.asRxCollection);
  }
  var _proto = RxCollectionBase.prototype;
  _proto.prepare = async function prepare() {
    this.storageInstance = getWrappedStorageInstance(this.database, this.internalStorageInstance, this.schema.jsonSchema);
    this.incrementalWriteQueue = new IncrementalWriteQueue(this.storageInstance, this.schema.primaryPath, (newData, oldData) => beforeDocumentUpdateWrite(this, newData, oldData), result => this._runHooks('post', 'save', result));
    var collectionEventBulks$ = this.database.eventBulks$.pipe(filter(changeEventBulk => changeEventBulk.collectionName === this.name));
    this.$ = collectionEventBulks$.pipe(mergeMap(changeEventBulk => changeEventBulk.events));
    this.checkpoint$ = collectionEventBulks$.pipe(map(changeEventBulk => changeEventBulk.checkpoint));
    this._changeEventBuffer = createChangeEventBuffer(this.asRxCollection);
    var documentConstructor;
    this._docCache = new DocumentCache(this.schema.primaryPath, this.$.pipe(filter(cE => !cE.isLocal)), docData => {
      if (!documentConstructor) {
        documentConstructor = getRxDocumentConstructor(this.asRxCollection);
      }
      return createNewRxDocument(this.asRxCollection, documentConstructor, docData);
    });
    var listenToRemoveSub = this.database.internalStore.changeStream().pipe(filter(bulk => {
      var key = this.name + '-' + this.schema.version;
      var found = bulk.events.find(event => {
        return event.documentData.context === 'collection' && event.documentData.key === key && event.operation === 'DELETE';
      });
      return !!found;
    })).subscribe(async () => {
      await this.destroy();
      await Promise.all(this.onRemove.map(fn => fn()));
    });
    this._subs.push(listenToRemoveSub);

    /**
     * TODO Instead of resolving the EventBulk array here and spit it into
     * single events, we should fully work with event bulks internally
     * to save performance.
     */
    var databaseStorageToken = await this.database.storageToken;
    var subDocs = this.storageInstance.changeStream().subscribe(eventBulk => {
      var events = new Array(eventBulk.events.length);
      var rawEvents = eventBulk.events;
      var collectionName = this.name;
      var deepFreezeWhenDevMode = overwritable.deepFreezeWhenDevMode;
      for (var index = 0; index < rawEvents.length; index++) {
        var event = rawEvents[index];
        events[index] = {
          documentId: event.documentId,
          collectionName,
          isLocal: false,
          operation: event.operation,
          documentData: deepFreezeWhenDevMode(event.documentData),
          previousDocumentData: deepFreezeWhenDevMode(event.previousDocumentData)
        };
      }
      var changeEventBulk = {
        id: eventBulk.id,
        internal: false,
        collectionName: this.name,
        storageToken: databaseStorageToken,
        events,
        databaseToken: this.database.token,
        checkpoint: eventBulk.checkpoint,
        context: eventBulk.context,
        endTime: eventBulk.endTime,
        startTime: eventBulk.startTime
      };
      this.database.$emit(changeEventBulk);
    });
    this._subs.push(subDocs);

    /**
     * Resolve the conflict tasks
     * of the RxStorageInstance
     */
    this._subs.push(this.storageInstance.conflictResultionTasks().subscribe(task => {
      this.conflictHandler(task.input, task.context).then(output => {
        this.storageInstance.resolveConflictResultionTask({
          id: task.id,
          output
        });
      });
    }));
    return PROMISE_RESOLVE_VOID;
  }

  /**
   * Manually call the cleanup function of the storage.
   * @link https://rxdb.info/cleanup.html
   */;
  _proto.cleanup = function cleanup(_minimumDeletedTime) {
    ensureRxCollectionIsNotDestroyed(this);
    throw pluginMissing('cleanup');
  }

  // overwritten by migration-plugin
  ;
  _proto.migrationNeeded = function migrationNeeded() {
    throw pluginMissing('migration-schema');
  };
  _proto.getMigrationState = function getMigrationState() {
    throw pluginMissing('migration-schema');
  };
  _proto.startMigration = function startMigration(batchSize = 10) {
    ensureRxCollectionIsNotDestroyed(this);
    return this.getMigrationState().startMigration(batchSize);
  };
  _proto.migratePromise = function migratePromise(batchSize = 10) {
    return this.getMigrationState().migratePromise(batchSize);
  };
  _proto.insert = async function insert(json) {
    ensureRxCollectionIsNotDestroyed(this);
    var writeResult = await this.bulkInsert([json]);
    var isError = writeResult.error[0];
    throwIfIsStorageWriteError(this, json[this.schema.primaryPath], json, isError);
    var insertResult = ensureNotFalsy(writeResult.success[0]);
    return insertResult;
  };
  _proto.bulkInsert = async function bulkInsert(docsData) {
    ensureRxCollectionIsNotDestroyed(this);
    /**
     * Optimization shortcut,
     * do nothing when called with an empty array
    */
    if (docsData.length === 0) {
      return {
        success: [],
        error: []
      };
    }
    var primaryPath = this.schema.primaryPath;

    /**
     * This code is a bit redundant for better performance.
     * Instead of iterating multiple times,
     * we directly transform the input to a write-row array.
     */
    var insertRows;
    if (this.hasHooks('pre', 'insert')) {
      insertRows = await Promise.all(docsData.map(docData => {
        var useDocData = fillObjectDataBeforeInsert(this.schema, docData);
        return this._runHooks('pre', 'insert', useDocData).then(() => {
          return {
            document: useDocData
          };
        });
      }));
    } else {
      insertRows = [];
      for (var index = 0; index < docsData.length; index++) {
        var docData = docsData[index];
        var useDocData = fillObjectDataBeforeInsert(this.schema, docData);
        insertRows[index] = {
          document: useDocData
        };
      }
    }
    var results = await this.storageInstance.bulkWrite(insertRows, 'rx-collection-bulk-insert');

    // create documents
    var rxDocuments = mapDocumentsDataToCacheDocs(this._docCache, results.success);
    if (this.hasHooks('post', 'insert')) {
      var docsMap = new Map();
      insertRows.forEach(row => {
        var doc = row.document;
        docsMap.set(doc[primaryPath], doc);
      });
      await Promise.all(rxDocuments.map(doc => {
        return this._runHooks('post', 'insert', docsMap.get(doc.primary), doc);
      }));
    }
    return {
      success: rxDocuments,
      error: results.error
    };
  };
  _proto.bulkRemove = async function bulkRemove(ids) {
    ensureRxCollectionIsNotDestroyed(this);
    var primaryPath = this.schema.primaryPath;
    /**
     * Optimization shortcut,
     * do nothing when called with an empty array
     */
    if (ids.length === 0) {
      return {
        success: [],
        error: []
      };
    }
    var rxDocumentMap = await this.findByIds(ids).exec();
    var docsData = [];
    var docsMap = new Map();
    Array.from(rxDocumentMap.values()).forEach(rxDocument => {
      var data = rxDocument.toMutableJSON(true);
      docsData.push(data);
      docsMap.set(rxDocument.primary, data);
    });
    await Promise.all(docsData.map(doc => {
      var primary = doc[this.schema.primaryPath];
      return this._runHooks('pre', 'remove', doc, rxDocumentMap.get(primary));
    }));
    var removeDocs = docsData.map(doc => {
      var writeDoc = flatClone(doc);
      writeDoc._deleted = true;
      return {
        previous: doc,
        document: writeDoc
      };
    });
    var results = await this.storageInstance.bulkWrite(removeDocs, 'rx-collection-bulk-remove');
    var successIds = results.success.map(d => d[primaryPath]);

    // run hooks
    await Promise.all(successIds.map(id => {
      return this._runHooks('post', 'remove', docsMap.get(id), rxDocumentMap.get(id));
    }));
    var rxDocuments = successIds.map(id => getFromMapOrThrow(rxDocumentMap, id));
    return {
      success: rxDocuments,
      error: results.error
    };
  }

  /**
   * same as bulkInsert but overwrites existing document with same primary
   */;
  _proto.bulkUpsert = async function bulkUpsert(docsData) {
    ensureRxCollectionIsNotDestroyed(this);
    var insertData = [];
    var useJsonByDocId = new Map();
    docsData.forEach(docData => {
      var useJson = fillObjectDataBeforeInsert(this.schema, docData);
      var primary = useJson[this.schema.primaryPath];
      if (!primary) {
        throw newRxError('COL3', {
          primaryPath: this.schema.primaryPath,
          data: useJson,
          schema: this.schema.jsonSchema
        });
      }
      useJsonByDocId.set(primary, useJson);
      insertData.push(useJson);
    });
    var insertResult = await this.bulkInsert(insertData);
    var success = insertResult.success.slice(0);
    var error = [];

    // update the ones that existed already
    await Promise.all(insertResult.error.map(async err => {
      if (err.status !== 409) {
        error.push(err);
      } else {
        var id = err.documentId;
        var writeData = getFromMapOrThrow(useJsonByDocId, id);
        var docDataInDb = ensureNotFalsy(err.documentInDb);
        var doc = this._docCache.getCachedRxDocuments([docDataInDb])[0];
        var newDoc = await doc.incrementalModify(() => writeData);
        success.push(newDoc);
      }
    }));
    return {
      error,
      success
    };
  }

  /**
   * same as insert but overwrites existing document with same primary
   */;
  _proto.upsert = async function upsert(json) {
    ensureRxCollectionIsNotDestroyed(this);
    var bulkResult = await this.bulkUpsert([json]);
    throwIfIsStorageWriteError(this.asRxCollection, json[this.schema.primaryPath], json, bulkResult.error[0]);
    return bulkResult.success[0];
  }

  /**
   * upserts to a RxDocument, uses incrementalModify if document already exists
   */;
  _proto.incrementalUpsert = function incrementalUpsert(json) {
    ensureRxCollectionIsNotDestroyed(this);
    var useJson = fillObjectDataBeforeInsert(this.schema, json);
    var primary = useJson[this.schema.primaryPath];
    if (!primary) {
      throw newRxError('COL4', {
        data: json
      });
    }

    // ensure that it won't try 2 parallel runs
    var queue = this._incrementalUpsertQueues.get(primary);
    if (!queue) {
      queue = PROMISE_RESOLVE_VOID;
    }
    queue = queue.then(() => _incrementalUpsertEnsureRxDocumentExists(this, primary, useJson)).then(wasInserted => {
      if (!wasInserted.inserted) {
        return _incrementalUpsertUpdate(wasInserted.doc, useJson);
      } else {
        return wasInserted.doc;
      }
    });
    this._incrementalUpsertQueues.set(primary, queue);
    return queue;
  };
  _proto.find = function find(queryObj) {
    ensureRxCollectionIsNotDestroyed(this);
    if (typeof queryObj === 'string') {
      throw newRxError('COL5', {
        queryObj
      });
    }
    if (!queryObj) {
      queryObj = _getDefaultQuery();
    }
    var query = createRxQuery('find', queryObj, this);
    return query;
  };
  _proto.findOne = function findOne(queryObj) {
    ensureRxCollectionIsNotDestroyed(this);

    // TODO move this check to dev-mode plugin
    if (typeof queryObj === 'number' || Array.isArray(queryObj)) {
      throw newRxTypeError('COL6', {
        queryObj
      });
    }
    var query;
    if (typeof queryObj === 'string') {
      query = createRxQuery('findOne', {
        selector: {
          [this.schema.primaryPath]: queryObj
        },
        limit: 1
      }, this);
    } else {
      if (!queryObj) {
        queryObj = _getDefaultQuery();
      }

      // cannot have limit on findOne queries because it will be overwritten
      if (queryObj.limit) {
        throw newRxError('QU6');
      }
      queryObj = flatClone(queryObj);
      queryObj.limit = 1;
      query = createRxQuery('findOne', queryObj, this);
    }
    return query;
  };
  _proto.count = function count(queryObj) {
    ensureRxCollectionIsNotDestroyed(this);
    if (!queryObj) {
      queryObj = _getDefaultQuery();
    }
    var query = createRxQuery('count', queryObj, this);
    return query;
  }

  /**
   * find a list documents by their primary key
   * has way better performance then running multiple findOne() or a find() with a complex $or-selected
   */;
  _proto.findByIds = function findByIds(ids) {
    ensureRxCollectionIsNotDestroyed(this);
    var mangoQuery = {
      selector: {
        [this.schema.primaryPath]: {
          $in: ids.slice(0)
        }
      }
    };
    var query = createRxQuery('findByIds', mangoQuery, this);
    return query;
  }

  /**
   * Export collection to a JSON friendly format.
   */;
  _proto.exportJSON = function exportJSON() {
    throw pluginMissing('json-dump');
  }

  /**
   * Import the parsed JSON export into the collection.
   * @param _exportedJSON The previously exported data from the `<collection>.exportJSON()` method.
   */;
  _proto.importJSON = function importJSON(_exportedJSON) {
    throw pluginMissing('json-dump');
  };
  _proto.insertCRDT = function insertCRDT(_updateObj) {
    throw pluginMissing('crdt');
  }

  /**
   * HOOKS
   */;
  _proto.addHook = function addHook(when, key, fun, parallel = false) {
    if (typeof fun !== 'function') {
      throw newRxTypeError('COL7', {
        key,
        when
      });
    }
    if (!HOOKS_WHEN.includes(when)) {
      throw newRxTypeError('COL8', {
        key,
        when
      });
    }
    if (!HOOKS_KEYS.includes(key)) {
      throw newRxError('COL9', {
        key
      });
    }
    if (when === 'post' && key === 'create' && parallel === true) {
      throw newRxError('COL10', {
        when,
        key,
        parallel
      });
    }

    // bind this-scope to hook-function
    var boundFun = fun.bind(this);
    var runName = parallel ? 'parallel' : 'series';
    this.hooks[key] = this.hooks[key] || {};
    this.hooks[key][when] = this.hooks[key][when] || {
      series: [],
      parallel: []
    };
    this.hooks[key][when][runName].push(boundFun);
  };
  _proto.getHooks = function getHooks(when, key) {
    if (!this.hooks[key] || !this.hooks[key][when]) {
      return {
        series: [],
        parallel: []
      };
    }
    return this.hooks[key][when];
  };
  _proto.hasHooks = function hasHooks(when, key) {
    /**
     * Performance shortcut
     * so that we not have to build the empty object.
     */
    if (!this.hooks[key] || !this.hooks[key][when]) {
      return false;
    }
    var hooks = this.getHooks(when, key);
    if (!hooks) {
      return false;
    }
    return hooks.series.length > 0 || hooks.parallel.length > 0;
  };
  _proto._runHooks = function _runHooks(when, key, data, instance) {
    var hooks = this.getHooks(when, key);
    if (!hooks) {
      return PROMISE_RESOLVE_VOID;
    }

    // run parallel: false
    var tasks = hooks.series.map(hook => () => hook(data, instance));
    return promiseSeries(tasks)
    // run parallel: true
    .then(() => Promise.all(hooks.parallel.map(hook => hook(data, instance))));
  }

  /**
   * does the same as ._runHooks() but with non-async-functions
   */;
  _proto._runHooksSync = function _runHooksSync(when, key, data, instance) {
    if (!this.hasHooks(when, key)) {
      return;
    }
    var hooks = this.getHooks(when, key);
    if (!hooks) return;
    hooks.series.forEach(hook => hook(data, instance));
  }

  /**
   * Returns a promise that resolves after the given time.
   * Ensures that is properly cleans up when the collection is destroyed
   * so that no running timeouts prevent the exit of the JavaScript process.
   */;
  _proto.promiseWait = function promiseWait(time) {
    var ret = new Promise(res => {
      var timeout = setTimeout(() => {
        this.timeouts.delete(timeout);
        res();
      }, time);
      this.timeouts.add(timeout);
    });
    return ret;
  };
  _proto.destroy = async function destroy() {
    if (this.destroyed) {
      return PROMISE_RESOLVE_FALSE;
    }
    await Promise.all(this.onDestroy.map(fn => fn()));

    /**
     * Settings destroyed = true
     * must be the first thing to do,
     * so for example the replication can directly stop
     * instead of sending requests to a closed storage.
     */
    this.destroyed = true;
    Array.from(this.timeouts).forEach(timeout => clearTimeout(timeout));
    if (this._changeEventBuffer) {
      this._changeEventBuffer.destroy();
    }
    /**
     * First wait until the whole database is idle.
     * This ensures that the storage does not get closed
     * while some operation is running.
     * It is important that we do not intercept a running call
     * because it might lead to undefined behavior like when a doc is written
     * but the change is not added to the changes collection.
     */
    return this.database.requestIdlePromise().then(() => this.storageInstance.close()).then(() => {
      /**
       * Unsubscribing must be done AFTER the storageInstance.close()
       * Because the conflict handling is part of the subscriptions and
       * otherwise there might be open conflicts to be resolved which
       * will then stuck and never resolve.
       */
      this._subs.forEach(sub => sub.unsubscribe());
      delete this.database.collections[this.name];
      return runAsyncPluginHooks('postDestroyRxCollection', this).then(() => true);
    });
  }

  /**
   * remove all data of the collection
   */;
  _proto.remove = async function remove() {
    await this.destroy();
    await Promise.all(this.onRemove.map(fn => fn()));
    await removeCollectionStorages(this.database.storage, this.database.internalStore, this.database.token, this.database.name, this.name, this.database.password, this.database.hashFunction);
  };
  return _createClass(RxCollectionBase, [{
    key: "insert$",
    get: function () {
      return this.$.pipe(filter(cE => cE.operation === 'INSERT'));
    }
  }, {
    key: "update$",
    get: function () {
      return this.$.pipe(filter(cE => cE.operation === 'UPDATE'));
    }
  }, {
    key: "remove$",
    get: function () {
      return this.$.pipe(filter(cE => cE.operation === 'DELETE'));
    }

    // defaults

    /**
     * When the collection is destroyed,
     * these functions will be called an awaited.
     * Used to automatically clean up stuff that
     * belongs to this collection.
    */
  }, {
    key: "asRxCollection",
    get: function () {
      return this;
    }
  }]);
}();

/**
 * adds the hook-functions to the collections prototype
 * this runs only once
 */
function _applyHookFunctions(collection) {
  if (hooksApplied) return; // already run
  hooksApplied = true;
  var colProto = Object.getPrototypeOf(collection);
  HOOKS_KEYS.forEach(key => {
    HOOKS_WHEN.map(when => {
      var fnName = when + ucfirst(key);
      colProto[fnName] = function (fun, parallel) {
        return this.addHook(when, key, fun, parallel);
      };
    });
  });
}
function _incrementalUpsertUpdate(doc, json) {
  return doc.incrementalModify(_innerDoc => {
    return json;
  });
}

/**
 * ensures that the given document exists
 * @return promise that resolves with new doc and flag if inserted
 */
function _incrementalUpsertEnsureRxDocumentExists(rxCollection, primary, json) {
  /**
   * Optimisation shortcut,
   * first try to find the document in the doc-cache
   */
  var docDataFromCache = rxCollection._docCache.getLatestDocumentDataIfExists(primary);
  if (docDataFromCache) {
    return Promise.resolve({
      doc: rxCollection._docCache.getCachedRxDocuments([docDataFromCache])[0],
      inserted: false
    });
  }
  return rxCollection.findOne(primary).exec().then(doc => {
    if (!doc) {
      return rxCollection.insert(json).then(newDoc => ({
        doc: newDoc,
        inserted: true
      }));
    } else {
      return {
        doc,
        inserted: false
      };
    }
  });
}

/**
 * creates and prepares a new collection
 */
function createRxCollection({
  database,
  name,
  schema,
  instanceCreationOptions = {},
  migrationStrategies = {},
  autoMigrate = true,
  statics = {},
  methods = {},
  attachments = {},
  options = {},
  localDocuments = false,
  cacheReplacementPolicy = defaultCacheReplacementPolicy,
  conflictHandler = defaultConflictHandler
}) {
  var storageInstanceCreationParams = {
    databaseInstanceToken: database.token,
    databaseName: database.name,
    collectionName: name,
    schema: schema.jsonSchema,
    options: instanceCreationOptions,
    multiInstance: database.multiInstance,
    password: database.password,
    devMode: overwritable.isDevMode()
  };
  runPluginHooks('preCreateRxStorageInstance', storageInstanceCreationParams);
  return createRxCollectionStorageInstance(database, storageInstanceCreationParams).then(storageInstance => {
    var collection = new RxCollectionBase(database, name, schema, storageInstance, instanceCreationOptions, migrationStrategies, methods, attachments, options, cacheReplacementPolicy, statics, conflictHandler);
    return collection.prepare().then(() => {
      // ORM add statics
      Object.entries(statics).forEach(([funName, fun]) => {
        Object.defineProperty(collection, funName, {
          get: () => fun.bind(collection)
        });
      });
      var ret = PROMISE_RESOLVE_VOID;
      if (autoMigrate && collection.schema.version !== 0) {
        ret = collection.migratePromise();
      }
      return ret;
    }).then(() => {
      runPluginHooks('createRxCollection', {
        collection,
        creator: {
          name,
          schema,
          storageInstance,
          instanceCreationOptions,
          migrationStrategies,
          methods,
          attachments,
          options,
          cacheReplacementPolicy,
          localDocuments,
          statics
        }
      });
      return collection;
    })
    /**
     * If the collection creation fails,
     * we yet have to close the storage instances.
     */.catch(err => {
      return storageInstance.close().then(() => Promise.reject(err));
    });
  });
}

/**
 * Creates a new Idle-Queue
 * @constructor
 * @param {number} [parallels=1] amount of parrallel runs of the limited-ressource
 */
var IdleQueue = function IdleQueue() {
  var parallels = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  this._parallels = parallels || 1;
  /**
   * _queueCounter
   * each lock() increased this number
   * each unlock() decreases this number
   * If _qC==0, the state is in idle
   * @type {Number}
   */

  this._qC = 0;
  /**
   * _idleCalls
   * contains all promises that where added via requestIdlePromise()
   * and not have been resolved
   * @type {Set<Promise>} _iC with oldest promise first
   */

  this._iC = new Set();
  /**
   * _lastHandleNumber
   * @type {Number}
   */

  this._lHN = 0;
  /**
   * _handlePromiseMap
   * Contains the handleNumber on the left
   * And the assigned promise on the right.
   * This is stored so you can use cancelIdleCallback(handleNumber)
   * to stop executing the callback.
   * @type {Map<Number><Promise>}
   */

  this._hPM = new Map();
  this._pHM = new Map(); // _promiseHandleMap
};
IdleQueue.prototype = {
  isIdle: function isIdle() {
    return this._qC < this._parallels;
  },

  /**
   * creates a lock in the queue
   * and returns an unlock-function to remove the lock from the queue
   * @return {function} unlock function than must be called afterwards
   */
  lock: function lock() {
    this._qC++;
  },
  unlock: function unlock() {
    this._qC--;

    _tryIdleCall(this);
  },

  /**
   * wraps a function with lock/unlock and runs it
   * @param  {function}  fun
   * @return {Promise<any>}
   */
  wrapCall: function wrapCall(fun) {
    var _this = this;

    this.lock();
    var maybePromise;

    try {
      maybePromise = fun();
    } catch (err) {
      this.unlock();
      throw err;
    }

    if (!maybePromise.then || typeof maybePromise.then !== 'function') {
      // no promise
      this.unlock();
      return maybePromise;
    } else {
      // promise
      return maybePromise.then(function (ret) {
        // sucessfull -> unlock before return
        _this.unlock();

        return ret;
      })["catch"](function (err) {
        // not sucessfull -> unlock before throwing
        _this.unlock();

        throw err;
      });
    }
  },

  /**
   * does the same as requestIdleCallback() but uses promises instead of the callback
   * @param {{timeout?: number}} options like timeout
   * @return {Promise<void>} promise that resolves when the database is in idle-mode
   */
  requestIdlePromise: function requestIdlePromise(options) {
    var _this2 = this;

    options = options || {};
    var resolve;
    var prom = new Promise(function (res) {
      return resolve = res;
    });

    var resolveFromOutside = function resolveFromOutside() {
      _removeIdlePromise(_this2, prom);

      resolve();
    };

    prom._manRes = resolveFromOutside;

    if (options.timeout) {
      // if timeout has passed, resolve promise even if not idle
      var timeoutObj = setTimeout(function () {
        prom._manRes();
      }, options.timeout);
      prom._timeoutObj = timeoutObj;
    }

    this._iC.add(prom);

    _tryIdleCall(this);

    return prom;
  },

  /**
   * remove the promise so it will never be resolved
   * @param  {Promise} promise from requestIdlePromise()
   * @return {void}
   */
  cancelIdlePromise: function cancelIdlePromise(promise) {
    _removeIdlePromise(this, promise);
  },

  /**
   * api equal to
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
   * @param  {Function} callback
   * @param  {options}   options  [description]
   * @return {number} handle which can be used with cancelIdleCallback()
   */
  requestIdleCallback: function requestIdleCallback(callback, options) {
    var handle = this._lHN++;
    var promise = this.requestIdlePromise(options);

    this._hPM.set(handle, promise);

    this._pHM.set(promise, handle);

    promise.then(function () {
      return callback();
    });
    return handle;
  },

  /**
   * API equal to
   * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelIdleCallback
   * @param  {number} handle returned from requestIdleCallback()
   * @return {void}
   */
  cancelIdleCallback: function cancelIdleCallback(handle) {
    var promise = this._hPM.get(handle);

    this.cancelIdlePromise(promise);
  },

  /**
   * clears and resets everything
   * @return {void}
   */
  clear: function clear() {
    var _this3 = this;

    // remove all non-cleared
    this._iC.forEach(function (promise) {
      return _removeIdlePromise(_this3, promise);
    });

    this._qC = 0;

    this._iC.clear();

    this._hPM = new Map();
    this._pHM = new Map();
  }
};
/**
 * processes the oldest call of the idleCalls-queue
 * @return {Promise<void>}
 */

function _resolveOneIdleCall(idleQueue) {
  if (idleQueue._iC.size === 0) return;

  var iterator = idleQueue._iC.values();

  var oldestPromise = iterator.next().value;

  oldestPromise._manRes(); // try to call the next tick


  setTimeout(function () {
    return _tryIdleCall(idleQueue);
  }, 0);
}
/**
 * removes the promise from the queue and maps and also its corresponding handle-number
 * @param  {Promise} promise from requestIdlePromise()
 * @return {void}
 */


function _removeIdlePromise(idleQueue, promise) {
  if (!promise) return; // remove timeout if exists

  if (promise._timeoutObj) clearTimeout(promise._timeoutObj); // remove handle-nr if exists

  if (idleQueue._pHM.has(promise)) {
    var handle = idleQueue._pHM.get(promise);

    idleQueue._hPM["delete"](handle);

    idleQueue._pHM["delete"](promise);
  } // remove from queue


  idleQueue._iC["delete"](promise);
}
/**
 * resolves the last entry of this._iC
 * but only if the queue is empty
 * @return {Promise}
 */


function _tryIdleCall(idleQueue) {
  // ensure this does not run in parallel
  if (idleQueue._tryIR || idleQueue._iC.size === 0) return;
  idleQueue._tryIR = true; // w8 one tick

  setTimeout(function () {
    // check if queue empty
    if (!idleQueue.isIdle()) {
      idleQueue._tryIR = false;
      return;
    }
    /**
     * wait 1 tick here
     * because many functions do IO->CPU->IO
     * which means the queue is empty for a short time
     * but the ressource is not idle
     */


    setTimeout(function () {
      // check if queue still empty
      if (!idleQueue.isIdle()) {
        idleQueue._tryIR = false;
        return;
      } // ressource is idle


      _resolveOneIdleCall(idleQueue);

      idleQueue._tryIR = false;
    }, 0);
  }, 0);
}

/**
 * this is a set which automatically forgets
 * a given entry when a new entry is set and the ttl
 * of the old one is over
 */
let ObliviousSet$1 = class ObliviousSet {
    ttl;
    map = new Map();
    /**
     * Creating calls to setTimeout() is expensive,
     * so we only do that if there is not timeout already open.
     */
    _to = false;
    constructor(ttl) {
        this.ttl = ttl;
    }
    has(value) {
        return this.map.has(value);
    }
    add(value) {
        this.map.set(value, now$1());
        /**
         * When a new value is added,
         * start the cleanup at the next tick
         * to not block the cpu for more important stuff
         * that might happen.
         */
        if (!this._to) {
            this._to = true;
            setTimeout(() => {
                this._to = false;
                removeTooOldValues$1(this);
            }, 0);
        }
    }
    clear() {
        this.map.clear();
    }
};
/**
 * Removes all entries from the set
 * where the TTL has expired
 */
function removeTooOldValues$1(obliviousSet) {
    const olderThen = now$1() - obliviousSet.ttl;
    const iterator = obliviousSet.map[Symbol.iterator]();
    /**
     * Because we can assume the new values are added at the bottom,
     * we start from the top and stop as soon as we reach a non-too-old value.
     */
    while (true) {
        const next = iterator.next().value;
        if (!next) {
            return; // no more elements
        }
        const value = next[0];
        const time = next[1];
        if (time < olderThen) {
            obliviousSet.map.delete(value);
        }
        else {
            // We reached a value that is not old enough
            return;
        }
    }
}
function now$1() {
    return Date.now();
}

/**
 * stores the used database names+storage names
 * so we can throw when the same database is created more then once.
 */
var USED_DATABASE_NAMES = new Set();
var RxDatabaseBase = /*#__PURE__*/function () {
  /**
   * Contains all known non-closed storage instances
   * that belong to this database.
   * Used in plugins and unit tests.
   */

  function RxDatabaseBase(name,
  /**
   * Uniquely identifies the instance
   * of this RxDatabase.
   */
  token, storage, instanceCreationOptions, password, multiInstance, eventReduce = false, options = {},
  /**
   * Stores information documents about the collections of the database
   */
  internalStore, hashFunction, cleanupPolicy, allowSlowCount, reactivity) {
    this.idleQueue = new IdleQueue();
    this.rxdbVersion = RXDB_VERSION;
    this.storageInstances = new Set();
    this._subs = [];
    this.startupErrors = [];
    this.onDestroy = [];
    this.destroyed = false;
    this.collections = {};
    this.states = {};
    this.eventBulks$ = new Subject();
    this.observable$ = this.eventBulks$.pipe(mergeMap(changeEventBulk => changeEventBulk.events));
    this.storageToken = PROMISE_RESOLVE_FALSE;
    this.storageTokenDocument = PROMISE_RESOLVE_FALSE;
    this.emittedEventBulkIds = new ObliviousSet$1(60 * 1000);
    this.name = name;
    this.token = token;
    this.storage = storage;
    this.instanceCreationOptions = instanceCreationOptions;
    this.password = password;
    this.multiInstance = multiInstance;
    this.eventReduce = eventReduce;
    this.options = options;
    this.internalStore = internalStore;
    this.hashFunction = hashFunction;
    this.cleanupPolicy = cleanupPolicy;
    this.allowSlowCount = allowSlowCount;
    this.reactivity = reactivity;

    /**
     * In the dev-mode, we create a pseudoInstance
     * to get all properties of RxDatabase and ensure they do not
     * conflict with the collection names etc.
     * So only if it is not pseudoInstance,
     * we have all values to prepare a real RxDatabase.
     *
     * TODO this is ugly, we should use a different way in the dev-mode
     * so that all non-dev-mode code can be cleaner.
     */
    if (this.name !== 'pseudoInstance') {
      /**
       * Wrap the internal store
       * to ensure that calls to it also end up in
       * calculation of the idle state and the hooks.
       */
      this.internalStore = getWrappedStorageInstance(this.asRxDatabase, internalStore, INTERNAL_STORE_SCHEMA);

      /**
       * Start writing the storage token.
       * Do not await the creation because it would run
       * in a critical path that increases startup time.
       *
       * Writing the token takes about 20 milliseconds
       * even on a fast adapter, so this is worth it.
       */
      this.storageTokenDocument = ensureStorageTokenDocumentExists(this.asRxDatabase).catch(err => this.startupErrors.push(err));
      this.storageToken = this.storageTokenDocument.then(doc => doc.data.token).catch(err => this.startupErrors.push(err));
    }
  }
  var _proto = RxDatabaseBase.prototype;
  _proto.getReactivityFactory = function getReactivityFactory() {
    if (!this.reactivity) {
      throw newRxError('DB14', {
        database: this.name
      });
    }
    return this.reactivity;
  }

  /**
   * Because having unhandled exceptions would fail,
   * we have to store the async errors of the constructor here
   * so we can throw them later.
   */

  /**
   * When the database is destroyed,
   * these functions will be called an awaited.
   * Used to automatically clean up stuff that
   * belongs to this collection.
   */

  /**
   * Unique token that is stored with the data.
   * Used to detect if the dataset has been deleted
   * and if two RxDatabase instances work on the same dataset or not.
   *
   * Because reading and writing the storageToken runs in the hot path
   * of database creation, we do not await the storageWrites but instead
   * work with the promise when we need the value.
   */

  /**
   * Stores the whole state of the internal storage token document.
   * We need this in some plugins.
   */

  /**
   * Contains the ids of all event bulks that have been emitted
   * by the database.
   * Used to detect duplicates that come in again via BroadcastChannel
   * or other streams.
   * TODO instead of having this here, we should add a test to ensure each RxStorage
   * behaves equal and does never emit duplicate eventBulks.
   */;
  /**
   * This is the main handle-point for all change events
   * ChangeEvents created by this instance go:
   * RxDocument -> RxCollection -> RxDatabase.$emit -> MultiInstance
   * ChangeEvents created by other instances go:
   * MultiInstance -> RxDatabase.$emit -> RxCollection -> RxDatabase
   */
  _proto.$emit = function $emit(changeEventBulk) {
    if (this.emittedEventBulkIds.has(changeEventBulk.id)) {
      return;
    }
    this.emittedEventBulkIds.add(changeEventBulk.id);

    // emit into own stream
    this.eventBulks$.next(changeEventBulk);
  }

  /**
   * removes the collection-doc from the internalStore
   */;
  _proto.removeCollectionDoc = async function removeCollectionDoc(name, schema) {
    var doc = await getSingleDocument(this.internalStore, getPrimaryKeyOfInternalDocument(_collectionNamePrimary(name, schema), INTERNAL_CONTEXT_COLLECTION));
    if (!doc) {
      throw newRxError('SNH', {
        name,
        schema
      });
    }
    var writeDoc = flatCloneDocWithMeta(doc);
    writeDoc._deleted = true;
    await this.internalStore.bulkWrite([{
      document: writeDoc,
      previous: doc
    }], 'rx-database-remove-collection');
  }

  /**
   * creates multiple RxCollections at once
   * to be much faster by saving db txs and doing stuff in bulk-operations
   * This function is not called often, but mostly in the critical path at the initial page load
   * So it must be as fast as possible.
   */;
  _proto.addCollections = async function addCollections(collectionCreators) {
    var jsonSchemas = {};
    var schemas = {};
    var bulkPutDocs = [];
    var useArgsByCollectionName = {};
    await Promise.all(Object.entries(collectionCreators).map(async ([name, args]) => {
      var collectionName = name;
      var rxJsonSchema = args.schema;
      jsonSchemas[collectionName] = rxJsonSchema;
      var schema = createRxSchema(rxJsonSchema, this.hashFunction);
      schemas[collectionName] = schema;

      // collection already exists
      if (this.collections[name]) {
        throw newRxError('DB3', {
          name
        });
      }
      var collectionNameWithVersion = _collectionNamePrimary(name, rxJsonSchema);
      var collectionDocData = {
        id: getPrimaryKeyOfInternalDocument(collectionNameWithVersion, INTERNAL_CONTEXT_COLLECTION),
        key: collectionNameWithVersion,
        context: INTERNAL_CONTEXT_COLLECTION,
        data: {
          name: collectionName,
          schemaHash: await schema.hash,
          schema: schema.jsonSchema,
          version: schema.version,
          connectedStorages: []
        },
        _deleted: false,
        _meta: getDefaultRxDocumentMeta(),
        _rev: getDefaultRevision(),
        _attachments: {}
      };
      bulkPutDocs.push({
        document: collectionDocData
      });
      var useArgs = Object.assign({}, args, {
        name: collectionName,
        schema,
        database: this
      });

      // run hooks
      var hookData = flatClone(args);
      hookData.database = this;
      hookData.name = name;
      runPluginHooks('preCreateRxCollection', hookData);
      useArgs.conflictHandler = hookData.conflictHandler;
      useArgsByCollectionName[collectionName] = useArgs;
    }));
    var putDocsResult = await this.internalStore.bulkWrite(bulkPutDocs, 'rx-database-add-collection');
    await ensureNoStartupErrors(this);
    await Promise.all(putDocsResult.error.map(async error => {
      if (error.status !== 409) {
        throw newRxError('DB12', {
          database: this.name,
          writeError: error
        });
      }
      var docInDb = ensureNotFalsy(error.documentInDb);
      var collectionName = docInDb.data.name;
      var schema = schemas[collectionName];
      // collection already exists but has different schema
      if (docInDb.data.schemaHash !== (await schema.hash)) {
        throw newRxError('DB6', {
          database: this.name,
          collection: collectionName,
          previousSchemaHash: docInDb.data.schemaHash,
          schemaHash: await schema.hash,
          previousSchema: docInDb.data.schema,
          schema: ensureNotFalsy(jsonSchemas[collectionName])
        });
      }
    }));
    var ret = {};
    await Promise.all(Object.keys(collectionCreators).map(async collectionName => {
      var useArgs = useArgsByCollectionName[collectionName];
      var collection = await createRxCollection(useArgs);
      ret[collectionName] = collection;

      // set as getter to the database
      this.collections[collectionName] = collection;
      if (!this[collectionName]) {
        Object.defineProperty(this, collectionName, {
          get: () => this.collections[collectionName]
        });
      }
    }));
    return ret;
  }

  /**
   * runs the given function between idleQueue-locking
   */;
  _proto.lockedRun = function lockedRun(fn) {
    return this.idleQueue.wrapCall(fn);
  };
  _proto.requestIdlePromise = function requestIdlePromise() {
    return this.idleQueue.requestIdlePromise();
  }

  /**
   * Export database to a JSON friendly format.
   */;
  _proto.exportJSON = function exportJSON(_collections) {
    throw pluginMissing('json-dump');
  };
  _proto.addState = function addState(_name) {
    throw pluginMissing('state');
  }

  /**
   * Import the parsed JSON export into the collection.
   * @param _exportedJSON The previously exported data from the `<db>.exportJSON()` method.
   * @note When an interface is loaded in this collection all base properties of the type are typed as `any`
   * since data could be encrypted.
   */;
  _proto.importJSON = function importJSON(_exportedJSON) {
    throw pluginMissing('json-dump');
  };
  _proto.backup = function backup(_options) {
    throw pluginMissing('backup');
  };
  _proto.leaderElector = function leaderElector() {
    throw pluginMissing('leader-election');
  };
  _proto.isLeader = function isLeader() {
    throw pluginMissing('leader-election');
  }
  /**
   * returns a promise which resolves when the instance becomes leader
   */;
  _proto.waitForLeadership = function waitForLeadership() {
    throw pluginMissing('leader-election');
  };
  _proto.migrationStates = function migrationStates() {
    throw pluginMissing('migration-schema');
  }

  /**
   * destroys the database-instance and all collections
   */;
  _proto.destroy = async function destroy() {
    if (this.destroyed) {
      return PROMISE_RESOLVE_FALSE;
    }

    // settings destroyed = true must be the first thing to do.
    this.destroyed = true;
    await runAsyncPluginHooks('preDestroyRxDatabase', this);
    /**
     * Complete the event stream
     * to stop all subscribers who forgot to unsubscribe.
     */
    this.eventBulks$.complete();
    this._subs.map(sub => sub.unsubscribe());

    /**
     * Destroying the pseudo instance will throw
     * because stuff is missing
     * TODO we should not need the pseudo instance on runtime.
     * we should generate the property list on build time.
     */
    if (this.name === 'pseudoInstance') {
      return PROMISE_RESOLVE_FALSE;
    }

    /**
     * First wait until the database is idle
     */
    return this.requestIdlePromise().then(() => Promise.all(this.onDestroy.map(fn => fn())))
    // destroy all collections
    .then(() => Promise.all(Object.keys(this.collections).map(key => this.collections[key]).map(col => col.destroy())))
    // destroy internal storage instances
    .then(() => this.internalStore.close())
    // remove combination from USED_COMBINATIONS-map
    .then(() => USED_DATABASE_NAMES.delete(this.storage.name + '|' + this.name)).then(() => true);
  }

  /**
   * deletes the database and its stored data.
   * Returns the names of all removed collections.
   */;
  _proto.remove = function remove() {
    return this.destroy().then(() => removeRxDatabase(this.name, this.storage, this.password));
  };
  return _createClass(RxDatabaseBase, [{
    key: "$",
    get: function () {
      return this.observable$;
    }
  }, {
    key: "asRxDatabase",
    get: function () {
      return this;
    }
  }]);
}();

/**
 * checks if an instance with same name and storage already exists
 * @throws {RxError} if used
 */
function throwIfDatabaseNameUsed(name, storage) {
  var key = storage.name + '|' + name;
  if (!USED_DATABASE_NAMES.has(key)) {
    return;
  } else {
    throw newRxError('DB8', {
      name,
      storage: storage.name,
      link: 'https://rxdb.info/rx-database.html#ignoreduplicate'
    });
  }
}

/**
 * Creates the storage instances that are used internally in the database
 * to store schemas and other configuration stuff.
 */
async function createRxDatabaseStorageInstance(databaseInstanceToken, storage, databaseName, options, multiInstance, password) {
  var internalStore = await storage.createStorageInstance({
    databaseInstanceToken,
    databaseName,
    collectionName: INTERNAL_STORAGE_NAME,
    schema: INTERNAL_STORE_SCHEMA,
    options,
    multiInstance,
    password,
    devMode: overwritable.isDevMode()
  });
  return internalStore;
}
function createRxDatabase({
  storage,
  instanceCreationOptions,
  name,
  password,
  multiInstance = true,
  eventReduce = true,
  ignoreDuplicate = false,
  options = {},
  cleanupPolicy,
  allowSlowCount = false,
  localDocuments = false,
  hashFunction = defaultHashSha256,
  reactivity
}) {
  runPluginHooks('preCreateRxDatabase', {
    storage,
    instanceCreationOptions,
    name,
    password,
    multiInstance,
    eventReduce,
    ignoreDuplicate,
    options,
    localDocuments
  });
  // check if combination already used
  if (!ignoreDuplicate) {
    throwIfDatabaseNameUsed(name, storage);
  }
  USED_DATABASE_NAMES.add(storage.name + '|' + name);
  var databaseInstanceToken = randomCouchString(10);
  return createRxDatabaseStorageInstance(databaseInstanceToken, storage, name, instanceCreationOptions, multiInstance, password)
  /**
   * Creating the internal store might fail
   * if some RxStorage wrapper is used that does some checks
   * and then throw.
   * In that case we have to properly clean up the database.
   */.catch(err => {
    USED_DATABASE_NAMES.delete(storage.name + '|' + name);
    throw err;
  }).then(storageInstance => {
    var rxDatabase = new RxDatabaseBase(name, databaseInstanceToken, storage, instanceCreationOptions, password, multiInstance, eventReduce, options, storageInstance, hashFunction, cleanupPolicy, allowSlowCount, reactivity);
    return runAsyncPluginHooks('createRxDatabase', {
      database: rxDatabase,
      creator: {
        storage,
        instanceCreationOptions,
        name,
        password,
        multiInstance,
        eventReduce,
        ignoreDuplicate,
        options,
        localDocuments
      }
    }).then(() => rxDatabase);
  });
}

/**
 * Removes the database and all its known data
 * with all known collections and all internal meta data.
 *
 * Returns the names of the removed collections.
 */
async function removeRxDatabase(databaseName, storage, password) {
  var databaseInstanceToken = randomCouchString(10);
  var dbInternalsStorageInstance = await createRxDatabaseStorageInstance(databaseInstanceToken, storage, databaseName, {}, false, password);
  var collectionDocs = await getAllCollectionDocuments(dbInternalsStorageInstance);
  var collectionNames = new Set();
  collectionDocs.forEach(doc => collectionNames.add(doc.data.name));
  var removedCollectionNames = Array.from(collectionNames);
  await Promise.all(removedCollectionNames.map(collectionName => removeCollectionStorages(storage, dbInternalsStorageInstance, databaseInstanceToken, databaseName, collectionName, password)));
  await runAsyncPluginHooks('postRemoveRxDatabase', {
    databaseName,
    storage
  });
  await dbInternalsStorageInstance.remove();
  return removedCollectionNames;
}

/**
 * For better performance some tasks run async
 * and are awaited later.
 * But we still have to ensure that there have been no errors
 * on database creation.
 */
async function ensureNoStartupErrors(rxDatabase) {
  await rxDatabase.storageToken;
  if (rxDatabase.startupErrors[0]) {
    throw rxDatabase.startupErrors[0];
  }
}
//# sourceMappingURL=rx-database.js.map

/**
 * this handles how plugins are added to rxdb
 * basically it changes the internal prototypes
 * by passing them to the plugins-functions
 */

/**
 * prototypes that can be manipulated with a plugin
 */
var PROTOTYPES = {
  RxSchema: RxSchema.prototype,
  RxDocument: basePrototype,
  RxQuery: RxQueryBase.prototype,
  RxCollection: RxCollectionBase.prototype,
  RxDatabase: RxDatabaseBase.prototype
};
var ADDED_PLUGINS = new Set();
var ADDED_PLUGIN_NAMES = new Set();

/**
 * Add a plugin to the RxDB library.
 * Plugins are added globally and cannot be removed.
 */
function addRxPlugin(plugin) {
  runPluginHooks('preAddRxPlugin', {
    plugin,
    plugins: ADDED_PLUGINS
  });

  // do nothing if added before
  if (ADDED_PLUGINS.has(plugin)) {
    return;
  } else {
    // ensure no other plugin with the same name was already added
    if (ADDED_PLUGIN_NAMES.has(plugin.name)) {
      throw newRxError('PL3', {
        name: plugin.name,
        plugin
      });
    }
    ADDED_PLUGINS.add(plugin);
    ADDED_PLUGIN_NAMES.add(plugin.name);
  }

  /**
   * To identify broken configurations,
   * we only allow RxDB plugins to be passed into addRxPlugin().
   */
  if (!plugin.rxdb) {
    throw newRxTypeError('PL1', {
      plugin
    });
  }
  if (plugin.init) {
    plugin.init();
  }

  // prototype-overwrites
  if (plugin.prototypes) {
    Object.entries(plugin.prototypes).forEach(([name, fun]) => {
      return fun(PROTOTYPES[name]);
    });
  }
  // overwritable-overwrites
  if (plugin.overwritable) {
    Object.assign(overwritable, plugin.overwritable);
  }
  // extend-hooks
  if (plugin.hooks) {
    Object.entries(plugin.hooks).forEach(([name, hooksObj]) => {
      if (hooksObj.after) {
        HOOKS[name].push(hooksObj.after);
      }
      if (hooksObj.before) {
        HOOKS[name].unshift(hooksObj.before);
      }
    });
  }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var lib = {};

var broadcastChannel = {};

var util = {};

Object.defineProperty(util, "__esModule", {
  value: true
});
util.PROMISE_RESOLVED_VOID = util.PROMISE_RESOLVED_TRUE = util.PROMISE_RESOLVED_FALSE = void 0;
util.isPromise = isPromise;
util.microSeconds = microSeconds$4;
util.randomInt = randomInt;
util.randomToken = randomToken;
util.sleep = sleep;
util.supportsWebLockAPI = supportsWebLockAPI;
/**
 * returns true if the given object is a promise
 */
function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}
util.PROMISE_RESOLVED_FALSE = Promise.resolve(false);
util.PROMISE_RESOLVED_TRUE = Promise.resolve(true);
util.PROMISE_RESOLVED_VOID = Promise.resolve();
function sleep(time, resolveWith) {
  if (!time) time = 0;
  return new Promise(function (res) {
    return setTimeout(function () {
      return res(resolveWith);
    }, time);
  });
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * https://stackoverflow.com/a/8084248
 */
function randomToken() {
  return Math.random().toString(36).substring(2);
}
var lastMs = 0;

/**
 * Returns the current unix time in micro-seconds,
 * WARNING: This is a pseudo-function
 * Performance.now is not reliable in webworkers, so we just make sure to never return the same time.
 * This is enough in browsers, and this function will not be used in nodejs.
 * The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is used in fast-running unit tests.
 */
function microSeconds$4() {
  var ret = Date.now() * 1000; // milliseconds to microseconds
  if (ret <= lastMs) {
    ret = lastMs + 1;
  }
  lastMs = ret;
  return ret;
}

/**
 * Check if WebLock API is supported.
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
 */
function supportsWebLockAPI() {
  if (typeof navigator !== 'undefined' && typeof navigator.locks !== 'undefined' && typeof navigator.locks.request === 'function') {
    return true;
  } else {
    return false;
  }
}

var methodChooser = {};

var _typeof = {exports: {}};

(function (module) {
	function _typeof(o) {
	  "@babel/helpers - typeof";

	  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
	}
	module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports; 
} (_typeof));

var native = {};

Object.defineProperty(native, "__esModule", {
  value: true
});
native.NativeMethod = void 0;
native.averageResponseTime = averageResponseTime$3;
native.canBeUsed = canBeUsed$3;
native.close = close$3;
native.create = create$3;
native.microSeconds = void 0;
native.onMessage = onMessage$3;
native.postMessage = postMessage$3;
native.type = void 0;
var _util$6 = util;
var microSeconds$3 = native.microSeconds = _util$6.microSeconds;
var type$3 = native.type = 'native';
function create$3(channelName) {
  var state = {
    time: (0, _util$6.microSeconds)(),
    messagesCallback: null,
    bc: new BroadcastChannel(channelName),
    subFns: [] // subscriberFunctions
  };

  state.bc.onmessage = function (msgEvent) {
    if (state.messagesCallback) {
      state.messagesCallback(msgEvent.data);
    }
  };
  return state;
}
function close$3(channelState) {
  channelState.bc.close();
  channelState.subFns = [];
}
function postMessage$3(channelState, messageJson) {
  try {
    channelState.bc.postMessage(messageJson, false);
    return _util$6.PROMISE_RESOLVED_VOID;
  } catch (err) {
    return Promise.reject(err);
  }
}
function onMessage$3(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed$3() {
  // Deno runtime
  // eslint-disable-next-line
  if (typeof globalThis !== 'undefined' && globalThis.Deno && globalThis.Deno.args) {
    return true;
  }

  // Browser runtime
  if ((typeof window !== 'undefined' || typeof self !== 'undefined') && typeof BroadcastChannel === 'function') {
    if (BroadcastChannel._pubkey) {
      throw new Error('BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill');
    }
    return true;
  } else {
    return false;
  }
}
function averageResponseTime$3() {
  return 150;
}
native.NativeMethod = {
  create: create$3,
  close: close$3,
  onMessage: onMessage$3,
  postMessage: postMessage$3,
  canBeUsed: canBeUsed$3,
  type: type$3,
  averageResponseTime: averageResponseTime$3,
  microSeconds: microSeconds$3
};

var indexedDb = {};

var index_es5$2 = {exports: {}};

var src = {};

Object.defineProperty(src, "__esModule", { value: true });
src.now = src.removeTooOldValues = src.ObliviousSet = void 0;
/**
 * this is a set which automatically forgets
 * a given entry when a new entry is set and the ttl
 * of the old one is over
 */
class ObliviousSet {
    ttl;
    map = new Map();
    /**
     * Creating calls to setTimeout() is expensive,
     * so we only do that if there is not timeout already open.
     */
    _to = false;
    constructor(ttl) {
        this.ttl = ttl;
    }
    has(value) {
        return this.map.has(value);
    }
    add(value) {
        this.map.set(value, now());
        /**
         * When a new value is added,
         * start the cleanup at the next tick
         * to not block the cpu for more important stuff
         * that might happen.
         */
        if (!this._to) {
            this._to = true;
            setTimeout(() => {
                this._to = false;
                removeTooOldValues(this);
            }, 0);
        }
    }
    clear() {
        this.map.clear();
    }
}
src.ObliviousSet = ObliviousSet;
/**
 * Removes all entries from the set
 * where the TTL has expired
 */
function removeTooOldValues(obliviousSet) {
    const olderThen = now() - obliviousSet.ttl;
    const iterator = obliviousSet.map[Symbol.iterator]();
    /**
     * Because we can assume the new values are added at the bottom,
     * we start from the top and stop as soon as we reach a non-too-old value.
     */
    while (true) {
        const next = iterator.next().value;
        if (!next) {
            return; // no more elements
        }
        const value = next[0];
        const time = next[1];
        if (time < olderThen) {
            obliviousSet.map.delete(value);
        }
        else {
            // We reached a value that is not old enough
            return;
        }
    }
}
src.removeTooOldValues = removeTooOldValues;
function now() {
    return Date.now();
}
src.now = now;

var index_es5$1 = index_es5$2.exports;
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(index_es5$1, "__esModule", { value: true });
const pkg = __importStar(src);
index_es5$2.exports = pkg;


var index_es5Exports = index_es5$2.exports;

var options = {};

Object.defineProperty(options, "__esModule", {
  value: true
});
options.fillOptionsWithDefaults = fillOptionsWithDefaults$1;
function fillOptionsWithDefaults$1() {
  var originalOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = JSON.parse(JSON.stringify(originalOptions));

  // main
  if (typeof options.webWorkerSupport === 'undefined') options.webWorkerSupport = true;

  // indexed-db
  if (!options.idb) options.idb = {};
  //  after this time the messages get deleted
  if (!options.idb.ttl) options.idb.ttl = 1000 * 45;
  if (!options.idb.fallbackInterval) options.idb.fallbackInterval = 150;
  //  handles abrupt db onclose events.
  if (originalOptions.idb && typeof originalOptions.idb.onclose === 'function') options.idb.onclose = originalOptions.idb.onclose;

  // localstorage
  if (!options.localstorage) options.localstorage = {};
  if (!options.localstorage.removeTimeout) options.localstorage.removeTimeout = 1000 * 60;

  // custom methods
  if (originalOptions.methods) options.methods = originalOptions.methods;

  // node
  if (!options.node) options.node = {};
  if (!options.node.ttl) options.node.ttl = 1000 * 60 * 2; // 2 minutes;
  /**
   * On linux use 'ulimit -Hn' to get the limit of open files.
   * On ubuntu this was 4096 for me, so we use half of that as maxParallelWrites default.
   */
  if (!options.node.maxParallelWrites) options.node.maxParallelWrites = 2048;
  if (typeof options.node.useFastPath === 'undefined') options.node.useFastPath = true;
  return options;
}

Object.defineProperty(indexedDb, "__esModule", {
  value: true
});
indexedDb.TRANSACTION_SETTINGS = indexedDb.IndexedDBMethod = void 0;
indexedDb.averageResponseTime = averageResponseTime$2;
indexedDb.canBeUsed = canBeUsed$2;
indexedDb.cleanOldMessages = cleanOldMessages;
indexedDb.close = close$2;
indexedDb.commitIndexedDBTransaction = commitIndexedDBTransaction;
indexedDb.create = create$2;
indexedDb.createDatabase = createDatabase;
indexedDb.getAllMessages = getAllMessages;
indexedDb.getIdb = getIdb;
indexedDb.getMessagesHigherThan = getMessagesHigherThan;
indexedDb.getOldMessages = getOldMessages;
indexedDb.microSeconds = void 0;
indexedDb.onMessage = onMessage$2;
indexedDb.postMessage = postMessage$2;
indexedDb.removeMessagesById = removeMessagesById;
indexedDb.type = void 0;
indexedDb.writeMessage = writeMessage;
var _util$5 = util;
var _obliviousSet$1 = index_es5Exports;
var _options$2 = options;
/**
 * this method uses indexeddb to store the messages
 * There is currently no observerAPI for idb
 * @link https://github.com/w3c/IndexedDB/issues/51
 * 
 * When working on this, ensure to use these performance optimizations:
 * @link https://rxdb.info/slow-indexeddb.html
 */

var microSeconds$2 = indexedDb.microSeconds = _util$5.microSeconds;
var DB_PREFIX = 'pubkey.broadcast-channel-0-';
var OBJECT_STORE_ID = 'messages';

/**
 * Use relaxed durability for faster performance on all transactions.
 * @link https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/
 */
var TRANSACTION_SETTINGS = indexedDb.TRANSACTION_SETTINGS = {
  durability: 'relaxed'
};
var type$2 = indexedDb.type = 'idb';
function getIdb() {
  if (typeof indexedDB !== 'undefined') return indexedDB;
  if (typeof window !== 'undefined') {
    if (typeof window.mozIndexedDB !== 'undefined') return window.mozIndexedDB;
    if (typeof window.webkitIndexedDB !== 'undefined') return window.webkitIndexedDB;
    if (typeof window.msIndexedDB !== 'undefined') return window.msIndexedDB;
  }
  return false;
}

/**
 * If possible, we should explicitly commit IndexedDB transactions
 * for better performance.
 * @link https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/
 */
function commitIndexedDBTransaction(tx) {
  if (tx.commit) {
    tx.commit();
  }
}
function createDatabase(channelName) {
  var IndexedDB = getIdb();

  // create table
  var dbName = DB_PREFIX + channelName;

  /**
   * All IndexedDB databases are opened without version
   * because it is a bit faster, especially on firefox
   * @link http://nparashuram.com/IndexedDB/perf/#Open%20Database%20with%20version
   */
  var openRequest = IndexedDB.open(dbName);
  openRequest.onupgradeneeded = function (ev) {
    var db = ev.target.result;
    db.createObjectStore(OBJECT_STORE_ID, {
      keyPath: 'id',
      autoIncrement: true
    });
  };
  return new Promise(function (res, rej) {
    openRequest.onerror = function (ev) {
      return rej(ev);
    };
    openRequest.onsuccess = function () {
      res(openRequest.result);
    };
  });
}

/**
 * writes the new message to the database
 * so other readers can find it
 */
function writeMessage(db, readerUuid, messageJson) {
  var time = Date.now();
  var writeObject = {
    uuid: readerUuid,
    time: time,
    data: messageJson
  };
  var tx = db.transaction([OBJECT_STORE_ID], 'readwrite', TRANSACTION_SETTINGS);
  return new Promise(function (res, rej) {
    tx.oncomplete = function () {
      return res();
    };
    tx.onerror = function (ev) {
      return rej(ev);
    };
    var objectStore = tx.objectStore(OBJECT_STORE_ID);
    objectStore.add(writeObject);
    commitIndexedDBTransaction(tx);
  });
}
function getAllMessages(db) {
  var tx = db.transaction(OBJECT_STORE_ID, 'readonly', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function (res) {
    objectStore.openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;
      if (cursor) {
        ret.push(cursor.value);
        //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
        cursor["continue"]();
      } else {
        commitIndexedDBTransaction(tx);
        res(ret);
      }
    };
  });
}
function getMessagesHigherThan(db, lastCursorId) {
  var tx = db.transaction(OBJECT_STORE_ID, 'readonly', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  var keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);

  /**
   * Optimization shortcut,
   * if getAll() can be used, do not use a cursor.
   * @link https://rxdb.info/slow-indexeddb.html
   */
  if (objectStore.getAll) {
    var getAllRequest = objectStore.getAll(keyRangeValue);
    return new Promise(function (res, rej) {
      getAllRequest.onerror = function (err) {
        return rej(err);
      };
      getAllRequest.onsuccess = function (e) {
        res(e.target.result);
      };
    });
  }
  function openCursor() {
    // Occasionally Safari will fail on IDBKeyRange.bound, this
    // catches that error, having it open the cursor to the first
    // item. When it gets data it will advance to the desired key.
    try {
      keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity);
      return objectStore.openCursor(keyRangeValue);
    } catch (e) {
      return objectStore.openCursor();
    }
  }
  return new Promise(function (res, rej) {
    var openCursorRequest = openCursor();
    openCursorRequest.onerror = function (err) {
      return rej(err);
    };
    openCursorRequest.onsuccess = function (ev) {
      var cursor = ev.target.result;
      if (cursor) {
        if (cursor.value.id < lastCursorId + 1) {
          cursor["continue"](lastCursorId + 1);
        } else {
          ret.push(cursor.value);
          cursor["continue"]();
        }
      } else {
        commitIndexedDBTransaction(tx);
        res(ret);
      }
    };
  });
}
function removeMessagesById(channelState, ids) {
  if (channelState.closed) {
    return Promise.resolve([]);
  }
  var tx = channelState.db.transaction(OBJECT_STORE_ID, 'readwrite', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  return Promise.all(ids.map(function (id) {
    var deleteRequest = objectStore["delete"](id);
    return new Promise(function (res) {
      deleteRequest.onsuccess = function () {
        return res();
      };
    });
  }));
}
function getOldMessages(db, ttl) {
  var olderThen = Date.now() - ttl;
  var tx = db.transaction(OBJECT_STORE_ID, 'readonly', TRANSACTION_SETTINGS);
  var objectStore = tx.objectStore(OBJECT_STORE_ID);
  var ret = [];
  return new Promise(function (res) {
    objectStore.openCursor().onsuccess = function (ev) {
      var cursor = ev.target.result;
      if (cursor) {
        var msgObk = cursor.value;
        if (msgObk.time < olderThen) {
          ret.push(msgObk);
          //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
          cursor["continue"]();
        } else {
          // no more old messages,
          commitIndexedDBTransaction(tx);
          res(ret);
        }
      } else {
        res(ret);
      }
    };
  });
}
function cleanOldMessages(channelState) {
  return getOldMessages(channelState.db, channelState.options.idb.ttl).then(function (tooOld) {
    return removeMessagesById(channelState, tooOld.map(function (msg) {
      return msg.id;
    }));
  });
}
function create$2(channelName, options) {
  options = (0, _options$2.fillOptionsWithDefaults)(options);
  return createDatabase(channelName).then(function (db) {
    var state = {
      closed: false,
      lastCursorId: 0,
      channelName: channelName,
      options: options,
      uuid: (0, _util$5.randomToken)(),
      /**
       * emittedMessagesIds
       * contains all messages that have been emitted before
       * @type {ObliviousSet}
       */
      eMIs: new _obliviousSet$1.ObliviousSet(options.idb.ttl * 2),
      // ensures we do not read messages in parallel
      writeBlockPromise: _util$5.PROMISE_RESOLVED_VOID,
      messagesCallback: null,
      readQueuePromises: [],
      db: db
    };

    /**
     * Handle abrupt closes that do not originate from db.close().
     * This could happen, for example, if the underlying storage is
     * removed or if the user clears the database in the browser's
     * history preferences.
     */
    db.onclose = function () {
      state.closed = true;
      if (options.idb.onclose) options.idb.onclose();
    };

    /**
     * if service-workers are used,
     * we have no 'storage'-event if they post a message,
     * therefore we also have to set an interval
     */
    _readLoop(state);
    return state;
  });
}
function _readLoop(state) {
  if (state.closed) return;
  readNewMessages(state).then(function () {
    return (0, _util$5.sleep)(state.options.idb.fallbackInterval);
  }).then(function () {
    return _readLoop(state);
  });
}
function _filterMessage(msgObj, state) {
  if (msgObj.uuid === state.uuid) return false; // send by own
  if (state.eMIs.has(msgObj.id)) return false; // already emitted
  if (msgObj.data.time < state.messagesCallbackTime) return false; // older then onMessageCallback
  return true;
}

/**
 * reads all new messages from the database and emits them
 */
function readNewMessages(state) {
  // channel already closed
  if (state.closed) return _util$5.PROMISE_RESOLVED_VOID;

  // if no one is listening, we do not need to scan for new messages
  if (!state.messagesCallback) return _util$5.PROMISE_RESOLVED_VOID;
  return getMessagesHigherThan(state.db, state.lastCursorId).then(function (newerMessages) {
    var useMessages = newerMessages
    /**
     * there is a bug in iOS where the msgObj can be undefined sometimes
     * so we filter them out
     * @link https://github.com/pubkey/broadcast-channel/issues/19
     */.filter(function (msgObj) {
      return !!msgObj;
    }).map(function (msgObj) {
      if (msgObj.id > state.lastCursorId) {
        state.lastCursorId = msgObj.id;
      }
      return msgObj;
    }).filter(function (msgObj) {
      return _filterMessage(msgObj, state);
    }).sort(function (msgObjA, msgObjB) {
      return msgObjA.time - msgObjB.time;
    }); // sort by time
    useMessages.forEach(function (msgObj) {
      if (state.messagesCallback) {
        state.eMIs.add(msgObj.id);
        state.messagesCallback(msgObj.data);
      }
    });
    return _util$5.PROMISE_RESOLVED_VOID;
  });
}
function close$2(channelState) {
  channelState.closed = true;
  channelState.db.close();
}
function postMessage$2(channelState, messageJson) {
  channelState.writeBlockPromise = channelState.writeBlockPromise.then(function () {
    return writeMessage(channelState.db, channelState.uuid, messageJson);
  }).then(function () {
    if ((0, _util$5.randomInt)(0, 10) === 0) {
      /* await (do not await) */
      cleanOldMessages(channelState);
    }
  });
  return channelState.writeBlockPromise;
}
function onMessage$2(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
  readNewMessages(channelState);
}
function canBeUsed$2() {
  return !!getIdb();
}
function averageResponseTime$2(options) {
  return options.idb.fallbackInterval * 2;
}
indexedDb.IndexedDBMethod = {
  create: create$2,
  close: close$2,
  onMessage: onMessage$2,
  postMessage: postMessage$2,
  canBeUsed: canBeUsed$2,
  type: type$2,
  averageResponseTime: averageResponseTime$2,
  microSeconds: microSeconds$2
};

var localstorage = {};

Object.defineProperty(localstorage, "__esModule", {
  value: true
});
localstorage.LocalstorageMethod = void 0;
localstorage.addStorageEventListener = addStorageEventListener;
localstorage.averageResponseTime = averageResponseTime$1;
localstorage.canBeUsed = canBeUsed$1;
localstorage.close = close$1;
localstorage.create = create$1;
localstorage.getLocalStorage = getLocalStorage;
localstorage.microSeconds = void 0;
localstorage.onMessage = onMessage$1;
localstorage.postMessage = postMessage$1;
localstorage.removeStorageEventListener = removeStorageEventListener;
localstorage.storageKey = storageKey;
localstorage.type = void 0;
var _obliviousSet = index_es5Exports;
var _options$1 = options;
var _util$4 = util;
/**
 * A localStorage-only method which uses localstorage and its 'storage'-event
 * This does not work inside webworkers because they have no access to localstorage
 * This is basically implemented to support IE9 or your grandmother's toaster.
 * @link https://caniuse.com/#feat=namevalue-storage
 * @link https://caniuse.com/#feat=indexeddb
 */

var microSeconds$1 = localstorage.microSeconds = _util$4.microSeconds;
var KEY_PREFIX = 'pubkey.broadcastChannel-';
var type$1 = localstorage.type = 'localstorage';

/**
 * copied from crosstab
 * @link https://github.com/tejacques/crosstab/blob/master/src/crosstab.js#L32
 */
function getLocalStorage() {
  var localStorage;
  if (typeof window === 'undefined') return null;
  try {
    localStorage = window.localStorage;
    localStorage = window['ie8-eventlistener/storage'] || window.localStorage;
  } catch (e) {
    // New versions of Firefox throw a Security exception
    // if cookies are disabled. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1028153
  }
  return localStorage;
}
function storageKey(channelName) {
  return KEY_PREFIX + channelName;
}

/**
* writes the new message to the storage
* and fires the storage-event so other readers can find it
*/
function postMessage$1(channelState, messageJson) {
  return new Promise(function (res) {
    (0, _util$4.sleep)().then(function () {
      var key = storageKey(channelState.channelName);
      var writeObj = {
        token: (0, _util$4.randomToken)(),
        time: Date.now(),
        data: messageJson,
        uuid: channelState.uuid
      };
      var value = JSON.stringify(writeObj);
      getLocalStorage().setItem(key, value);

      /**
       * StorageEvent does not fire the 'storage' event
       * in the window that changes the state of the local storage.
       * So we fire it manually
       */
      var ev = document.createEvent('Event');
      ev.initEvent('storage', true, true);
      ev.key = key;
      ev.newValue = value;
      window.dispatchEvent(ev);
      res();
    });
  });
}
function addStorageEventListener(channelName, fn) {
  var key = storageKey(channelName);
  var listener = function listener(ev) {
    if (ev.key === key) {
      fn(JSON.parse(ev.newValue));
    }
  };
  window.addEventListener('storage', listener);
  return listener;
}
function removeStorageEventListener(listener) {
  window.removeEventListener('storage', listener);
}
function create$1(channelName, options) {
  options = (0, _options$1.fillOptionsWithDefaults)(options);
  if (!canBeUsed$1()) {
    throw new Error('BroadcastChannel: localstorage cannot be used');
  }
  var uuid = (0, _util$4.randomToken)();

  /**
   * eMIs
   * contains all messages that have been emitted before
   * @type {ObliviousSet}
   */
  var eMIs = new _obliviousSet.ObliviousSet(options.localstorage.removeTimeout);
  var state = {
    channelName: channelName,
    uuid: uuid,
    eMIs: eMIs // emittedMessagesIds
  };

  state.listener = addStorageEventListener(channelName, function (msgObj) {
    if (!state.messagesCallback) return; // no listener
    if (msgObj.uuid === uuid) return; // own message
    if (!msgObj.token || eMIs.has(msgObj.token)) return; // already emitted
    if (msgObj.data.time && msgObj.data.time < state.messagesCallbackTime) return; // too old

    eMIs.add(msgObj.token);
    state.messagesCallback(msgObj.data);
  });
  return state;
}
function close$1(channelState) {
  removeStorageEventListener(channelState.listener);
}
function onMessage$1(channelState, fn, time) {
  channelState.messagesCallbackTime = time;
  channelState.messagesCallback = fn;
}
function canBeUsed$1() {
  var ls = getLocalStorage();
  if (!ls) return false;
  try {
    var key = '__broadcastchannel_check';
    ls.setItem(key, 'works');
    ls.removeItem(key);
  } catch (e) {
    // Safari 10 in private mode will not allow write access to local
    // storage and fail with a QuotaExceededError. See
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#Private_Browsing_Incognito_modes
    return false;
  }
  return true;
}
function averageResponseTime$1() {
  var defaultTime = 120;
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    // safari is much slower so this time is higher
    return defaultTime * 2;
  }
  return defaultTime;
}
localstorage.LocalstorageMethod = {
  create: create$1,
  close: close$1,
  onMessage: onMessage$1,
  postMessage: postMessage$1,
  canBeUsed: canBeUsed$1,
  type: type$1,
  averageResponseTime: averageResponseTime$1,
  microSeconds: microSeconds$1
};

var simulate = {};

Object.defineProperty(simulate, "__esModule", {
  value: true
});
simulate.SimulateMethod = simulate.SIMULATE_DELAY_TIME = void 0;
simulate.averageResponseTime = averageResponseTime;
simulate.canBeUsed = canBeUsed;
simulate.close = close;
simulate.create = create;
simulate.microSeconds = void 0;
simulate.onMessage = onMessage;
simulate.postMessage = postMessage;
simulate.type = void 0;
var _util$3 = util;
var microSeconds = simulate.microSeconds = _util$3.microSeconds;
var type = simulate.type = 'simulate';
var SIMULATE_CHANNELS = new Set();
function create(channelName) {
  var state = {
    time: microSeconds(),
    name: channelName,
    messagesCallback: null
  };
  SIMULATE_CHANNELS.add(state);
  return state;
}
function close(channelState) {
  SIMULATE_CHANNELS["delete"](channelState);
}
var SIMULATE_DELAY_TIME = simulate.SIMULATE_DELAY_TIME = 5;
function postMessage(channelState, messageJson) {
  return new Promise(function (res) {
    return setTimeout(function () {
      var channelArray = Array.from(SIMULATE_CHANNELS);
      channelArray.forEach(function (channel) {
        if (channel.name === channelState.name &&
        // has same name
        channel !== channelState &&
        // not own channel
        !!channel.messagesCallback &&
        // has subscribers
        channel.time < messageJson.time // channel not created after postMessage() call
        ) {
          channel.messagesCallback(messageJson);
        }
      });
      res();
    }, SIMULATE_DELAY_TIME);
  });
}
function onMessage(channelState, fn) {
  channelState.messagesCallback = fn;
}
function canBeUsed() {
  return true;
}
function averageResponseTime() {
  return SIMULATE_DELAY_TIME;
}
simulate.SimulateMethod = {
  create: create,
  close: close,
  onMessage: onMessage,
  postMessage: postMessage,
  canBeUsed: canBeUsed,
  type: type,
  averageResponseTime: averageResponseTime,
  microSeconds: microSeconds
};

Object.defineProperty(methodChooser, "__esModule", {
  value: true
});
methodChooser.chooseMethod = chooseMethod;
var _native = native;
var _indexedDb = indexedDb;
var _localstorage = localstorage;
var _simulate = simulate;
// the line below will be removed from es5/browser builds

// order is important
var METHODS = [_native.NativeMethod,
// fastest
_indexedDb.IndexedDBMethod, _localstorage.LocalstorageMethod];
function chooseMethod(options) {
  var chooseMethods = [].concat(options.methods, METHODS).filter(Boolean);

  // the line below will be removed from es5/browser builds

  // directly chosen
  if (options.type) {
    if (options.type === 'simulate') {
      // only use simulate-method if directly chosen
      return _simulate.SimulateMethod;
    }
    var ret = chooseMethods.find(function (m) {
      return m.type === options.type;
    });
    if (!ret) throw new Error('method-type ' + options.type + ' not found');else return ret;
  }

  /**
   * if no webworker support is needed,
   * remove idb from the list so that localstorage will be chosen
   */
  if (!options.webWorkerSupport) {
    chooseMethods = chooseMethods.filter(function (m) {
      return m.type !== 'idb';
    });
  }
  var useMethod = chooseMethods.find(function (method) {
    return method.canBeUsed();
  });
  if (!useMethod) {
    throw new Error("No usable method found in " + JSON.stringify(METHODS.map(function (m) {
      return m.type;
    })));
  } else {
    return useMethod;
  }
}

Object.defineProperty(broadcastChannel, "__esModule", {
  value: true
});
broadcastChannel.OPEN_BROADCAST_CHANNELS = broadcastChannel.BroadcastChannel = void 0;
broadcastChannel.clearNodeFolder = clearNodeFolder;
broadcastChannel.enforceOptions = enforceOptions;
var _util$2 = util;
var _methodChooser = methodChooser;
var _options = options;
/**
 * Contains all open channels,
 * used in tests to ensure everything is closed.
 */
var OPEN_BROADCAST_CHANNELS = broadcastChannel.OPEN_BROADCAST_CHANNELS = new Set();
var lastId = 0;
var BroadcastChannel$1 = broadcastChannel.BroadcastChannel = function BroadcastChannel(name, options) {
  // identifier of the channel to debug stuff
  this.id = lastId++;
  OPEN_BROADCAST_CHANNELS.add(this);
  this.name = name;
  if (ENFORCED_OPTIONS) {
    options = ENFORCED_OPTIONS;
  }
  this.options = (0, _options.fillOptionsWithDefaults)(options);
  this.method = (0, _methodChooser.chooseMethod)(this.options);

  // isListening
  this._iL = false;

  /**
   * _onMessageListener
   * setting onmessage twice,
   * will overwrite the first listener
   */
  this._onML = null;

  /**
   * _addEventListeners
   */
  this._addEL = {
    message: [],
    internal: []
  };

  /**
   * Unsent message promises
   * where the sending is still in progress
   * @type {Set<Promise>}
   */
  this._uMP = new Set();

  /**
   * _beforeClose
   * array of promises that will be awaited
   * before the channel is closed
   */
  this._befC = [];

  /**
   * _preparePromise
   */
  this._prepP = null;
  _prepareChannel(this);
};

// STATICS

/**
 * used to identify if someone overwrites
 * window.BroadcastChannel with this
 * See methods/native.js
 */
BroadcastChannel$1._pubkey = true;

/**
 * clears the tmp-folder if is node
 * @return {Promise<boolean>} true if has run, false if not node
 */
function clearNodeFolder(options) {
  options = (0, _options.fillOptionsWithDefaults)(options);
  var method = (0, _methodChooser.chooseMethod)(options);
  if (method.type === 'node') {
    return method.clearNodeFolder().then(function () {
      return true;
    });
  } else {
    return _util$2.PROMISE_RESOLVED_FALSE;
  }
}

/**
 * if set, this method is enforced,
 * no mather what the options are
 */
var ENFORCED_OPTIONS;
function enforceOptions(options) {
  ENFORCED_OPTIONS = options;
}

// PROTOTYPE
BroadcastChannel$1.prototype = {
  postMessage: function postMessage(msg) {
    if (this.closed) {
      throw new Error('BroadcastChannel.postMessage(): ' + 'Cannot post message after channel has closed ' +
      /**
       * In the past when this error appeared, it was really hard to debug.
       * So now we log the msg together with the error so it at least
       * gives some clue about where in your application this happens.
       */
      JSON.stringify(msg));
    }
    return _post(this, 'message', msg);
  },
  postInternal: function postInternal(msg) {
    return _post(this, 'internal', msg);
  },
  set onmessage(fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };
    _removeListenerObject(this, 'message', this._onML);
    if (fn && typeof fn === 'function') {
      this._onML = listenObj;
      _addListenerObject(this, 'message', listenObj);
    } else {
      this._onML = null;
    }
  },
  addEventListener: function addEventListener(type, fn) {
    var time = this.method.microSeconds();
    var listenObj = {
      time: time,
      fn: fn
    };
    _addListenerObject(this, type, listenObj);
  },
  removeEventListener: function removeEventListener(type, fn) {
    var obj = this._addEL[type].find(function (obj) {
      return obj.fn === fn;
    });
    _removeListenerObject(this, type, obj);
  },
  close: function close() {
    var _this = this;
    if (this.closed) {
      return;
    }
    OPEN_BROADCAST_CHANNELS["delete"](this);
    this.closed = true;
    var awaitPrepare = this._prepP ? this._prepP : _util$2.PROMISE_RESOLVED_VOID;
    this._onML = null;
    this._addEL.message = [];
    return awaitPrepare
    // wait until all current sending are processed
    .then(function () {
      return Promise.all(Array.from(_this._uMP));
    })
    // run before-close hooks
    .then(function () {
      return Promise.all(_this._befC.map(function (fn) {
        return fn();
      }));
    })
    // close the channel
    .then(function () {
      return _this.method.close(_this._state);
    });
  },
  get type() {
    return this.method.type;
  },
  get isClosed() {
    return this.closed;
  }
};

/**
 * Post a message over the channel
 * @returns {Promise} that resolved when the message sending is done
 */
function _post(broadcastChannel, type, msg) {
  var time = broadcastChannel.method.microSeconds();
  var msgObj = {
    time: time,
    type: type,
    data: msg
  };
  var awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : _util$2.PROMISE_RESOLVED_VOID;
  return awaitPrepare.then(function () {
    var sendPromise = broadcastChannel.method.postMessage(broadcastChannel._state, msgObj);

    // add/remove to unsent messages list
    broadcastChannel._uMP.add(sendPromise);
    sendPromise["catch"]().then(function () {
      return broadcastChannel._uMP["delete"](sendPromise);
    });
    return sendPromise;
  });
}
function _prepareChannel(channel) {
  var maybePromise = channel.method.create(channel.name, channel.options);
  if ((0, _util$2.isPromise)(maybePromise)) {
    channel._prepP = maybePromise;
    maybePromise.then(function (s) {
      // used in tests to simulate slow runtime
      /*if (channel.options.prepareDelay) {
           await new Promise(res => setTimeout(res, this.options.prepareDelay));
      }*/
      channel._state = s;
    });
  } else {
    channel._state = maybePromise;
  }
}
function _hasMessageListeners(channel) {
  if (channel._addEL.message.length > 0) return true;
  if (channel._addEL.internal.length > 0) return true;
  return false;
}
function _addListenerObject(channel, type, obj) {
  channel._addEL[type].push(obj);
  _startListening(channel);
}
function _removeListenerObject(channel, type, obj) {
  channel._addEL[type] = channel._addEL[type].filter(function (o) {
    return o !== obj;
  });
  _stopListening(channel);
}
function _startListening(channel) {
  if (!channel._iL && _hasMessageListeners(channel)) {
    // someone is listening, start subscribing

    var listenerFn = function listenerFn(msgObj) {
      channel._addEL[msgObj.type].forEach(function (listenerObject) {
        if (msgObj.time >= listenerObject.time) {
          listenerObject.fn(msgObj.data);
        }
      });
    };
    var time = channel.method.microSeconds();
    if (channel._prepP) {
      channel._prepP.then(function () {
        channel._iL = true;
        channel.method.onMessage(channel._state, listenerFn, time);
      });
    } else {
      channel._iL = true;
      channel.method.onMessage(channel._state, listenerFn, time);
    }
  }
}
function _stopListening(channel) {
  if (channel._iL && !_hasMessageListeners(channel)) {
    // no one is listening, stop subscribing
    channel._iL = false;
    var time = channel.method.microSeconds();
    channel.method.onMessage(channel._state, null, time);
  }
}

var leaderElection = {};

var leaderElectionUtil = {};

/* global WorkerGlobalScope */

function addBrowser(fn) {
  if (typeof WorkerGlobalScope === 'function' && self instanceof WorkerGlobalScope) {
    /**
     * Because killing a worker does directly stop the excution
     * of the code, our only chance is to overwrite the close function
     * which could work some times.
     * @link https://stackoverflow.com/q/72903255/3443137
     */
    var oldClose = self.close.bind(self);
    self.close = function () {
      fn();
      return oldClose();
    };
  } else {
    /**
     * if we are on react-native, there is no window.addEventListener
     * @link https://github.com/pubkey/unload/issues/6
     */
    if (typeof window.addEventListener !== 'function') {
      return;
    }

    /**
     * for normal browser-windows, we use the beforeunload-event
     */
    window.addEventListener('beforeunload', function () {
      fn();
    }, true);

    /**
     * for iframes, we have to use the unload-event
     * @link https://stackoverflow.com/q/47533670/3443137
     */
    window.addEventListener('unload', function () {
      fn();
    }, true);
  }

  /**
   * TODO add fallback for safari-mobile
   * @link https://stackoverflow.com/a/26193516/3443137
   */
}

function addNode(fn) {
  process.on('exit', function () {
    return fn();
  });

  /**
   * on the following events,
   * the process will not end if there are
   * event-handlers attached,
   * therefore we have to call process.exit()
   */
  process.on('beforeExit', function () {
    return fn().then(function () {
      return process.exit();
    });
  });
  // catches ctrl+c event
  process.on('SIGINT', function () {
    return fn().then(function () {
      return process.exit();
    });
  });
  // catches uncaught exceptions
  process.on('uncaughtException', function (err) {
    return fn().then(function () {
      console.trace(err);
      process.exit(101);
    });
  });
}

/**
 * Use the code directly to prevent import problems
 * with the detect-node package.
 * @link https://github.com/iliakan/detect-node/blob/master/index.js
 */
var isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
var USE_METHOD = isNode ? addNode : addBrowser;
var LISTENERS = new Set();
var startedListening = false;
function startListening() {
  if (startedListening) {
    return;
  }
  startedListening = true;
  USE_METHOD(runAll);
}
function add(fn) {
  startListening();
  if (typeof fn !== 'function') {
    throw new Error('Listener is no function');
  }
  LISTENERS.add(fn);
  var addReturn = {
    remove: function remove() {
      return LISTENERS["delete"](fn);
    },
    run: function run() {
      LISTENERS["delete"](fn);
      return fn();
    }
  };
  return addReturn;
}
function runAll() {
  var promises = [];
  LISTENERS.forEach(function (fn) {
    promises.push(fn());
    LISTENERS["delete"](fn);
  });
  return Promise.all(promises);
}
function removeAll() {
  LISTENERS.clear();
}
function getSize() {
  return LISTENERS.size;
}

var es = /*#__PURE__*/Object.freeze({
    __proto__: null,
    add: add,
    getSize: getSize,
    removeAll: removeAll,
    runAll: runAll
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(es);

Object.defineProperty(leaderElectionUtil, "__esModule", {
  value: true
});
leaderElectionUtil.beLeader = beLeader;
leaderElectionUtil.sendLeaderMessage = sendLeaderMessage;
var _unload = require$$0;
/**
 * sends and internal message over the broadcast-channel
 */
function sendLeaderMessage(leaderElector, action) {
  var msgJson = {
    context: 'leader',
    action: action,
    token: leaderElector.token
  };
  return leaderElector.broadcastChannel.postInternal(msgJson);
}
function beLeader(leaderElector) {
  leaderElector.isLeader = true;
  leaderElector._hasLeader = true;
  var unloadFn = (0, _unload.add)(function () {
    return leaderElector.die();
  });
  leaderElector._unl.push(unloadFn);
  var isLeaderListener = function isLeaderListener(msg) {
    if (msg.context === 'leader' && msg.action === 'apply') {
      sendLeaderMessage(leaderElector, 'tell');
    }
    if (msg.context === 'leader' && msg.action === 'tell' && !leaderElector._dpLC) {
      /**
       * another instance is also leader!
       * This can happen on rare events
       * like when the CPU is at 100% for long time
       * or the tabs are open very long and the browser throttles them.
       * @link https://github.com/pubkey/broadcast-channel/issues/414
       * @link https://github.com/pubkey/broadcast-channel/issues/385
       */
      leaderElector._dpLC = true;
      leaderElector._dpL(); // message the lib user so the app can handle the problem
      sendLeaderMessage(leaderElector, 'tell'); // ensure other leader also knows the problem
    }
  };

  leaderElector.broadcastChannel.addEventListener('internal', isLeaderListener);
  leaderElector._lstns.push(isLeaderListener);
  return sendLeaderMessage(leaderElector, 'tell');
}

var leaderElectionWebLock = {};

Object.defineProperty(leaderElectionWebLock, "__esModule", {
  value: true
});
leaderElectionWebLock.LeaderElectionWebLock = void 0;
var _util$1 = util;
var _leaderElectionUtil$1 = leaderElectionUtil;
/**
 * A faster version of the leader elector that uses the WebLock API
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
 */
var LeaderElectionWebLock = leaderElectionWebLock.LeaderElectionWebLock = function LeaderElectionWebLock(broadcastChannel, options) {
  var _this = this;
  this.broadcastChannel = broadcastChannel;
  broadcastChannel._befC.push(function () {
    return _this.die();
  });
  this._options = options;
  this.isLeader = false;
  this.isDead = false;
  this.token = (0, _util$1.randomToken)();
  this._lstns = [];
  this._unl = [];
  this._dpL = function () {}; // onduplicate listener
  this._dpLC = false; // true when onduplicate called

  this._wKMC = {}; // stuff for cleanup

  // lock name
  this.lN = 'pubkey-bc||' + broadcastChannel.method.type + '||' + broadcastChannel.name;
};
LeaderElectionWebLock.prototype = {
  hasLeader: function hasLeader() {
    var _this2 = this;
    return navigator.locks.query().then(function (locks) {
      var relevantLocks = locks.held ? locks.held.filter(function (lock) {
        return lock.name === _this2.lN;
      }) : [];
      if (relevantLocks && relevantLocks.length > 0) {
        return true;
      } else {
        return false;
      }
    });
  },
  awaitLeadership: function awaitLeadership() {
    var _this3 = this;
    if (!this._wLMP) {
      this._wKMC.c = new AbortController();
      var returnPromise = new Promise(function (res, rej) {
        _this3._wKMC.res = res;
        _this3._wKMC.rej = rej;
      });
      this._wLMP = new Promise(function (res) {
        navigator.locks.request(_this3.lN, {
          signal: _this3._wKMC.c.signal
        }, function () {
          // if the lock resolved, we can drop the abort controller
          _this3._wKMC.c = undefined;
          (0, _leaderElectionUtil$1.beLeader)(_this3);
          res();
          return returnPromise;
        })["catch"](function () {});
      });
    }
    return this._wLMP;
  },
  set onduplicate(_fn) {
    // Do nothing because there are no duplicates in the WebLock version
  },
  die: function die() {
    var _this4 = this;
    this._lstns.forEach(function (listener) {
      return _this4.broadcastChannel.removeEventListener('internal', listener);
    });
    this._lstns = [];
    this._unl.forEach(function (uFn) {
      return uFn.remove();
    });
    this._unl = [];
    if (this.isLeader) {
      this.isLeader = false;
    }
    this.isDead = true;
    if (this._wKMC.res) {
      this._wKMC.res();
    }
    if (this._wKMC.c) {
      this._wKMC.c.abort('LeaderElectionWebLock.die() called');
    }
    return (0, _leaderElectionUtil$1.sendLeaderMessage)(this, 'death');
  }
};

Object.defineProperty(leaderElection, "__esModule", {
  value: true
});
leaderElection.createLeaderElection = createLeaderElection;
var _util = util;
var _leaderElectionUtil = leaderElectionUtil;
var _leaderElectionWebLock = leaderElectionWebLock;
var LeaderElection = function LeaderElection(broadcastChannel, options) {
  var _this = this;
  this.broadcastChannel = broadcastChannel;
  this._options = options;
  this.isLeader = false;
  this._hasLeader = false;
  this.isDead = false;
  this.token = (0, _util.randomToken)();

  /**
   * Apply Queue,
   * used to ensure we do not run applyOnce()
   * in parallel.
   */
  this._aplQ = _util.PROMISE_RESOLVED_VOID;
  // amount of unfinished applyOnce() calls
  this._aplQC = 0;

  // things to clean up
  this._unl = []; // _unloads
  this._lstns = []; // _listeners
  this._dpL = function () {}; // onduplicate listener
  this._dpLC = false; // true when onduplicate called

  /**
   * Even when the own instance is not applying,
   * we still listen to messages to ensure the hasLeader flag
   * is set correctly.
   */
  var hasLeaderListener = function hasLeaderListener(msg) {
    if (msg.context === 'leader') {
      if (msg.action === 'death') {
        _this._hasLeader = false;
      }
      if (msg.action === 'tell') {
        _this._hasLeader = true;
      }
    }
  };
  this.broadcastChannel.addEventListener('internal', hasLeaderListener);
  this._lstns.push(hasLeaderListener);
};
LeaderElection.prototype = {
  hasLeader: function hasLeader() {
    return Promise.resolve(this._hasLeader);
  },
  /**
   * Returns true if the instance is leader,
   * false if not.
   * @async
   */
  applyOnce: function applyOnce(
  // true if the applyOnce() call came from the fallbackInterval cycle
  isFromFallbackInterval) {
    var _this2 = this;
    if (this.isLeader) {
      return (0, _util.sleep)(0, true);
    }
    if (this.isDead) {
      return (0, _util.sleep)(0, false);
    }

    /**
     * Already applying more than once,
     * -> wait for the apply queue to be finished.
     */
    if (this._aplQC > 1) {
      return this._aplQ;
    }

    /**
     * Add a new apply-run
     */
    var applyRun = function applyRun() {
      /**
       * Optimization shortcuts.
       * Directly return if a previous run
       * has already elected a leader.
       */
      if (_this2.isLeader) {
        return _util.PROMISE_RESOLVED_TRUE;
      }
      var stopCriteria = false;
      var stopCriteriaPromiseResolve;
      /**
       * Resolves when a stop criteria is reached.
       * Uses as a performance shortcut so we do not
       * have to await the responseTime when it is already clear
       * that the election failed.
       */
      var stopCriteriaPromise = new Promise(function (res) {
        stopCriteriaPromiseResolve = function stopCriteriaPromiseResolve() {
          stopCriteria = true;
          res();
        };
      });
      var handleMessage = function handleMessage(msg) {
        if (msg.context === 'leader' && msg.token != _this2.token) {
          if (msg.action === 'apply') {
            // other is applying
            if (msg.token > _this2.token) {
              /**
               * other has higher token
               * -> stop applying and let other become leader.
               */
              stopCriteriaPromiseResolve();
            }
          }
          if (msg.action === 'tell') {
            // other is already leader
            stopCriteriaPromiseResolve();
            _this2._hasLeader = true;
          }
        }
      };
      _this2.broadcastChannel.addEventListener('internal', handleMessage);

      /**
       * If the applyOnce() call came from the fallbackInterval,
       * we can assume that the election runs in the background and
       * not critical process is waiting for it.
       * When this is true, we give the other instances
       * more time to answer to messages in the election cycle.
       * This makes it less likely to elect duplicate leaders.
       * But also it takes longer which is not a problem because we anyway
       * run in the background.
       */
      var waitForAnswerTime = isFromFallbackInterval ? _this2._options.responseTime * 4 : _this2._options.responseTime;
      return (0, _leaderElectionUtil.sendLeaderMessage)(_this2, 'apply') // send out that this one is applying
      .then(function () {
        return Promise.race([(0, _util.sleep)(waitForAnswerTime), stopCriteriaPromise.then(function () {
          return Promise.reject(new Error());
        })]);
      })
      // send again in case another instance was just created
      .then(function () {
        return (0, _leaderElectionUtil.sendLeaderMessage)(_this2, 'apply');
      })
      // let others time to respond
      .then(function () {
        return Promise.race([(0, _util.sleep)(waitForAnswerTime), stopCriteriaPromise.then(function () {
          return Promise.reject(new Error());
        })]);
      })["catch"](function () {}).then(function () {
        _this2.broadcastChannel.removeEventListener('internal', handleMessage);
        if (!stopCriteria) {
          // no stop criteria -> own is leader
          return (0, _leaderElectionUtil.beLeader)(_this2).then(function () {
            return true;
          });
        } else {
          // other is leader
          return false;
        }
      });
    };
    this._aplQC = this._aplQC + 1;
    this._aplQ = this._aplQ.then(function () {
      return applyRun();
    }).then(function () {
      _this2._aplQC = _this2._aplQC - 1;
    });
    return this._aplQ.then(function () {
      return _this2.isLeader;
    });
  },
  awaitLeadership: function awaitLeadership() {
    if ( /* _awaitLeadershipPromise */
    !this._aLP) {
      this._aLP = _awaitLeadershipOnce(this);
    }
    return this._aLP;
  },
  set onduplicate(fn) {
    this._dpL = fn;
  },
  die: function die() {
    var _this3 = this;
    this._lstns.forEach(function (listener) {
      return _this3.broadcastChannel.removeEventListener('internal', listener);
    });
    this._lstns = [];
    this._unl.forEach(function (uFn) {
      return uFn.remove();
    });
    this._unl = [];
    if (this.isLeader) {
      this._hasLeader = false;
      this.isLeader = false;
    }
    this.isDead = true;
    return (0, _leaderElectionUtil.sendLeaderMessage)(this, 'death');
  }
};

/**
 * @param leaderElector {LeaderElector}
 */
function _awaitLeadershipOnce(leaderElector) {
  if (leaderElector.isLeader) {
    return _util.PROMISE_RESOLVED_VOID;
  }
  return new Promise(function (res) {
    var resolved = false;
    function finish() {
      if (resolved) {
        return;
      }
      resolved = true;
      leaderElector.broadcastChannel.removeEventListener('internal', whenDeathListener);
      res(true);
    }

    // try once now
    leaderElector.applyOnce().then(function () {
      if (leaderElector.isLeader) {
        finish();
      }
    });

    /**
     * Try on fallbackInterval
     * @recursive
     */
    var tryOnFallBack = function tryOnFallBack() {
      return (0, _util.sleep)(leaderElector._options.fallbackInterval).then(function () {
        if (leaderElector.isDead || resolved) {
          return;
        }
        if (leaderElector.isLeader) {
          finish();
        } else {
          return leaderElector.applyOnce(true).then(function () {
            if (leaderElector.isLeader) {
              finish();
            } else {
              tryOnFallBack();
            }
          });
        }
      });
    };
    tryOnFallBack();

    // try when other leader dies
    var whenDeathListener = function whenDeathListener(msg) {
      if (msg.context === 'leader' && msg.action === 'death') {
        leaderElector._hasLeader = false;
        leaderElector.applyOnce().then(function () {
          if (leaderElector.isLeader) {
            finish();
          }
        });
      }
    };
    leaderElector.broadcastChannel.addEventListener('internal', whenDeathListener);
    leaderElector._lstns.push(whenDeathListener);
  });
}
function fillOptionsWithDefaults(options, channel) {
  if (!options) options = {};
  options = JSON.parse(JSON.stringify(options));
  if (!options.fallbackInterval) {
    options.fallbackInterval = 3000;
  }
  if (!options.responseTime) {
    options.responseTime = channel.method.averageResponseTime(channel.options);
  }
  return options;
}
function createLeaderElection(channel, options) {
  if (channel._leaderElector) {
    throw new Error('BroadcastChannel already has a leader-elector');
  }
  options = fillOptionsWithDefaults(options, channel);
  var elector = (0, _util.supportsWebLockAPI)() ? new _leaderElectionWebLock.LeaderElectionWebLock(channel, options) : new LeaderElection(channel, options);
  channel._befC.push(function () {
    return elector.die();
  });
  channel._leaderElector = elector;
  return elector;
}

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "BroadcastChannel", {
	  enumerable: true,
	  get: function get() {
	    return _broadcastChannel.BroadcastChannel;
	  }
	});
	Object.defineProperty(exports, "OPEN_BROADCAST_CHANNELS", {
	  enumerable: true,
	  get: function get() {
	    return _broadcastChannel.OPEN_BROADCAST_CHANNELS;
	  }
	});
	Object.defineProperty(exports, "beLeader", {
	  enumerable: true,
	  get: function get() {
	    return _leaderElectionUtil.beLeader;
	  }
	});
	Object.defineProperty(exports, "clearNodeFolder", {
	  enumerable: true,
	  get: function get() {
	    return _broadcastChannel.clearNodeFolder;
	  }
	});
	Object.defineProperty(exports, "createLeaderElection", {
	  enumerable: true,
	  get: function get() {
	    return _leaderElection.createLeaderElection;
	  }
	});
	Object.defineProperty(exports, "enforceOptions", {
	  enumerable: true,
	  get: function get() {
	    return _broadcastChannel.enforceOptions;
	  }
	});
	var _broadcastChannel = broadcastChannel;
	var _leaderElection = leaderElection;
	var _leaderElectionUtil = leaderElectionUtil; 
} (lib));

var _index = lib;
/**
 * because babel can only export on default-attribute,
 * we use this for the non-module-build
 * this ensures that users do not have to use
 * var BroadcastChannel = require('broadcast-channel').default;
 * but
 * var BroadcastChannel = require('broadcast-channel');
 */

var index_es5 = {
  BroadcastChannel: _index.BroadcastChannel,
  createLeaderElection: _index.createLeaderElection,
  clearNodeFolder: _index.clearNodeFolder,
  enforceOptions: _index.enforceOptions,
  beLeader: _index.beLeader
};

/**
 * When a persistent RxStorage is used in more the one JavaScript process,
 * the even stream of the changestream() function must be broadcasted to the other
 * RxStorageInstances of the same databaseName+collectionName.
 *
 * In the past this was done by RxDB but it makes more sense to do this
 * at the RxStorage level so that the broadcasting etc can all happen inside of a WebWorker
 * and not on the main thread.
 * Also it makes it less complex to stack up different RxStorages onto each other
 * like what we do with the in-memory plugin.
 *
 * This is intended to be used inside of createStorageInstance() of a storage.
 * Do not use this if the storage anyway broadcasts the events like when using MongoDB
 * or in the future W3C might introduce a way to listen to IndexedDB changes.
 */


/**
 * The broadcast-channel is reused by the databaseInstanceToken.
 * This is required so that it is easy to simulate multi-tab usage
 * in the test where different instances of the same RxDatabase must
 * have different broadcast channels.
 * But also it ensures that for each RxDatabase we only create a single
 * broadcast channel that can even be reused in the leader election plugin.
 *
 * TODO at the end of the unit tests,
 * we should ensure that all channels are closed and cleaned up.
 * Otherwise we have forgot something.
 */
var BROADCAST_CHANNEL_BY_TOKEN = new Map();
function getBroadcastChannelReference(storageName, databaseInstanceToken, databaseName, refObject) {
  var state = BROADCAST_CHANNEL_BY_TOKEN.get(databaseInstanceToken);
  if (!state) {
    state = {
      /**
       * We have to use the databaseName instead of the databaseInstanceToken
       * in the BroadcastChannel name because different instances must end with the same
       * channel name to be able to broadcast messages between each other.
       */
      bc: new index_es5.BroadcastChannel(['RxDB:', storageName, databaseName].join('|')),
      refs: new Set()
    };
    BROADCAST_CHANNEL_BY_TOKEN.set(databaseInstanceToken, state);
  }
  state.refs.add(refObject);
  return state.bc;
}
function removeBroadcastChannelReference(databaseInstanceToken, refObject) {
  var state = BROADCAST_CHANNEL_BY_TOKEN.get(databaseInstanceToken);
  if (!state) {
    return;
  }
  state.refs.delete(refObject);
  if (state.refs.size === 0) {
    BROADCAST_CHANNEL_BY_TOKEN.delete(databaseInstanceToken);
    return state.bc.close();
  }
}
function addRxStorageMultiInstanceSupport(storageName, instanceCreationParams, instance,
/**
 * If provided, that channel will be used
 * instead of an own one.
 */
providedBroadcastChannel) {
  if (!instanceCreationParams.multiInstance) {
    return;
  }
  var broadcastChannel = getBroadcastChannelReference(storageName, instanceCreationParams.databaseInstanceToken, instance.databaseName, instance);
  var changesFromOtherInstances$ = new Subject();
  var eventListener = msg => {
    if (msg.storageName === storageName && msg.databaseName === instanceCreationParams.databaseName && msg.collectionName === instanceCreationParams.collectionName && msg.version === instanceCreationParams.schema.version) {
      changesFromOtherInstances$.next(msg.eventBulk);
    }
  };
  broadcastChannel.addEventListener('message', eventListener);
  var oldChangestream$ = instance.changeStream();
  var closed = false;
  var sub = oldChangestream$.subscribe(eventBulk => {
    if (closed) {
      return;
    }
    broadcastChannel.postMessage({
      storageName: storageName,
      databaseName: instanceCreationParams.databaseName,
      collectionName: instanceCreationParams.collectionName,
      version: instanceCreationParams.schema.version,
      eventBulk
    });
  });
  instance.changeStream = function () {
    return changesFromOtherInstances$.asObservable().pipe(mergeWith(oldChangestream$));
  };
  var oldClose = instance.close.bind(instance);
  instance.close = async function () {
    closed = true;
    sub.unsubscribe();
    broadcastChannel.removeEventListener('message', eventListener);
    {
      await removeBroadcastChannelReference(instanceCreationParams.databaseInstanceToken, instance);
    }
    return oldClose();
  };
  var oldRemove = instance.remove.bind(instance);
  instance.remove = async function () {
    closed = true;
    sub.unsubscribe();
    broadcastChannel.removeEventListener('message', eventListener);
    {
      await removeBroadcastChannelReference(instanceCreationParams.databaseInstanceToken, instance);
    }
    return oldRemove();
  };
}

const schema$6 = {
    "title": "user",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "username": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "avatar": {
            "type": "string"
        },
        "publicKey": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "username",
        "secret",
        "name",
        "avatar",
        "publicKey"
    ]
};
const userSchema = schema$6;

/**
 * this plugin adds the error-messages
 * without it, only error-codes will be shown
 * This is mainly because error-string are hard to compress and we need a smaller build
 */

var ERROR_MESSAGES = {
  // util.js / config
  UT1: 'given name is no string or empty',
  UT2: "collection- and database-names must match the regex to be compatible with couchdb databases.\n    See https://neighbourhood.ie/blog/2020/10/13/everything-you-need-to-know-about-couchdb-database-names/\n    info: if your database-name specifies a folder, the name must contain the slash-char '/' or '\\'",
  UT3: 'replication-direction must either be push or pull or both. But not none',
  UT4: 'given leveldown is no valid adapter',
  UT5: 'keyCompression is set to true in the schema but no key-compression handler is used in the storage',
  UT6: 'schema contains encrypted fields but no encryption handler is used in the storage',
  UT7: 'attachments.compression is enabled but no attachment-compression plugin is used',
  // plugins
  PL1: 'Given plugin is not RxDB plugin.',
  // removed in 14.0.0 - PouchDB RxStorage was removed - PL2: 'You tried importing a RxDB plugin to pouchdb. Use addRxPlugin() instead.',
  PL3: 'A plugin with the same name was already added but it was not the exact same JavaScript object',
  // pouch-db.js
  // removed in 12.0.0 - P1: 'PouchDB.getBatch: limit must be > 2',
  P2: 'bulkWrite() cannot be called with an empty array',
  // removed in 12.0.0 - P3: 'bulkAddRevisions cannot be called with an empty array',

  // rx-query
  QU1: 'RxQuery._execOverDatabase(): op not known',
  // removed in 9.0.0 - QU2: 'limit() must get a number',
  // removed in 9.0.0 - QU3: 'skip() must get a number',
  QU4: 'RxQuery.regex(): You cannot use .regex() on the primary field',
  QU5: 'RxQuery.sort(): does not work because key is not defined in the schema',
  QU6: 'RxQuery.limit(): cannot be called on .findOne()',
  // removed in 12.0.0 (should by ensured by the typings) - QU7: 'query must be an object',
  // removed in 12.0.0 (should by ensured by the typings) - QU8: 'query cannot be an array',
  QU9: 'throwIfMissing can only be used in findOne queries',
  QU10: 'result empty and throwIfMissing: true',
  QU11: 'RxQuery: no valid query params given',
  QU12: 'Given index is not in schema',
  QU13: 'A top level field of the query is not included in the schema',
  QU14: 'Running a count() query in slow mode is now allowed. Either run a count() query with a selector that fully matches an index ' + 'or set allowSlowCount=true when calling the createRxDatabase',
  QU15: 'For count queries it is not allowed to use skip or limit',
  QU16: '$regex queries must be defined by a string, not an RegExp instance. ' + 'This is because RegExp objects cannot be JSON stringified and also they are mutable which would be dangerous',
  // mquery.js
  MQ1: 'path must be a string or object',
  MQ2: 'Invalid argument',
  MQ3: 'Invalid sort() argument. Must be a string, object, or array',
  MQ4: 'Invalid argument. Expected instanceof mquery or plain object',
  MQ5: 'method must be used after where() when called with these arguments',
  MQ6: 'Can\'t mix sort syntaxes. Use either array or object | .sort([[\'field\', 1], [\'test\', -1]]) | .sort({ field: 1, test: -1 })',
  MQ7: 'Invalid sort value',
  MQ8: 'Can\'t mix sort syntaxes. Use either array or object',
  // rx-database
  DB1: 'RxDocument.prepare(): another instance on this adapter has a different password',
  DB2: 'RxDatabase.addCollections(): collection-names cannot start with underscore _',
  DB3: 'RxDatabase.addCollections(): collection already exists. use myDatabase[collectionName] to get it',
  DB4: 'RxDatabase.addCollections(): schema is missing',
  DB5: 'RxDatabase.addCollections(): collection-name not allowed',
  DB6: 'RxDatabase.addCollections(): another instance created this collection with a different schema. Read this https://rxdb.info/questions-answers.html?console=qa#cant-change-the-schema ',
  // removed in 13.0.0 (now part of the encryption plugin) DB7: 'RxDatabase.addCollections(): schema encrypted but no password given',
  DB8: 'createRxDatabase(): A RxDatabase with the same name and adapter already exists.\n' + 'Make sure to use this combination only once or set ignoreDuplicate to true if you do this intentional-\n' + 'This often happens in react projects with hot reload that reloads the code without reloading the process.',
  // removed in 14.0.0 - PouchDB RxStorage is removed - DB9: 'createRxDatabase(): Adapter not added. Use addPouchPlugin(require(\'pouchdb-adapter-[adaptername]\'));',
  // removed in 14.0.0 - PouchDB RxStorage is removed DB10: 'createRxDatabase(): To use leveldown-adapters, you have to add the leveldb-plugin. Use addPouchPlugin(require(\'pouchdb-adapter-leveldb\'));',
  DB11: 'createRxDatabase(): Invalid db-name, folder-paths must not have an ending slash',
  DB12: 'RxDatabase.addCollections(): could not write to internal store',
  DB13: 'createRxDatabase(): Invalid db-name or collection name, name contains the dollar sign',
  DB14: 'no custom reactivity factory added on database creation',
  // rx-collection
  COL1: 'RxDocument.insert() You cannot insert an existing document',
  COL2: 'RxCollection.insert() fieldName ._id can only be used as primaryKey',
  COL3: 'RxCollection.upsert() does not work without primary',
  COL4: 'RxCollection.incrementalUpsert() does not work without primary',
  COL5: 'RxCollection.find() if you want to search by _id, use .findOne(_id)',
  COL6: 'RxCollection.findOne() needs a queryObject or string',
  COL7: 'hook must be a function',
  COL8: 'hooks-when not known',
  COL9: 'RxCollection.addHook() hook-name not known',
  COL10: 'RxCollection .postCreate-hooks cannot be async',
  COL11: 'migrationStrategies must be an object',
  COL12: 'A migrationStrategy is missing or too much',
  COL13: 'migrationStrategy must be a function',
  COL14: 'given static method-name is not a string',
  COL15: 'static method-names cannot start with underscore _',
  COL16: 'given static method is not a function',
  COL17: 'RxCollection.ORM: statics-name not allowed',
  COL18: 'collection-method not allowed because fieldname is in the schema',
  // removed in 14.0.0, use CONFLICT instead - COL19: 'Document update conflict. When changing a document you must work on the previous revision',
  COL20: 'Storage write error',
  COL21: 'The RxCollection is destroyed or removed already, either from this JavaScript realm or from another, like a browser tab',
  CONFLICT: 'Document update conflict. When changing a document you must work on the previous revision',
  // rx-document.js
  DOC1: 'RxDocument.get$ cannot get observable of in-array fields because order cannot be guessed',
  DOC2: 'cannot observe primary path',
  DOC3: 'final fields cannot be observed',
  DOC4: 'RxDocument.get$ cannot observe a non-existed field',
  DOC5: 'RxDocument.populate() cannot populate a non-existed field',
  DOC6: 'RxDocument.populate() cannot populate because path has no ref',
  DOC7: 'RxDocument.populate() ref-collection not in database',
  DOC8: 'RxDocument.set(): primary-key cannot be modified',
  DOC9: 'final fields cannot be modified',
  DOC10: 'RxDocument.set(): cannot set childpath when rootPath not selected',
  DOC11: 'RxDocument.save(): can\'t save deleted document',
  // removed in 10.0.0 DOC12: 'RxDocument.save(): error',
  DOC13: 'RxDocument.remove(): Document is already deleted',
  DOC14: 'RxDocument.destroy() does not exist',
  DOC15: 'query cannot be an array',
  DOC16: 'Since version 8.0.0 RxDocument.set() can only be called on temporary RxDocuments',
  DOC17: 'Since version 8.0.0 RxDocument.save() can only be called on non-temporary documents',
  DOC18: 'Document property for composed primary key is missing',
  DOC19: 'Value of primary key(s) cannot be changed',
  DOC20: 'PrimaryKey missing',
  DOC21: 'PrimaryKey must be equal to PrimaryKey.trim(). It cannot start or end with a whitespace',
  DOC22: 'PrimaryKey must not contain a linebreak',
  DOC23: 'PrimaryKey must not contain a double-quote ["]',
  DOC24: 'Given document data could not be structured cloned. This happens if you pass non-plain-json data into it, like a Date() object or a Function. ' + 'In vue.js this happens if you use ref() on the document data which transforms it into a Proxy object.',
  // data-migrator.js
  DM1: 'migrate() Migration has already run',
  DM2: 'migration of document failed final document does not match final schema',
  DM3: 'migration already running',
  DM4: 'Migration errored',
  DM5: 'Cannot open database state with newer RxDB version. You have to migrate your database state first. See https://rxdb.info/migration-storage.html?console=storage ',
  // plugins/attachments.js
  AT1: 'to use attachments, please define this in your schema',
  // plugins/encryption-crypto-js.js
  EN1: 'password is not valid',
  EN2: 'validatePassword: min-length of password not complied',
  EN3: 'Schema contains encrypted properties but no password is given',
  EN4: 'Password not valid',
  // plugins/json-dump.js
  JD1: 'You must create the collections before you can import their data',
  JD2: 'RxCollection.importJSON(): the imported json relies on a different schema',
  JD3: 'RxCollection.importJSON(): json.passwordHash does not match the own',
  // plugins/leader-election.js

  // plugins/local-documents.js
  LD1: 'RxDocument.allAttachments$ can\'t use attachments on local documents',
  LD2: 'RxDocument.get(): objPath must be a string',
  LD3: 'RxDocument.get$ cannot get observable of in-array fields because order cannot be guessed',
  LD4: 'cannot observe primary path',
  LD5: 'RxDocument.set() id cannot be modified',
  LD6: 'LocalDocument: Function is not usable on local documents',
  LD7: 'Local document already exists',
  LD8: 'localDocuments not activated. Set localDocuments=true on creation, when you want to store local documents on the RxDatabase or RxCollection.',
  // plugins/replication.js
  RC1: 'Replication: already added',
  RC2: 'replicateCouchDB() query must be from the same RxCollection',
  // removed in 14.0.0 - PouchDB RxStorage is removed RC3: 'RxCollection.syncCouchDB() Do not use a collection\'s pouchdb as remote, use the collection instead',
  RC4: 'RxCouchDBReplicationState.awaitInitialReplication() cannot await initial replication when live: true',
  RC5: 'RxCouchDBReplicationState.awaitInitialReplication() cannot await initial replication if multiInstance because the replication might run on another instance',
  RC6: 'syncFirestore() serverTimestampField MUST NOT be part of the collections schema and MUST NOT be nested.',
  RC7: 'SimplePeer requires to have process.nextTick() polyfilled, see https://rxdb.info/replication-webrtc.html?console=webrtc ',
  RC_PULL: 'RxReplication pull handler threw an error - see .errors for more details',
  RC_STREAM: 'RxReplication pull stream$ threw an error - see .errors for more details',
  RC_PUSH: 'RxReplication push handler threw an error - see .errors for more details',
  RC_PUSH_NO_AR: 'RxReplication push handler did not return an array with the conflicts',
  RC_WEBRTC_PEER: 'RxReplication WebRTC Peer has error',
  RC_COUCHDB_1: 'replicateCouchDB() url must end with a slash like \'https://example.com/mydatabase/\'',
  RC_COUCHDB_2: 'replicateCouchDB() did not get valid result with rows.',
  RC_OUTDATED: 'Outdated client, update required. Replication was canceled',
  RC_UNAUTHORIZED: 'Unauthorized client, update the replicationState.headers to set correct auth data',
  RC_FORBIDDEN: 'Client behaves wrong so the replication was canceled. Mostly happens if the client tries to write data that it is not allowed to',
  // plugins/dev-mode/check-schema.js
  SC1: 'fieldnames do not match the regex',
  SC2: 'SchemaCheck: name \'item\' reserved for array-fields',
  SC3: 'SchemaCheck: fieldname has a ref-array but items-type is not string',
  SC4: 'SchemaCheck: fieldname has a ref but is not type string, [string,null] or array<string>',
  SC6: 'SchemaCheck: primary can only be defined at top-level',
  SC7: 'SchemaCheck: default-values can only be defined at top-level',
  SC8: 'SchemaCheck: first level-fields cannot start with underscore _',
  SC10: 'SchemaCheck: schema defines ._rev, this will be done automatically',
  SC11: 'SchemaCheck: schema needs a number >=0 as version',
  // removed in 10.0.0 - SC12: 'SchemaCheck: primary can only be defined once',
  SC13: 'SchemaCheck: primary is always index, do not declare it as index',
  SC14: 'SchemaCheck: primary is always unique, do not declare it as index',
  SC15: 'SchemaCheck: primary cannot be encrypted',
  SC16: 'SchemaCheck: primary must have type: string',
  SC17: 'SchemaCheck: top-level fieldname is not allowed',
  SC18: 'SchemaCheck: indexes must be an array',
  SC19: 'SchemaCheck: indexes must contain strings or arrays of strings',
  SC20: 'SchemaCheck: indexes.array must contain strings',
  SC21: 'SchemaCheck: given index is not defined in schema',
  SC22: 'SchemaCheck: given indexKey is not type:string',
  SC23: 'SchemaCheck: fieldname is not allowed',
  SC24: 'SchemaCheck: required fields must be set via array. See https://spacetelescope.github.io/understanding-json-schema/reference/object.html#required',
  SC25: 'SchemaCheck: compoundIndexes needs to be specified in the indexes field',
  SC26: 'SchemaCheck: indexes needs to be specified at collection schema level',
  SC27: 'SchemaCheck: encrypted fields need to be specified at collection schema level',
  SC28: 'SchemaCheck: encrypted fields is not defined in the schema',
  SC29: 'SchemaCheck: missing object key \'properties\'',
  SC30: 'SchemaCheck: primaryKey is required',
  SC32: 'SchemaCheck: primary field must have the type string/number/integer',
  SC33: 'SchemaCheck: used primary key is not a property in the schema',
  SC34: 'Fields of type string that are used in an index, must have set the maxLength attribute in the schema',
  SC35: 'Fields of type number/integer that are used in an index, must have set the multipleOf attribute in the schema',
  SC36: 'A field of this type cannot be used as index',
  SC37: 'Fields of type number that are used in an index, must have set the minimum and maximum attribute in the schema',
  SC38: 'Fields of type boolean that are used in an index, must be required in the schema',
  SC39: 'The primary key must have the maxLength attribute set',
  SC40: '$ref fields in the schema are not allowed. RxDB cannot resolve related schemas because it would have a negative performance impact.' + 'It would have to run http requests on runtime. $ref fields should be resolved during build time.',
  SC41: 'minimum, maximum and maxLength values for indexes must be real numbers, not Infinity or -Infinity',
  // plugins/dev-mode
  // removed in 13.9.0, use PL3 instead - DEV1: 'dev-mode added multiple times',

  // plugins/validate.js
  VD1: 'Sub-schema not found, does the schemaPath exists in your schema?',
  VD2: 'object does not match schema',
  // plugins/in-memory.js
  // removed in 14.0.0 - PouchDB RxStorage is removed IM1: 'InMemory: Memory-Adapter must be added. Use addPouchPlugin(require(\'pouchdb-adapter-memory\'));',
  // removed in 14.0.0 - PouchDB RxStorage is removed IM2: 'inMemoryCollection.sync(): Do not replicate with the in-memory instance. Replicate with the parent instead',

  // plugins/server.js
  S1: 'You cannot create collections after calling RxDatabase.server()',
  // plugins/replication-graphql.js
  GQL1: 'GraphQL replication: cannot find sub schema by key',
  // removed in 13.0.0, use RC_PULL instead - GQL2: 'GraphQL replication: unknown errors occurred in replication pull - see innerErrors for more details',
  GQL3: 'GraphQL replication: pull returns more documents then batchSize',
  // removed in 13.0.0, use RC_PUSH instead - GQL4: 'GraphQL replication: unknown errors occurred in replication push - see innerErrors for more details',

  // plugins/crdt/
  CRDT1: 'CRDT operations cannot be used because the crdt options are not set in the schema.',
  CRDT2: 'RxDocument.incrementalModify() cannot be used when CRDTs are activated.',
  CRDT3: 'To use CRDTs you MUST NOT set a conflictHandler because the default CRDT conflict handler must be used',
  // plugins/storage-dexie/
  // removed in 15.0.0, added boolean index support to dexie storage - DXE1: 'The dexie.js RxStorage does not support boolean indexes, see https://rxdb.info/rx-storage-dexie.html#boolean-index',

  /**
   * Should never be thrown, use this for
   * null checks etc. so you do not have to increase the
   * build size with error message strings.
   */
  SNH: 'This should never happen'
};

/**
 * returns all possible properties of a RxCollection-instance
 */
var _rxCollectionProperties;
function rxCollectionProperties() {
  if (!_rxCollectionProperties) {
    var pseudoInstance = new RxCollectionBase();
    var ownProperties = Object.getOwnPropertyNames(pseudoInstance);
    var prototypeProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(pseudoInstance));
    _rxCollectionProperties = [...ownProperties, ...prototypeProperties];
  }
  return _rxCollectionProperties;
}

/**
 * returns all possible properties of a RxDatabase-instance
 */
var _rxDatabaseProperties;
function rxDatabaseProperties() {
  if (!_rxDatabaseProperties) {
    var pseudoInstance = new RxDatabaseBase('pseudoInstance', 'memory');
    var ownProperties = Object.getOwnPropertyNames(pseudoInstance);
    var prototypeProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(pseudoInstance));
    _rxDatabaseProperties = [...ownProperties, ...prototypeProperties];
    pseudoInstance.destroy();
  }
  return _rxDatabaseProperties;
}

/**
 * returns all possible properties of a RxDocument
 */
var pseudoConstructor = createRxDocumentConstructor(basePrototype);
var pseudoRxDocument = new pseudoConstructor();
var _rxDocumentProperties;
function rxDocumentProperties() {
  if (!_rxDocumentProperties) {
    var reserved = ['deleted', 'synced'];
    var ownProperties = Object.getOwnPropertyNames(pseudoRxDocument);
    var prototypeProperties = Object.getOwnPropertyNames(basePrototype);
    _rxDocumentProperties = [...ownProperties, ...prototypeProperties, ...reserved];
  }
  return _rxDocumentProperties;
}

/**
 * does additional checks over the schema-json
 * to ensure nothing is broken or not supported
 */

/**
 * checks if the fieldname is allowed
 * this makes sure that the fieldnames can be transformed into javascript-vars
 * and does not conquer the observe$ and populate_ fields
 * @throws {Error}
 */
function checkFieldNameRegex(fieldName) {
  if (fieldName === '_deleted') {
    return;
  }
  if (['properties'].includes(fieldName)) {
    throw newRxError('SC23', {
      fieldName
    });
  }
  var regexStr = '^[a-zA-Z](?:[[a-zA-Z0-9_]*]?[a-zA-Z0-9])?$';
  var regex = new RegExp(regexStr);
  if (
  /**
   * It must be allowed to set _id as primaryKey.
   * This makes it sometimes easier to work with RxDB+CouchDB
   * @link https://github.com/pubkey/rxdb/issues/681
   */
  fieldName !== '_id' && !fieldName.match(regex)) {
    throw newRxError('SC1', {
      regex: regexStr,
      fieldName
    });
  }
}

/**
 * validate that all schema-related things are ok
 */
function validateFieldsDeep(rxJsonSchema) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(rxJsonSchema.primaryKey);
  function checkField(fieldName, schemaObj, path) {
    if (typeof fieldName === 'string' && typeof schemaObj === 'object' && !Array.isArray(schemaObj) && path.split('.').pop() !== 'patternProperties') checkFieldNameRegex(fieldName);

    // 'item' only allowed it type=='array'
    if (Object.prototype.hasOwnProperty.call(schemaObj, 'item') && schemaObj.type !== 'array') {
      throw newRxError('SC2', {
        fieldName
      });
    }

    /**
     * required fields cannot be set via 'required: true',
     * but must be set via required: []
     */
    if (Object.prototype.hasOwnProperty.call(schemaObj, 'required') && typeof schemaObj.required === 'boolean') {
      throw newRxError('SC24', {
        fieldName
      });
    }

    // $ref is not allowed
    if (Object.prototype.hasOwnProperty.call(schemaObj, '$ref')) {
      throw newRxError('SC40', {
        fieldName
      });
    }

    // if ref given, must be type=='string', type=='array' with string-items or type==['string','null']
    if (Object.prototype.hasOwnProperty.call(schemaObj, 'ref')) {
      if (Array.isArray(schemaObj.type)) {
        if (schemaObj.type.length > 2 || !schemaObj.type.includes('string') || !schemaObj.type.includes('null')) {
          throw newRxError('SC4', {
            fieldName
          });
        }
      } else {
        switch (schemaObj.type) {
          case 'string':
            break;
          case 'array':
            if (!schemaObj.items || !schemaObj.items.type || schemaObj.items.type !== 'string') {
              throw newRxError('SC3', {
                fieldName
              });
            }
            break;
          default:
            throw newRxError('SC4', {
              fieldName
            });
        }
      }
    }
    var isNested = path.split('.').length >= 2;

    // nested only
    if (isNested) {
      if (schemaObj.default) {
        throw newRxError('SC7', {
          path
        });
      }
    }

    // first level
    if (!isNested) {
      // if _id is used, it must be primaryKey
      if (fieldName === '_id' && primaryPath !== '_id') {
        throw newRxError('COL2', {
          fieldName
        });
      }

      // check underscore fields
      if (fieldName.charAt(0) === '_') {
        if (
        // exceptional allow underscore on these fields.
        fieldName === '_id' || fieldName === '_deleted') {
          return;
        }
        throw newRxError('SC8', {
          fieldName
        });
      }
    }
  }
  function traverse(currentObj, currentPath) {
    if (!currentObj || typeof currentObj !== 'object') {
      return;
    }
    Object.keys(currentObj).forEach(attributeName => {
      var schemaObj = currentObj[attributeName];
      if (!currentObj.properties && schemaObj && typeof schemaObj === 'object' && !Array.isArray(currentObj)) {
        checkField(attributeName, schemaObj, currentPath);
      }
      var nextPath = currentPath;
      if (attributeName !== 'properties') nextPath = nextPath + '.' + attributeName;
      traverse(schemaObj, nextPath);
    });
  }
  traverse(rxJsonSchema, '');
  return true;
}
function checkPrimaryKey(jsonSchema) {
  if (!jsonSchema.primaryKey) {
    throw newRxError('SC30', {
      schema: jsonSchema
    });
  }
  function validatePrimarySchemaPart(schemaPart) {
    if (!schemaPart) {
      throw newRxError('SC33', {
        schema: jsonSchema
      });
    }
    var type = schemaPart.type;
    if (!type || !['string', 'number', 'integer'].includes(type)) {
      throw newRxError('SC32', {
        schema: jsonSchema,
        args: {
          schemaPart
        }
      });
    }
  }
  if (typeof jsonSchema.primaryKey === 'string') {
    var key = jsonSchema.primaryKey;
    var schemaPart = jsonSchema.properties[key];
    validatePrimarySchemaPart(schemaPart);
  } else {
    var compositePrimaryKey = jsonSchema.primaryKey;
    var keySchemaPart = getSchemaByObjectPath(jsonSchema, compositePrimaryKey.key);
    validatePrimarySchemaPart(keySchemaPart);
    compositePrimaryKey.fields.forEach(field => {
      var schemaPart = getSchemaByObjectPath(jsonSchema, field);
      validatePrimarySchemaPart(schemaPart);
    });
  }

  /**
   * The primary key must have a maxLength set
   * which is required by some RxStorage implementations
   * to ensure we can craft custom index strings.
   */
  var primaryPath = getPrimaryFieldOfPrimaryKey(jsonSchema.primaryKey);
  var primaryPathSchemaPart = jsonSchema.properties[primaryPath];
  if (!primaryPathSchemaPart.maxLength) {
    throw newRxError('SC39', {
      schema: jsonSchema,
      args: {
        primaryPathSchemaPart
      }
    });
  } else if (!isFinite(primaryPathSchemaPart.maxLength)) {
    throw newRxError('SC41', {
      schema: jsonSchema,
      args: {
        primaryPathSchemaPart
      }
    });
  }
}

/**
 * computes real path of the object path in the collection schema
 */
function getSchemaPropertyRealPath(shortPath) {
  var pathParts = shortPath.split('.');
  var realPath = '';
  for (var i = 0; i < pathParts.length; i += 1) {
    if (pathParts[i] !== '[]') {
      realPath = realPath.concat('.properties.'.concat(pathParts[i]));
    } else {
      realPath = realPath.concat('.items');
    }
  }
  return trimDots(realPath);
}

/**
 * does the checking
 * @throws {Error} if something is not ok
 */
function checkSchema(jsonSchema) {
  if (!jsonSchema.primaryKey) {
    throw newRxError('SC30', {
      schema: jsonSchema
    });
  }
  if (!Object.prototype.hasOwnProperty.call(jsonSchema, 'properties')) {
    throw newRxError('SC29', {
      schema: jsonSchema
    });
  }

  // _rev MUST NOT exist, it is added by RxDB
  if (jsonSchema.properties._rev) {
    throw newRxError('SC10', {
      schema: jsonSchema
    });
  }

  // check version
  if (!Object.prototype.hasOwnProperty.call(jsonSchema, 'version') || typeof jsonSchema.version !== 'number' || jsonSchema.version < 0) {
    throw newRxError('SC11', {
      version: jsonSchema.version
    });
  }
  validateFieldsDeep(jsonSchema);
  checkPrimaryKey(jsonSchema);
  Object.keys(jsonSchema.properties).forEach(key => {
    var value = jsonSchema.properties[key];
    // check primary
    if (key === jsonSchema.primaryKey) {
      if (jsonSchema.indexes && jsonSchema.indexes.includes(key)) {
        throw newRxError('SC13', {
          value,
          schema: jsonSchema
        });
      }
      if (value.unique) {
        throw newRxError('SC14', {
          value,
          schema: jsonSchema
        });
      }
      if (jsonSchema.encrypted && jsonSchema.encrypted.includes(key)) {
        throw newRxError('SC15', {
          value,
          schema: jsonSchema
        });
      }
      if (value.type !== 'string') {
        throw newRxError('SC16', {
          value,
          schema: jsonSchema
        });
      }
    }

    // check if RxDocument-property
    if (rxDocumentProperties().includes(key)) {
      throw newRxError('SC17', {
        key,
        schema: jsonSchema
      });
    }
  });

  // check format of jsonSchema.indexes
  if (jsonSchema.indexes) {
    // should be an array
    if (!isMaybeReadonlyArray(jsonSchema.indexes)) {
      throw newRxError('SC18', {
        indexes: jsonSchema.indexes,
        schema: jsonSchema
      });
    }
    jsonSchema.indexes.forEach(index => {
      // should contain strings or array of strings
      if (!(typeof index === 'string' || Array.isArray(index))) {
        throw newRxError('SC19', {
          index,
          schema: jsonSchema
        });
      }
      // if is a compound index it must contain strings
      if (Array.isArray(index)) {
        for (var i = 0; i < index.length; i += 1) {
          if (typeof index[i] !== 'string') {
            throw newRxError('SC20', {
              index,
              schema: jsonSchema
            });
          }
        }
      }

      /**
       * To be able to craft custom indexable string with compound fields,
       * we need to know the maximum fieldlength of the fields values
       * when they are transformed to strings.
       * Therefore we need to enforce some properties inside of the schema.
       */
      var indexAsArray = isMaybeReadonlyArray(index) ? index : [index];
      indexAsArray.forEach(fieldName => {
        var schemaPart = getSchemaByObjectPath(jsonSchema, fieldName);
        var type = schemaPart.type;
        switch (type) {
          case 'string':
            var maxLength = schemaPart.maxLength;
            if (!maxLength) {
              throw newRxError('SC34', {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          case 'number':
          case 'integer':
            var multipleOf = schemaPart.multipleOf;
            if (!multipleOf) {
              throw newRxError('SC35', {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            var maximum = schemaPart.maximum;
            var minimum = schemaPart.minimum;
            if (typeof maximum === 'undefined' || typeof minimum === 'undefined') {
              throw newRxError('SC37', {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            if (!isFinite(maximum) || !isFinite(minimum)) {
              throw newRxError('SC41', {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          case 'boolean':
            /**
             * If a boolean field is used as an index,
             * it must be required.
             */
            var parentPath = '';
            var lastPathPart = fieldName;
            if (fieldName.includes('.')) {
              var partParts = fieldName.split('.');
              lastPathPart = partParts.pop();
              parentPath = partParts.join('.');
            }
            var parentSchemaPart = parentPath === '' ? jsonSchema : getSchemaByObjectPath(jsonSchema, parentPath);
            if (!parentSchemaPart.required || !parentSchemaPart.required.includes(lastPathPart)) {
              throw newRxError('SC38', {
                index,
                field: fieldName,
                schema: jsonSchema
              });
            }
            break;
          default:
            throw newRxError('SC36', {
              fieldName,
              type: schemaPart.type,
              schema: jsonSchema
            });
        }
      });
    });
  }

  // remove backward-compatibility for index: true
  Object.keys(flattenObject(jsonSchema)).map(key => {
    // flattenObject returns only ending paths, we need all paths pointing to an object
    var split = key.split('.');
    split.pop(); // all but last
    return split.join('.');
  }).filter(key => key !== '').filter((elem, pos, arr) => arr.indexOf(elem) === pos) // unique
  .filter(key => {
    // check if this path defines an index
    var value = getProperty$1(jsonSchema, key);
    return value && !!value.index;
  }).forEach(key => {
    // replace inner properties
    key = key.replace('properties.', ''); // first
    key = key.replace(/\.properties\./g, '.'); // middle
    throw newRxError('SC26', {
      index: trimDots(key),
      schema: jsonSchema
    });
  });

  /* check types of the indexes */
  (jsonSchema.indexes || []).reduce((indexPaths, currentIndex) => {
    if (isMaybeReadonlyArray(currentIndex)) {
      appendToArray(indexPaths, currentIndex);
    } else {
      indexPaths.push(currentIndex);
    }
    return indexPaths;
  }, []).filter((elem, pos, arr) => arr.indexOf(elem) === pos) // from now on working only with unique indexes
  .map(indexPath => {
    var realPath = getSchemaPropertyRealPath(indexPath); // real path in the collection schema
    var schemaObj = getProperty$1(jsonSchema, realPath); // get the schema of the indexed property
    if (!schemaObj || typeof schemaObj !== 'object') {
      throw newRxError('SC21', {
        index: indexPath,
        schema: jsonSchema
      });
    }
    return {
      indexPath,
      schemaObj
    };
  }).filter(index => index.schemaObj.type !== 'string' && index.schemaObj.type !== 'integer' && index.schemaObj.type !== 'number' && index.schemaObj.type !== 'boolean').forEach(index => {
    throw newRxError('SC22', {
      key: index.indexPath,
      type: index.schemaObj.type,
      schema: jsonSchema
    });
  });

  /**
   * TODO
   * in 9.0.0 we changed the way encrypted fields are defined
   * This check ensures people do not oversee the breaking change
   * Remove this check in the future
   */
  Object.keys(flattenObject(jsonSchema)).map(key => {
    // flattenObject returns only ending paths, we need all paths pointing to an object
    var split = key.split('.');
    split.pop(); // all but last
    return split.join('.');
  }).filter(key => key !== '' && key !== 'attachments').filter((elem, pos, arr) => arr.indexOf(elem) === pos) // unique
  .filter(key => {
    // check if this path defines an encrypted field
    var value = getProperty$1(jsonSchema, key);
    return value && !!value.encrypted;
  }).forEach(key => {
    // replace inner properties
    key = key.replace('properties.', ''); // first
    key = key.replace(/\.properties\./g, '.'); // middle
    throw newRxError('SC27', {
      index: trimDots(key),
      schema: jsonSchema
    });
  });

  /* ensure encrypted fields exist in the schema */
  if (jsonSchema.encrypted) {
    jsonSchema.encrypted.forEach(propPath => {
      // real path in the collection schema
      var realPath = getSchemaPropertyRealPath(propPath);
      // get the schema of the indexed property
      var schemaObj = getProperty$1(jsonSchema, realPath);
      if (!schemaObj || typeof schemaObj !== 'object') {
        throw newRxError('SC28', {
          field: propPath,
          schema: jsonSchema
        });
      }
    });
  }
}

/**
 * checks if the given static methods are allowed
 * @throws if not allowed
 */
function checkOrmMethods(statics) {
  if (!statics) {
    return;
  }
  Object.entries(statics).forEach(([k, v]) => {
    if (typeof k !== 'string') {
      throw newRxTypeError('COL14', {
        name: k
      });
    }
    if (k.startsWith('_')) {
      throw newRxTypeError('COL15', {
        name: k
      });
    }
    if (typeof v !== 'function') {
      throw newRxTypeError('COL16', {
        name: k,
        type: typeof k
      });
    }
    if (rxCollectionProperties().includes(k) || rxDocumentProperties().includes(k)) {
      throw newRxError('COL17', {
        name: k
      });
    }
  });
}
function checkOrmDocumentMethods(schema, methods) {
  var topLevelFields = Object.keys(schema.properties);
  if (!methods) {
    return;
  }
  Object.keys(methods).filter(funName => topLevelFields.includes(funName)).forEach(funName => {
    throw newRxError('COL18', {
      funName
    });
  });
}

/**
 * checks if the migrationStrategies are ok, throws if not
 * @throws {Error|TypeError} if not ok
 */
function checkMigrationStrategies(schema, migrationStrategies) {
  // migrationStrategies must be object not array
  if (typeof migrationStrategies !== 'object' || Array.isArray(migrationStrategies)) {
    throw newRxTypeError('COL11', {
      schema
    });
  }
  var previousVersions = getPreviousVersions(schema);

  // for every previousVersion there must be strategy
  if (previousVersions.length !== Object.keys(migrationStrategies).length) {
    throw newRxError('COL12', {
      have: Object.keys(migrationStrategies),
      should: previousVersions
    });
  }

  // every strategy must have number as property and be a function
  previousVersions.map(vNr => ({
    v: vNr,
    s: migrationStrategies[vNr + 1]
  })).filter(strategy => typeof strategy.s !== 'function').forEach(strategy => {
    throw newRxTypeError('COL13', {
      version: strategy.v,
      type: typeof strategy,
      schema
    });
  });
  return true;
}

/**
 * if the name of a collection
 * clashes with a property of RxDatabase,
 * we get problems so this function prohibits this
 */
function ensureCollectionNameValid(args) {
  if (rxDatabaseProperties().includes(args.name)) {
    throw newRxError('DB5', {
      name: args.name
    });
  }
  validateDatabaseName(args.name);
}
function ensureDatabaseNameIsValid(args) {
  validateDatabaseName(args.name);
  if (args.name.includes('$')) {
    throw newRxError('DB13', {
      name: args.name
    });
  }

  /**
   * The server-plugin has problems when a path with and ending slash is given
   * So we do not allow this.
   * @link https://github.com/pubkey/rxdb/issues/2251
   */
  if (isFolderPath(args.name)) {
    if (args.name.endsWith('/') || args.name.endsWith('\\')) {
      throw newRxError('DB11', {
        name: args.name
      });
    }
  }
}
var validCouchDBStringRegexStr = '^[a-z][_$a-z0-9\\-]*$';
var validCouchDBStringRegex = new RegExp(validCouchDBStringRegexStr);

/**
 * Validates that a given string is ok to be used with couchdb-collection-names.
 * We only allow these strings as database- or collection names because it ensures
 * that you later do not get in trouble when you want to use the database together witch couchdb.
 *
 * @link https://docs.couchdb.org/en/stable/api/database/common.html
 * @link https://neighbourhood.ie/blog/2020/10/13/everything-you-need-to-know-about-couchdb-database-names/
 * @throws  {RxError}
 */
function validateDatabaseName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw newRxTypeError('UT1', {
      name
    });
  }

  // do not check, if foldername is given
  if (isFolderPath(name)) {
    return true;
  }
  if (!name.match(validCouchDBStringRegex) &&
  /**
   * The string ':memory:' is used in the SQLite RxStorage
   * to persist data into a memory state. Often used in tests.
   */
  name !== ':memory:') {
    throw newRxError('UT2', {
      regex: validCouchDBStringRegexStr,
      givenName: name
    });
  }
  return true;
}

/**
 * accidentally passing a non-valid object into the query params
 * is very hard to debug especially when queries are observed
 * This is why we do some checks here in dev-mode
 */
function checkQuery(args) {
  var isPlainObject = Object.prototype.toString.call(args.queryObj) === '[object Object]';
  if (!isPlainObject) {
    throw newRxTypeError('QU11', {
      op: args.op,
      collection: args.collection.name,
      queryObj: args.queryObj
    });
  }
  var validKeys = ['selector', 'limit', 'skip', 'sort', 'index'];
  Object.keys(args.queryObj).forEach(key => {
    if (!validKeys.includes(key)) {
      throw newRxTypeError('QU11', {
        op: args.op,
        collection: args.collection.name,
        queryObj: args.queryObj,
        key,
        args: {
          validKeys
        }
      });
    }
  });

  // do not allow skip or limit for count queries
  if (args.op === 'count' && (args.queryObj.limit || args.queryObj.skip)) {
    throw newRxError('QU15', {
      collection: args.collection.name,
      query: args.queryObj
    });
  }
  ensureObjectDoesNotContainRegExp(args.queryObj);
}
function checkMangoQuery(args) {
  var schema = args.rxQuery.collection.schema.jsonSchema;

  /**
   * Ensure that all top level fields are included in the schema.
   * TODO this check can be augmented to also check sub-fields.
   */
  var massagedSelector = args.mangoQuery.selector;
  var schemaTopLevelFields = Object.keys(schema.properties);
  Object.keys(massagedSelector)
  // do not check operators
  .filter(fieldOrOperator => !fieldOrOperator.startsWith('$'))
  // skip this check on non-top-level fields
  .filter(field => !field.includes('.')).forEach(field => {
    if (!schemaTopLevelFields.includes(field)) {
      throw newRxError('QU13', {
        schema,
        field,
        query: args.mangoQuery
      });
    }
  });

  /**
   * ensure if custom index is set,
   * it is also defined in the schema
   */
  var schemaIndexes = schema.indexes ? schema.indexes : [];
  var index = args.mangoQuery.index;
  if (index) {
    var isInSchema = schemaIndexes.find(schemaIndex => deepEqual(schemaIndex, index));
    if (!isInSchema) {
      throw newRxError('QU12', {
        collection: args.rxQuery.collection.name,
        query: args.mangoQuery,
        schema
      });
    }
  }

  /**
   * Ensure that a count() query can only be used
   * with selectors that are fully satisfied by the used index.
   */
  if (args.rxQuery.op === 'count') {
    if (!areSelectorsSatisfiedByIndex(args.rxQuery.collection.schema.jsonSchema, args.mangoQuery) && !args.rxQuery.collection.database.allowSlowCount) {
      throw newRxError('QU14', {
        collection: args.rxQuery.collection,
        query: args.mangoQuery
      });
    }
  }

  /**
   * Ensure that sort only runs on known fields
   * TODO also check nested fields
   */
  if (args.mangoQuery.sort) {
    args.mangoQuery.sort.map(sortPart => Object.keys(sortPart)[0]).filter(field => !field.includes('.')).forEach(field => {
      if (!schemaTopLevelFields.includes(field)) {
        throw newRxError('QU13', {
          schema,
          field,
          query: args.mangoQuery
        });
      }
    });
  }

  // Do not allow RexExp instances
  ensureObjectDoesNotContainRegExp(args.mangoQuery);
}
function areSelectorsSatisfiedByIndex(schema, query) {
  var preparedQuery = prepareQuery(schema, query);
  return preparedQuery.queryPlan.selectorSatisfiedByIndex;
}

/**
 * Ensures that the selector does not contain any RegExp instance.
 * @recursive
 */
function ensureObjectDoesNotContainRegExp(selector) {
  if (typeof selector !== 'object' || selector === null) {
    return;
  }
  var keys = Object.keys(selector);
  keys.forEach(key => {
    var value = selector[key];
    if (value instanceof RegExp) {
      throw newRxError('QU16', {
        field: key,
        query: selector
      });
    } else if (Array.isArray(value)) {
      value.forEach(item => ensureObjectDoesNotContainRegExp(item));
    } else {
      ensureObjectDoesNotContainRegExp(value);
    }
  });
}

function ensurePrimaryKeyValid(primaryKey, docData) {
  if (!primaryKey) {
    throw newRxError('DOC20', {
      primaryKey,
      document: docData
    });
  }

  /**
   * This is required so that we can left-pad
   * the primaryKey and we are still able to de-left-pad
   * it to get again the original key.
   */
  if (primaryKey !== primaryKey.trim()) {
    throw newRxError('DOC21', {
      primaryKey,
      document: docData
    });
  }
  if (primaryKey.includes('\r') || primaryKey.includes('\n')) {
    throw newRxError('DOC22', {
      primaryKey,
      document: docData
    });
  }
  if (primaryKey.includes('"')) {
    throw newRxError('DOC23', {
      primaryKey,
      document: docData
    });
  }
}

/**
 * Deeply checks if the object contains an
 * instance of the JavaScript Date class.
 * @recursive
 */
function containsDateInstance(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] instanceof Date) {
        return true;
      }
      if (typeof obj[key] === 'object' && containsDateInstance(obj[key])) {
        return true;
      }
    }
  }
  return false;
}
function checkWriteRows(storageInstance, rows) {
  var primaryPath = getPrimaryFieldOfPrimaryKey(storageInstance.schema.primaryKey);
  var _loop = function (writeRow) {
    // ensure that the primary key has not been changed
    writeRow.document = fillPrimaryKey(primaryPath, storageInstance.schema, writeRow.document);

    /**
     * Ensure that _meta fields have been merged
     * and not replaced.
     * This is important so that when one plugin A
     * sets a _meta field and another plugin B does a write
     * to the document, it must be ensured that the
     * field of plugin A was not removed.
     */
    if (writeRow.previous) {
      Object.keys(writeRow.previous._meta).forEach(metaFieldName => {
        if (!Object.prototype.hasOwnProperty.call(writeRow.document._meta, metaFieldName)) {
          throw newRxError('SNH', {
            dataBefore: writeRow.previous,
            dataAfter: writeRow.document,
            args: {
              metaFieldName
            }
          });
        }
      });
    }

    /**
     * Ensure it can be structured cloned
     */
    try {
      /**
       * Notice that structuredClone() is not available
       * in ReactNative, so we test for JSON.stringify() instead
       * @link https://github.com/pubkey/rxdb/issues/5046#issuecomment-1827374498
       */
      if (typeof structuredClone === 'function') {
        structuredClone(writeRow);
      } else {
        JSON.parse(JSON.stringify(writeRow));
      }
    } catch (err) {
      throw newRxError('DOC24', {
        collection: storageInstance.collectionName,
        document: writeRow.document
      });
    }

    /**
     * Ensure it does not contain a Date() object
     */
    if (containsDateInstance(writeRow.document)) {
      throw newRxError('DOC24', {
        collection: storageInstance.collectionName,
        document: writeRow.document
      });
    }
  };
  for (var writeRow of rows) {
    _loop(writeRow);
  }
}

/**
 * Deep freezes and object when in dev-mode.
 * Deep-Freezing has the same performance as deep-cloning, so we only do that in dev-mode.
 * Also we can ensure the readonly state via typescript
 * @link https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 */
function deepFreezeWhenDevMode(obj) {
  // direct return if not suitable for deepFreeze()
  if (!obj || typeof obj === 'string' || typeof obj === 'number') {
    return obj;
  }
  return deepFreeze(obj);
}
var DEV_MODE_PLUGIN_NAME = 'dev-mode';
var RxDBDevModePlugin = {
  name: DEV_MODE_PLUGIN_NAME,
  rxdb: true,
  init: () => {
    {
      console.warn(['-------------- RxDB dev-mode warning -------------------------------', 'you are seeing this because you use the RxDB dev-mode plugin https://rxdb.info/dev-mode.html?console=dev-mode ', 'This is great in development mode, because it will run many checks to ensure', 'that you use RxDB correct. If you see this in production mode,', 'you did something wrong because the dev-mode plugin will decrease the performance.', '', '🤗 Hint: To get the most out of RxDB, check out the Premium Plugins', 'to get access to faster storages and more professional features: https://rxdb.info/premium?console=dev-mode ', '', 'You can disable this warning by calling disableWarnings() from the dev-mode plugin.',
      // '',
      // 'Also take part in the RxDB User Survey: https://rxdb.info/survey.html',
      '---------------------------------------------------------------------'].join('\n'));
    }
  },
  overwritable: {
    isDevMode() {
      return true;
    },
    deepFreezeWhenDevMode,
    tunnelErrorMessage(code) {
      if (!ERROR_MESSAGES[code]) {
        console.error('RxDB: Error-Code not known: ' + code);
        throw new Error('Error-Code ' + code + ' not known, contact the maintainer');
      }
      return ERROR_MESSAGES[code];
    }
  },
  hooks: {
    preCreateRxSchema: {
      after: checkSchema
    },
    preCreateRxDatabase: {
      after: function (args) {
        ensureDatabaseNameIsValid(args);
      }
    },
    preCreateRxCollection: {
      after: function (args) {
        ensureCollectionNameValid(args);
        checkOrmDocumentMethods(args.schema, args.methods);
        if (args.name.charAt(0) === '_') {
          throw newRxError('DB2', {
            name: args.name
          });
        }
        if (!args.schema) {
          throw newRxError('DB4', {
            name: args.name,
            args
          });
        }
      }
    },
    createRxDocument: {
      before: function (doc) {
        ensurePrimaryKeyValid(doc.primary, doc.toJSON(true));
      }
    },
    preCreateRxQuery: {
      after: function (args) {
        checkQuery(args);
      }
    },
    prePrepareQuery: {
      after: args => {
        checkMangoQuery(args);
      }
    },
    preStorageWrite: {
      before: args => {
        checkWriteRows(args.storageInstance, args.rows);
      }
    },
    createRxCollection: {
      after: args => {
        // check ORM-methods
        checkOrmMethods(args.creator.statics);
        checkOrmMethods(args.creator.methods);
        checkOrmMethods(args.creator.attachments);

        // check migration strategies
        if (args.creator.schema && args.creator.migrationStrategies) {
          checkMigrationStrategies(args.creator.schema, args.creator.migrationStrategies);
        }
      }
    }
  }
};

var dexie = {exports: {}};

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 4.0.7, Sun May 26 2024
 *
 * https://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */

(function (module, exports) {
	(function (global, factory) {
	    module.exports = factory() ;
	})(commonjsGlobal, (function () {
	    /*! *****************************************************************************
	    Copyright (c) Microsoft Corporation.
	    Permission to use, copy, modify, and/or distribute this software for any
	    purpose with or without fee is hereby granted.
	    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	    PERFORMANCE OF THIS SOFTWARE.
	    ***************************************************************************** */
	    var extendStatics = function(d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    function __extends(d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    }
	    var __assign = function() {
	        __assign = Object.assign || function __assign(t) {
	            for (var s, i = 1, n = arguments.length; i < n; i++) {
	                s = arguments[i];
	                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	            }
	            return t;
	        };
	        return __assign.apply(this, arguments);
	    };
	    function __spreadArray(to, from, pack) {
	        for (var i = 0, l = from.length, ar; i < l; i++) {
	            if (ar || !(i in from)) {
	                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	                ar[i] = from[i];
	            }
	        }
	        return to.concat(ar || Array.prototype.slice.call(from));
	    }

	    var _global = typeof globalThis !== 'undefined' ? globalThis :
	        typeof self !== 'undefined' ? self :
	            typeof window !== 'undefined' ? window :
	                commonjsGlobal;

	    var keys = Object.keys;
	    var isArray = Array.isArray;
	    if (typeof Promise !== 'undefined' && !_global.Promise) {
	        _global.Promise = Promise;
	    }
	    function extend(obj, extension) {
	        if (typeof extension !== 'object')
	            return obj;
	        keys(extension).forEach(function (key) {
	            obj[key] = extension[key];
	        });
	        return obj;
	    }
	    var getProto = Object.getPrototypeOf;
	    var _hasOwn = {}.hasOwnProperty;
	    function hasOwn(obj, prop) {
	        return _hasOwn.call(obj, prop);
	    }
	    function props(proto, extension) {
	        if (typeof extension === 'function')
	            extension = extension(getProto(proto));
	        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function (key) {
	            setProp(proto, key, extension[key]);
	        });
	    }
	    var defineProperty = Object.defineProperty;
	    function setProp(obj, prop, functionOrGetSet, options) {
	        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
	            { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
	            { value: functionOrGetSet, configurable: true, writable: true }, options));
	    }
	    function derive(Child) {
	        return {
	            from: function (Parent) {
	                Child.prototype = Object.create(Parent.prototype);
	                setProp(Child.prototype, "constructor", Child);
	                return {
	                    extend: props.bind(null, Child.prototype)
	                };
	            }
	        };
	    }
	    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	    function getPropertyDescriptor(obj, prop) {
	        var pd = getOwnPropertyDescriptor(obj, prop);
	        var proto;
	        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
	    }
	    var _slice = [].slice;
	    function slice(args, start, end) {
	        return _slice.call(args, start, end);
	    }
	    function override(origFunc, overridedFactory) {
	        return overridedFactory(origFunc);
	    }
	    function assert(b) {
	        if (!b)
	            throw new Error("Assertion Failed");
	    }
	    function asap$1(fn) {
	        if (_global.setImmediate)
	            setImmediate(fn);
	        else
	            setTimeout(fn, 0);
	    }
	    function arrayToObject(array, extractor) {
	        return array.reduce(function (result, item, i) {
	            var nameAndValue = extractor(item, i);
	            if (nameAndValue)
	                result[nameAndValue[0]] = nameAndValue[1];
	            return result;
	        }, {});
	    }
	    function getByKeyPath(obj, keyPath) {
	        if (typeof keyPath === 'string' && hasOwn(obj, keyPath))
	            return obj[keyPath];
	        if (!keyPath)
	            return obj;
	        if (typeof keyPath !== 'string') {
	            var rv = [];
	            for (var i = 0, l = keyPath.length; i < l; ++i) {
	                var val = getByKeyPath(obj, keyPath[i]);
	                rv.push(val);
	            }
	            return rv;
	        }
	        var period = keyPath.indexOf('.');
	        if (period !== -1) {
	            var innerObj = obj[keyPath.substr(0, period)];
	            return innerObj == null ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
	        }
	        return undefined;
	    }
	    function setByKeyPath(obj, keyPath, value) {
	        if (!obj || keyPath === undefined)
	            return;
	        if ('isFrozen' in Object && Object.isFrozen(obj))
	            return;
	        if (typeof keyPath !== 'string' && 'length' in keyPath) {
	            assert(typeof value !== 'string' && 'length' in value);
	            for (var i = 0, l = keyPath.length; i < l; ++i) {
	                setByKeyPath(obj, keyPath[i], value[i]);
	            }
	        }
	        else {
	            var period = keyPath.indexOf('.');
	            if (period !== -1) {
	                var currentKeyPath = keyPath.substr(0, period);
	                var remainingKeyPath = keyPath.substr(period + 1);
	                if (remainingKeyPath === "")
	                    if (value === undefined) {
	                        if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
	                            obj.splice(currentKeyPath, 1);
	                        else
	                            delete obj[currentKeyPath];
	                    }
	                    else
	                        obj[currentKeyPath] = value;
	                else {
	                    var innerObj = obj[currentKeyPath];
	                    if (!innerObj || !hasOwn(obj, currentKeyPath))
	                        innerObj = (obj[currentKeyPath] = {});
	                    setByKeyPath(innerObj, remainingKeyPath, value);
	                }
	            }
	            else {
	                if (value === undefined) {
	                    if (isArray(obj) && !isNaN(parseInt(keyPath)))
	                        obj.splice(keyPath, 1);
	                    else
	                        delete obj[keyPath];
	                }
	                else
	                    obj[keyPath] = value;
	            }
	        }
	    }
	    function delByKeyPath(obj, keyPath) {
	        if (typeof keyPath === 'string')
	            setByKeyPath(obj, keyPath, undefined);
	        else if ('length' in keyPath)
	            [].map.call(keyPath, function (kp) {
	                setByKeyPath(obj, kp, undefined);
	            });
	    }
	    function shallowClone(obj) {
	        var rv = {};
	        for (var m in obj) {
	            if (hasOwn(obj, m))
	                rv[m] = obj[m];
	        }
	        return rv;
	    }
	    var concat = [].concat;
	    function flatten(a) {
	        return concat.apply([], a);
	    }
	    var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey"
	        .split(',').concat(flatten([8, 16, 32, 64].map(function (num) { return ["Int", "Uint", "Float"].map(function (t) { return t + num + "Array"; }); }))).filter(function (t) { return _global[t]; });
	    var intrinsicTypes = new Set(intrinsicTypeNames.map(function (t) { return _global[t]; }));
	    function cloneSimpleObjectTree(o) {
	        var rv = {};
	        for (var k in o)
	            if (hasOwn(o, k)) {
	                var v = o[k];
	                rv[k] = !v || typeof v !== 'object' || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
	            }
	        return rv;
	    }
	    function objectIsEmpty(o) {
	        for (var k in o)
	            if (hasOwn(o, k))
	                return false;
	        return true;
	    }
	    var circularRefs = null;
	    function deepClone(any) {
	        circularRefs = new WeakMap();
	        var rv = innerDeepClone(any);
	        circularRefs = null;
	        return rv;
	    }
	    function innerDeepClone(x) {
	        if (!x || typeof x !== 'object')
	            return x;
	        var rv = circularRefs.get(x);
	        if (rv)
	            return rv;
	        if (isArray(x)) {
	            rv = [];
	            circularRefs.set(x, rv);
	            for (var i = 0, l = x.length; i < l; ++i) {
	                rv.push(innerDeepClone(x[i]));
	            }
	        }
	        else if (intrinsicTypes.has(x.constructor)) {
	            rv = x;
	        }
	        else {
	            var proto = getProto(x);
	            rv = proto === Object.prototype ? {} : Object.create(proto);
	            circularRefs.set(x, rv);
	            for (var prop in x) {
	                if (hasOwn(x, prop)) {
	                    rv[prop] = innerDeepClone(x[prop]);
	                }
	            }
	        }
	        return rv;
	    }
	    var toString = {}.toString;
	    function toStringTag(o) {
	        return toString.call(o).slice(8, -1);
	    }
	    var iteratorSymbol = typeof Symbol !== 'undefined' ?
	        Symbol.iterator :
	        '@@iterator';
	    var getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x) {
	        var i;
	        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
	    } : function () { return null; };
	    function delArrayItem(a, x) {
	        var i = a.indexOf(x);
	        if (i >= 0)
	            a.splice(i, 1);
	        return i >= 0;
	    }
	    var NO_CHAR_ARRAY = {};
	    function getArrayOf(arrayLike) {
	        var i, a, x, it;
	        if (arguments.length === 1) {
	            if (isArray(arrayLike))
	                return arrayLike.slice();
	            if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
	                return [arrayLike];
	            if ((it = getIteratorOf(arrayLike))) {
	                a = [];
	                while ((x = it.next()), !x.done)
	                    a.push(x.value);
	                return a;
	            }
	            if (arrayLike == null)
	                return [arrayLike];
	            i = arrayLike.length;
	            if (typeof i === 'number') {
	                a = new Array(i);
	                while (i--)
	                    a[i] = arrayLike[i];
	                return a;
	            }
	            return [arrayLike];
	        }
	        i = arguments.length;
	        a = new Array(i);
	        while (i--)
	            a[i] = arguments[i];
	        return a;
	    }
	    var isAsyncFunction = typeof Symbol !== 'undefined'
	        ? function (fn) { return fn[Symbol.toStringTag] === 'AsyncFunction'; }
	        : function () { return false; };

	    var dexieErrorNames = [
	        'Modify',
	        'Bulk',
	        'OpenFailed',
	        'VersionChange',
	        'Schema',
	        'Upgrade',
	        'InvalidTable',
	        'MissingAPI',
	        'NoSuchDatabase',
	        'InvalidArgument',
	        'SubTransaction',
	        'Unsupported',
	        'Internal',
	        'DatabaseClosed',
	        'PrematureCommit',
	        'ForeignAwait'
	    ];
	    var idbDomErrorNames = [
	        'Unknown',
	        'Constraint',
	        'Data',
	        'TransactionInactive',
	        'ReadOnly',
	        'Version',
	        'NotFound',
	        'InvalidState',
	        'InvalidAccess',
	        'Abort',
	        'Timeout',
	        'QuotaExceeded',
	        'Syntax',
	        'DataClone'
	    ];
	    var errorList = dexieErrorNames.concat(idbDomErrorNames);
	    var defaultTexts = {
	        VersionChanged: "Database version changed by other database connection",
	        DatabaseClosed: "Database has been closed",
	        Abort: "Transaction aborted",
	        TransactionInactive: "Transaction has already completed or failed",
	        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
	    };
	    function DexieError(name, msg) {
	        this.name = name;
	        this.message = msg;
	    }
	    derive(DexieError).from(Error).extend({
	        toString: function () { return this.name + ": " + this.message; }
	    });
	    function getMultiErrorMessage(msg, failures) {
	        return msg + ". Errors: " + Object.keys(failures)
	            .map(function (key) { return failures[key].toString(); })
	            .filter(function (v, i, s) { return s.indexOf(v) === i; })
	            .join('\n');
	    }
	    function ModifyError(msg, failures, successCount, failedKeys) {
	        this.failures = failures;
	        this.failedKeys = failedKeys;
	        this.successCount = successCount;
	        this.message = getMultiErrorMessage(msg, failures);
	    }
	    derive(ModifyError).from(DexieError);
	    function BulkError(msg, failures) {
	        this.name = "BulkError";
	        this.failures = Object.keys(failures).map(function (pos) { return failures[pos]; });
	        this.failuresByPos = failures;
	        this.message = getMultiErrorMessage(msg, this.failures);
	    }
	    derive(BulkError).from(DexieError);
	    var errnames = errorList.reduce(function (obj, name) { return (obj[name] = name + "Error", obj); }, {});
	    var BaseException = DexieError;
	    var exceptions = errorList.reduce(function (obj, name) {
	        var fullName = name + "Error";
	        function DexieError(msgOrInner, inner) {
	            this.name = fullName;
	            if (!msgOrInner) {
	                this.message = defaultTexts[name] || fullName;
	                this.inner = null;
	            }
	            else if (typeof msgOrInner === 'string') {
	                this.message = "".concat(msgOrInner).concat(!inner ? '' : '\n ' + inner);
	                this.inner = inner || null;
	            }
	            else if (typeof msgOrInner === 'object') {
	                this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
	                this.inner = msgOrInner;
	            }
	        }
	        derive(DexieError).from(BaseException);
	        obj[name] = DexieError;
	        return obj;
	    }, {});
	    exceptions.Syntax = SyntaxError;
	    exceptions.Type = TypeError;
	    exceptions.Range = RangeError;
	    var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
	        obj[name + "Error"] = exceptions[name];
	        return obj;
	    }, {});
	    function mapError(domError, message) {
	        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
	            return domError;
	        var rv = new exceptionMap[domError.name](message || domError.message, domError);
	        if ("stack" in domError) {
	            setProp(rv, "stack", { get: function () {
	                    return this.inner.stack;
	                } });
	        }
	        return rv;
	    }
	    var fullNameExceptions = errorList.reduce(function (obj, name) {
	        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
	            obj[name + "Error"] = exceptions[name];
	        return obj;
	    }, {});
	    fullNameExceptions.ModifyError = ModifyError;
	    fullNameExceptions.DexieError = DexieError;
	    fullNameExceptions.BulkError = BulkError;

	    function nop() { }
	    function mirror(val) { return val; }
	    function pureFunctionChain(f1, f2) {
	        if (f1 == null || f1 === mirror)
	            return f2;
	        return function (val) {
	            return f2(f1(val));
	        };
	    }
	    function callBoth(on1, on2) {
	        return function () {
	            on1.apply(this, arguments);
	            on2.apply(this, arguments);
	        };
	    }
	    function hookCreatingChain(f1, f2) {
	        if (f1 === nop)
	            return f2;
	        return function () {
	            var res = f1.apply(this, arguments);
	            if (res !== undefined)
	                arguments[0] = res;
	            var onsuccess = this.onsuccess,
	            onerror = this.onerror;
	            this.onsuccess = null;
	            this.onerror = null;
	            var res2 = f2.apply(this, arguments);
	            if (onsuccess)
	                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	            if (onerror)
	                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	            return res2 !== undefined ? res2 : res;
	        };
	    }
	    function hookDeletingChain(f1, f2) {
	        if (f1 === nop)
	            return f2;
	        return function () {
	            f1.apply(this, arguments);
	            var onsuccess = this.onsuccess,
	            onerror = this.onerror;
	            this.onsuccess = this.onerror = null;
	            f2.apply(this, arguments);
	            if (onsuccess)
	                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	            if (onerror)
	                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	        };
	    }
	    function hookUpdatingChain(f1, f2) {
	        if (f1 === nop)
	            return f2;
	        return function (modifications) {
	            var res = f1.apply(this, arguments);
	            extend(modifications, res);
	            var onsuccess = this.onsuccess,
	            onerror = this.onerror;
	            this.onsuccess = null;
	            this.onerror = null;
	            var res2 = f2.apply(this, arguments);
	            if (onsuccess)
	                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	            if (onerror)
	                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	            return res === undefined ?
	                (res2 === undefined ? undefined : res2) :
	                (extend(res, res2));
	        };
	    }
	    function reverseStoppableEventChain(f1, f2) {
	        if (f1 === nop)
	            return f2;
	        return function () {
	            if (f2.apply(this, arguments) === false)
	                return false;
	            return f1.apply(this, arguments);
	        };
	    }
	    function promisableChain(f1, f2) {
	        if (f1 === nop)
	            return f2;
	        return function () {
	            var res = f1.apply(this, arguments);
	            if (res && typeof res.then === 'function') {
	                var thiz = this, i = arguments.length, args = new Array(i);
	                while (i--)
	                    args[i] = arguments[i];
	                return res.then(function () {
	                    return f2.apply(thiz, args);
	                });
	            }
	            return f2.apply(this, arguments);
	        };
	    }

	    var debug = typeof location !== 'undefined' &&
	        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
	    function setDebug(value, filter) {
	        debug = value;
	    }

	    var INTERNAL = {};
	    var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === 'undefined' ?
	        [] :
	        (function () {
	            var globalP = Promise.resolve();
	            if (typeof crypto === 'undefined' || !crypto.subtle)
	                return [globalP, getProto(globalP), globalP];
	            var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
	            return [
	                nativeP,
	                getProto(nativeP),
	                globalP
	            ];
	        })(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
	    var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
	    var patchGlobalPromise = !!resolvedGlobalPromise;
	    function schedulePhysicalTick() {
	        queueMicrotask(physicalTick);
	    }
	    var asap = function (callback, args) {
	        microtickQueue.push([callback, args]);
	        if (needsNewPhysicalTick) {
	            schedulePhysicalTick();
	            needsNewPhysicalTick = false;
	        }
	    };
	    var isOutsideMicroTick = true,
	    needsNewPhysicalTick = true,
	    unhandledErrors = [],
	    rejectingErrors = [],
	    rejectionMapper = mirror;
	    var globalPSD = {
	        id: 'global',
	        global: true,
	        ref: 0,
	        unhandleds: [],
	        onunhandled: nop,
	        pgp: false,
	        env: {},
	        finalize: nop
	    };
	    var PSD = globalPSD;
	    var microtickQueue = [];
	    var numScheduledCalls = 0;
	    var tickFinalizers = [];
	    function DexiePromise(fn) {
	        if (typeof this !== 'object')
	            throw new TypeError('Promises must be constructed via new');
	        this._listeners = [];
	        this._lib = false;
	        var psd = (this._PSD = PSD);
	        if (typeof fn !== 'function') {
	            if (fn !== INTERNAL)
	                throw new TypeError('Not a function');
	            this._state = arguments[1];
	            this._value = arguments[2];
	            if (this._state === false)
	                handleRejection(this, this._value);
	            return;
	        }
	        this._state = null;
	        this._value = null;
	        ++psd.ref;
	        executePromiseTask(this, fn);
	    }
	    var thenProp = {
	        get: function () {
	            var psd = PSD, microTaskId = totalEchoes;
	            function then(onFulfilled, onRejected) {
	                var _this = this;
	                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
	                var cleanup = possibleAwait && !decrementExpectedAwaits();
	                var rv = new DexiePromise(function (resolve, reject) {
	                    propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
	                });
	                if (this._consoleTask)
	                    rv._consoleTask = this._consoleTask;
	                return rv;
	            }
	            then.prototype = INTERNAL;
	            return then;
	        },
	        set: function (value) {
	            setProp(this, 'then', value && value.prototype === INTERNAL ?
	                thenProp :
	                {
	                    get: function () {
	                        return value;
	                    },
	                    set: thenProp.set
	                });
	        }
	    };
	    props(DexiePromise.prototype, {
	        then: thenProp,
	        _then: function (onFulfilled, onRejected) {
	            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
	        },
	        catch: function (onRejected) {
	            if (arguments.length === 1)
	                return this.then(null, onRejected);
	            var type = arguments[0], handler = arguments[1];
	            return typeof type === 'function' ? this.then(null, function (err) {
	                return err instanceof type ? handler(err) : PromiseReject(err);
	            })
	                : this.then(null, function (err) {
	                    return err && err.name === type ? handler(err) : PromiseReject(err);
	                });
	        },
	        finally: function (onFinally) {
	            return this.then(function (value) {
	                return DexiePromise.resolve(onFinally()).then(function () { return value; });
	            }, function (err) {
	                return DexiePromise.resolve(onFinally()).then(function () { return PromiseReject(err); });
	            });
	        },
	        timeout: function (ms, msg) {
	            var _this = this;
	            return ms < Infinity ?
	                new DexiePromise(function (resolve, reject) {
	                    var handle = setTimeout(function () { return reject(new exceptions.Timeout(msg)); }, ms);
	                    _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
	                }) : this;
	        }
	    });
	    if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
	        setProp(DexiePromise.prototype, Symbol.toStringTag, 'Dexie.Promise');
	    globalPSD.env = snapShot();
	    function Listener(onFulfilled, onRejected, resolve, reject, zone) {
	        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	        this.resolve = resolve;
	        this.reject = reject;
	        this.psd = zone;
	    }
	    props(DexiePromise, {
	        all: function () {
	            var values = getArrayOf.apply(null, arguments)
	                .map(onPossibleParallellAsync);
	            return new DexiePromise(function (resolve, reject) {
	                if (values.length === 0)
	                    resolve([]);
	                var remaining = values.length;
	                values.forEach(function (a, i) { return DexiePromise.resolve(a).then(function (x) {
	                    values[i] = x;
	                    if (!--remaining)
	                        resolve(values);
	                }, reject); });
	            });
	        },
	        resolve: function (value) {
	            if (value instanceof DexiePromise)
	                return value;
	            if (value && typeof value.then === 'function')
	                return new DexiePromise(function (resolve, reject) {
	                    value.then(resolve, reject);
	                });
	            var rv = new DexiePromise(INTERNAL, true, value);
	            return rv;
	        },
	        reject: PromiseReject,
	        race: function () {
	            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
	            return new DexiePromise(function (resolve, reject) {
	                values.map(function (value) { return DexiePromise.resolve(value).then(resolve, reject); });
	            });
	        },
	        PSD: {
	            get: function () { return PSD; },
	            set: function (value) { return PSD = value; }
	        },
	        totalEchoes: { get: function () { return totalEchoes; } },
	        newPSD: newScope,
	        usePSD: usePSD,
	        scheduler: {
	            get: function () { return asap; },
	            set: function (value) { asap = value; }
	        },
	        rejectionMapper: {
	            get: function () { return rejectionMapper; },
	            set: function (value) { rejectionMapper = value; }
	        },
	        follow: function (fn, zoneProps) {
	            return new DexiePromise(function (resolve, reject) {
	                return newScope(function (resolve, reject) {
	                    var psd = PSD;
	                    psd.unhandleds = [];
	                    psd.onunhandled = reject;
	                    psd.finalize = callBoth(function () {
	                        var _this = this;
	                        run_at_end_of_this_or_next_physical_tick(function () {
	                            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
	                        });
	                    }, psd.finalize);
	                    fn();
	                }, zoneProps, resolve, reject);
	            });
	        }
	    });
	    if (NativePromise) {
	        if (NativePromise.allSettled)
	            setProp(DexiePromise, "allSettled", function () {
	                var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
	                return new DexiePromise(function (resolve) {
	                    if (possiblePromises.length === 0)
	                        resolve([]);
	                    var remaining = possiblePromises.length;
	                    var results = new Array(remaining);
	                    possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return results[i] = { status: "fulfilled", value: value }; }, function (reason) { return results[i] = { status: "rejected", reason: reason }; })
	                        .then(function () { return --remaining || resolve(results); }); });
	                });
	            });
	        if (NativePromise.any && typeof AggregateError !== 'undefined')
	            setProp(DexiePromise, "any", function () {
	                var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
	                return new DexiePromise(function (resolve, reject) {
	                    if (possiblePromises.length === 0)
	                        reject(new AggregateError([]));
	                    var remaining = possiblePromises.length;
	                    var failures = new Array(remaining);
	                    possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return resolve(value); }, function (failure) {
	                        failures[i] = failure;
	                        if (!--remaining)
	                            reject(new AggregateError(failures));
	                    }); });
	                });
	            });
	    }
	    function executePromiseTask(promise, fn) {
	        try {
	            fn(function (value) {
	                if (promise._state !== null)
	                    return;
	                if (value === promise)
	                    throw new TypeError('A promise cannot be resolved with itself.');
	                var shouldExecuteTick = promise._lib && beginMicroTickScope();
	                if (value && typeof value.then === 'function') {
	                    executePromiseTask(promise, function (resolve, reject) {
	                        value instanceof DexiePromise ?
	                            value._then(resolve, reject) :
	                            value.then(resolve, reject);
	                    });
	                }
	                else {
	                    promise._state = true;
	                    promise._value = value;
	                    propagateAllListeners(promise);
	                }
	                if (shouldExecuteTick)
	                    endMicroTickScope();
	            }, handleRejection.bind(null, promise));
	        }
	        catch (ex) {
	            handleRejection(promise, ex);
	        }
	    }
	    function handleRejection(promise, reason) {
	        rejectingErrors.push(reason);
	        if (promise._state !== null)
	            return;
	        var shouldExecuteTick = promise._lib && beginMicroTickScope();
	        reason = rejectionMapper(reason);
	        promise._state = false;
	        promise._value = reason;
	        addPossiblyUnhandledError(promise);
	        propagateAllListeners(promise);
	        if (shouldExecuteTick)
	            endMicroTickScope();
	    }
	    function propagateAllListeners(promise) {
	        var listeners = promise._listeners;
	        promise._listeners = [];
	        for (var i = 0, len = listeners.length; i < len; ++i) {
	            propagateToListener(promise, listeners[i]);
	        }
	        var psd = promise._PSD;
	        --psd.ref || psd.finalize();
	        if (numScheduledCalls === 0) {
	            ++numScheduledCalls;
	            asap(function () {
	                if (--numScheduledCalls === 0)
	                    finalizePhysicalTick();
	            }, []);
	        }
	    }
	    function propagateToListener(promise, listener) {
	        if (promise._state === null) {
	            promise._listeners.push(listener);
	            return;
	        }
	        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
	        if (cb === null) {
	            return (promise._state ? listener.resolve : listener.reject)(promise._value);
	        }
	        ++listener.psd.ref;
	        ++numScheduledCalls;
	        asap(callListener, [cb, promise, listener]);
	    }
	    function callListener(cb, promise, listener) {
	        try {
	            var ret, value = promise._value;
	            if (!promise._state && rejectingErrors.length)
	                rejectingErrors = [];
	            ret = debug && promise._consoleTask ? promise._consoleTask.run(function () { return cb(value); }) : cb(value);
	            if (!promise._state && rejectingErrors.indexOf(value) === -1) {
	                markErrorAsHandled(promise);
	            }
	            listener.resolve(ret);
	        }
	        catch (e) {
	            listener.reject(e);
	        }
	        finally {
	            if (--numScheduledCalls === 0)
	                finalizePhysicalTick();
	            --listener.psd.ref || listener.psd.finalize();
	        }
	    }
	    function physicalTick() {
	        usePSD(globalPSD, function () {
	            beginMicroTickScope() && endMicroTickScope();
	        });
	    }
	    function beginMicroTickScope() {
	        var wasRootExec = isOutsideMicroTick;
	        isOutsideMicroTick = false;
	        needsNewPhysicalTick = false;
	        return wasRootExec;
	    }
	    function endMicroTickScope() {
	        var callbacks, i, l;
	        do {
	            while (microtickQueue.length > 0) {
	                callbacks = microtickQueue;
	                microtickQueue = [];
	                l = callbacks.length;
	                for (i = 0; i < l; ++i) {
	                    var item = callbacks[i];
	                    item[0].apply(null, item[1]);
	                }
	            }
	        } while (microtickQueue.length > 0);
	        isOutsideMicroTick = true;
	        needsNewPhysicalTick = true;
	    }
	    function finalizePhysicalTick() {
	        var unhandledErrs = unhandledErrors;
	        unhandledErrors = [];
	        unhandledErrs.forEach(function (p) {
	            p._PSD.onunhandled.call(null, p._value, p);
	        });
	        var finalizers = tickFinalizers.slice(0);
	        var i = finalizers.length;
	        while (i)
	            finalizers[--i]();
	    }
	    function run_at_end_of_this_or_next_physical_tick(fn) {
	        function finalizer() {
	            fn();
	            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
	        }
	        tickFinalizers.push(finalizer);
	        ++numScheduledCalls;
	        asap(function () {
	            if (--numScheduledCalls === 0)
	                finalizePhysicalTick();
	        }, []);
	    }
	    function addPossiblyUnhandledError(promise) {
	        if (!unhandledErrors.some(function (p) { return p._value === promise._value; }))
	            unhandledErrors.push(promise);
	    }
	    function markErrorAsHandled(promise) {
	        var i = unhandledErrors.length;
	        while (i)
	            if (unhandledErrors[--i]._value === promise._value) {
	                unhandledErrors.splice(i, 1);
	                return;
	            }
	    }
	    function PromiseReject(reason) {
	        return new DexiePromise(INTERNAL, false, reason);
	    }
	    function wrap(fn, errorCatcher) {
	        var psd = PSD;
	        return function () {
	            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
	            try {
	                switchToZone(psd, true);
	                return fn.apply(this, arguments);
	            }
	            catch (e) {
	                errorCatcher && errorCatcher(e);
	            }
	            finally {
	                switchToZone(outerScope, false);
	                if (wasRootExec)
	                    endMicroTickScope();
	            }
	        };
	    }
	    var task = { awaits: 0, echoes: 0, id: 0 };
	    var taskCounter = 0;
	    var zoneStack = [];
	    var zoneEchoes = 0;
	    var totalEchoes = 0;
	    var zone_id_counter = 0;
	    function newScope(fn, props, a1, a2) {
	        var parent = PSD, psd = Object.create(parent);
	        psd.parent = parent;
	        psd.ref = 0;
	        psd.global = false;
	        psd.id = ++zone_id_counter;
	        globalPSD.env;
	        psd.env = patchGlobalPromise ? {
	            Promise: DexiePromise,
	            PromiseProp: { value: DexiePromise, configurable: true, writable: true },
	            all: DexiePromise.all,
	            race: DexiePromise.race,
	            allSettled: DexiePromise.allSettled,
	            any: DexiePromise.any,
	            resolve: DexiePromise.resolve,
	            reject: DexiePromise.reject,
	        } : {};
	        if (props)
	            extend(psd, props);
	        ++parent.ref;
	        psd.finalize = function () {
	            --this.parent.ref || this.parent.finalize();
	        };
	        var rv = usePSD(psd, fn, a1, a2);
	        if (psd.ref === 0)
	            psd.finalize();
	        return rv;
	    }
	    function incrementExpectedAwaits() {
	        if (!task.id)
	            task.id = ++taskCounter;
	        ++task.awaits;
	        task.echoes += ZONE_ECHO_LIMIT;
	        return task.id;
	    }
	    function decrementExpectedAwaits() {
	        if (!task.awaits)
	            return false;
	        if (--task.awaits === 0)
	            task.id = 0;
	        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
	        return true;
	    }
	    if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
	        incrementExpectedAwaits = decrementExpectedAwaits = nop;
	    }
	    function onPossibleParallellAsync(possiblePromise) {
	        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
	            incrementExpectedAwaits();
	            return possiblePromise.then(function (x) {
	                decrementExpectedAwaits();
	                return x;
	            }, function (e) {
	                decrementExpectedAwaits();
	                return rejection(e);
	            });
	        }
	        return possiblePromise;
	    }
	    function zoneEnterEcho(targetZone) {
	        ++totalEchoes;
	        if (!task.echoes || --task.echoes === 0) {
	            task.echoes = task.awaits = task.id = 0;
	        }
	        zoneStack.push(PSD);
	        switchToZone(targetZone, true);
	    }
	    function zoneLeaveEcho() {
	        var zone = zoneStack[zoneStack.length - 1];
	        zoneStack.pop();
	        switchToZone(zone, false);
	    }
	    function switchToZone(targetZone, bEnteringZone) {
	        var currentZone = PSD;
	        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
	            queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
	        }
	        if (targetZone === PSD)
	            return;
	        PSD = targetZone;
	        if (currentZone === globalPSD)
	            globalPSD.env = snapShot();
	        if (patchGlobalPromise) {
	            var GlobalPromise = globalPSD.env.Promise;
	            var targetEnv = targetZone.env;
	            if (currentZone.global || targetZone.global) {
	                Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
	                GlobalPromise.all = targetEnv.all;
	                GlobalPromise.race = targetEnv.race;
	                GlobalPromise.resolve = targetEnv.resolve;
	                GlobalPromise.reject = targetEnv.reject;
	                if (targetEnv.allSettled)
	                    GlobalPromise.allSettled = targetEnv.allSettled;
	                if (targetEnv.any)
	                    GlobalPromise.any = targetEnv.any;
	            }
	        }
	    }
	    function snapShot() {
	        var GlobalPromise = _global.Promise;
	        return patchGlobalPromise ? {
	            Promise: GlobalPromise,
	            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
	            all: GlobalPromise.all,
	            race: GlobalPromise.race,
	            allSettled: GlobalPromise.allSettled,
	            any: GlobalPromise.any,
	            resolve: GlobalPromise.resolve,
	            reject: GlobalPromise.reject,
	        } : {};
	    }
	    function usePSD(psd, fn, a1, a2, a3) {
	        var outerScope = PSD;
	        try {
	            switchToZone(psd, true);
	            return fn(a1, a2, a3);
	        }
	        finally {
	            switchToZone(outerScope, false);
	        }
	    }
	    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
	        return typeof fn !== 'function' ? fn : function () {
	            var outerZone = PSD;
	            if (possibleAwait)
	                incrementExpectedAwaits();
	            switchToZone(zone, true);
	            try {
	                return fn.apply(this, arguments);
	            }
	            finally {
	                switchToZone(outerZone, false);
	                if (cleanup)
	                    queueMicrotask(decrementExpectedAwaits);
	            }
	        };
	    }
	    function execInGlobalContext(cb) {
	        if (Promise === NativePromise && task.echoes === 0) {
	            if (zoneEchoes === 0) {
	                cb();
	            }
	            else {
	                enqueueNativeMicroTask(cb);
	            }
	        }
	        else {
	            setTimeout(cb, 0);
	        }
	    }
	    var rejection = DexiePromise.reject;

	    function tempTransaction(db, mode, storeNames, fn) {
	        if (!db.idbdb || (!db._state.openComplete && (!PSD.letThrough && !db._vip))) {
	            if (db._state.openComplete) {
	                return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
	            }
	            if (!db._state.isBeingOpened) {
	                if (!db._state.autoOpen)
	                    return rejection(new exceptions.DatabaseClosed());
	                db.open().catch(nop);
	            }
	            return db._state.dbReadyPromise.then(function () { return tempTransaction(db, mode, storeNames, fn); });
	        }
	        else {
	            var trans = db._createTransaction(mode, storeNames, db._dbSchema);
	            try {
	                trans.create();
	                db._state.PR1398_maxLoop = 3;
	            }
	            catch (ex) {
	                if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
	                    console.warn('Dexie: Need to reopen db');
	                    db.close({ disableAutoOpen: false });
	                    return db.open().then(function () { return tempTransaction(db, mode, storeNames, fn); });
	                }
	                return rejection(ex);
	            }
	            return trans._promise(mode, function (resolve, reject) {
	                return newScope(function () {
	                    PSD.trans = trans;
	                    return fn(resolve, reject, trans);
	                });
	            }).then(function (result) {
	                if (mode === 'readwrite')
	                    try {
	                        trans.idbtrans.commit();
	                    }
	                    catch (_a) { }
	                return mode === 'readonly' ? result : trans._completion.then(function () { return result; });
	            });
	        }
	    }

	    var DEXIE_VERSION = '4.0.7';
	    var maxString = String.fromCharCode(65535);
	    var minKey = -Infinity;
	    var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
	    var STRING_EXPECTED = "String expected.";
	    var connections = [];
	    var DBNAMES_DB = '__dbnames';
	    var READONLY = 'readonly';
	    var READWRITE = 'readwrite';

	    function combine(filter1, filter2) {
	        return filter1 ?
	            filter2 ?
	                function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
	                filter1 :
	            filter2;
	    }

	    var AnyRange = {
	        type: 3 ,
	        lower: -Infinity,
	        lowerOpen: false,
	        upper: [[]],
	        upperOpen: false
	    };

	    function workaroundForUndefinedPrimKey(keyPath) {
	        return typeof keyPath === "string" && !/\./.test(keyPath)
	            ? function (obj) {
	                if (obj[keyPath] === undefined && (keyPath in obj)) {
	                    obj = deepClone(obj);
	                    delete obj[keyPath];
	                }
	                return obj;
	            }
	            : function (obj) { return obj; };
	    }

	    function Entity() {
	        throw exceptions.Type();
	    }

	    function cmp(a, b) {
	        try {
	            var ta = type(a);
	            var tb = type(b);
	            if (ta !== tb) {
	                if (ta === 'Array')
	                    return 1;
	                if (tb === 'Array')
	                    return -1;
	                if (ta === 'binary')
	                    return 1;
	                if (tb === 'binary')
	                    return -1;
	                if (ta === 'string')
	                    return 1;
	                if (tb === 'string')
	                    return -1;
	                if (ta === 'Date')
	                    return 1;
	                if (tb !== 'Date')
	                    return NaN;
	                return -1;
	            }
	            switch (ta) {
	                case 'number':
	                case 'Date':
	                case 'string':
	                    return a > b ? 1 : a < b ? -1 : 0;
	                case 'binary': {
	                    return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
	                }
	                case 'Array':
	                    return compareArrays(a, b);
	            }
	        }
	        catch (_a) { }
	        return NaN;
	    }
	    function compareArrays(a, b) {
	        var al = a.length;
	        var bl = b.length;
	        var l = al < bl ? al : bl;
	        for (var i = 0; i < l; ++i) {
	            var res = cmp(a[i], b[i]);
	            if (res !== 0)
	                return res;
	        }
	        return al === bl ? 0 : al < bl ? -1 : 1;
	    }
	    function compareUint8Arrays(a, b) {
	        var al = a.length;
	        var bl = b.length;
	        var l = al < bl ? al : bl;
	        for (var i = 0; i < l; ++i) {
	            if (a[i] !== b[i])
	                return a[i] < b[i] ? -1 : 1;
	        }
	        return al === bl ? 0 : al < bl ? -1 : 1;
	    }
	    function type(x) {
	        var t = typeof x;
	        if (t !== 'object')
	            return t;
	        if (ArrayBuffer.isView(x))
	            return 'binary';
	        var tsTag = toStringTag(x);
	        return tsTag === 'ArrayBuffer' ? 'binary' : tsTag;
	    }
	    function getUint8Array(a) {
	        if (a instanceof Uint8Array)
	            return a;
	        if (ArrayBuffer.isView(a))
	            return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
	        return new Uint8Array(a);
	    }

	    var Table =  (function () {
	        function Table() {
	        }
	        Table.prototype._trans = function (mode, fn, writeLocked) {
	            var trans = this._tx || PSD.trans;
	            var tableName = this.name;
	            var task = debug && typeof console !== 'undefined' && console.createTask && console.createTask("Dexie: ".concat(mode === 'readonly' ? 'read' : 'write', " ").concat(this.name));
	            function checkTableInTransaction(resolve, reject, trans) {
	                if (!trans.schema[tableName])
	                    throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
	                return fn(trans.idbtrans, trans);
	            }
	            var wasRootExec = beginMicroTickScope();
	            try {
	                var p = trans && trans.db._novip === this.db._novip ?
	                    trans === PSD.trans ?
	                        trans._promise(mode, checkTableInTransaction, writeLocked) :
	                        newScope(function () { return trans._promise(mode, checkTableInTransaction, writeLocked); }, { trans: trans, transless: PSD.transless || PSD }) :
	                    tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
	                if (task) {
	                    p._consoleTask = task;
	                    p = p.catch(function (err) {
	                        console.trace(err);
	                        return rejection(err);
	                    });
	                }
	                return p;
	            }
	            finally {
	                if (wasRootExec)
	                    endMicroTickScope();
	            }
	        };
	        Table.prototype.get = function (keyOrCrit, cb) {
	            var _this = this;
	            if (keyOrCrit && keyOrCrit.constructor === Object)
	                return this.where(keyOrCrit).first(cb);
	            if (keyOrCrit == null)
	                return rejection(new exceptions.Type("Invalid argument to Table.get()"));
	            return this._trans('readonly', function (trans) {
	                return _this.core.get({ trans: trans, key: keyOrCrit })
	                    .then(function (res) { return _this.hook.reading.fire(res); });
	            }).then(cb);
	        };
	        Table.prototype.where = function (indexOrCrit) {
	            if (typeof indexOrCrit === 'string')
	                return new this.db.WhereClause(this, indexOrCrit);
	            if (isArray(indexOrCrit))
	                return new this.db.WhereClause(this, "[".concat(indexOrCrit.join('+'), "]"));
	            var keyPaths = keys(indexOrCrit);
	            if (keyPaths.length === 1)
	                return this
	                    .where(keyPaths[0])
	                    .equals(indexOrCrit[keyPaths[0]]);
	            var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
	                if (ix.compound &&
	                    keyPaths.every(function (keyPath) { return ix.keyPath.indexOf(keyPath) >= 0; })) {
	                    for (var i = 0; i < keyPaths.length; ++i) {
	                        if (keyPaths.indexOf(ix.keyPath[i]) === -1)
	                            return false;
	                    }
	                    return true;
	                }
	                return false;
	            }).sort(function (a, b) { return a.keyPath.length - b.keyPath.length; })[0];
	            if (compoundIndex && this.db._maxKey !== maxString) {
	                var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
	                return this
	                    .where(keyPathsInValidOrder)
	                    .equals(keyPathsInValidOrder.map(function (kp) { return indexOrCrit[kp]; }));
	            }
	            if (!compoundIndex && debug)
	                console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") +
	                    "compound index [".concat(keyPaths.join('+'), "]"));
	            var idxByName = this.schema.idxByName;
	            var idb = this.db._deps.indexedDB;
	            function equals(a, b) {
	                return idb.cmp(a, b) === 0;
	            }
	            var _a = keyPaths.reduce(function (_a, keyPath) {
	                var prevIndex = _a[0], prevFilterFn = _a[1];
	                var index = idxByName[keyPath];
	                var value = indexOrCrit[keyPath];
	                return [
	                    prevIndex || index,
	                    prevIndex || !index ?
	                        combine(prevFilterFn, index && index.multi ?
	                            function (x) {
	                                var prop = getByKeyPath(x, keyPath);
	                                return isArray(prop) && prop.some(function (item) { return equals(value, item); });
	                            } : function (x) { return equals(value, getByKeyPath(x, keyPath)); })
	                        : prevFilterFn
	                ];
	            }, [null, null]), idx = _a[0], filterFunction = _a[1];
	            return idx ?
	                this.where(idx.name).equals(indexOrCrit[idx.keyPath])
	                    .filter(filterFunction) :
	                compoundIndex ?
	                    this.filter(filterFunction) :
	                    this.where(keyPaths).equals('');
	        };
	        Table.prototype.filter = function (filterFunction) {
	            return this.toCollection().and(filterFunction);
	        };
	        Table.prototype.count = function (thenShortcut) {
	            return this.toCollection().count(thenShortcut);
	        };
	        Table.prototype.offset = function (offset) {
	            return this.toCollection().offset(offset);
	        };
	        Table.prototype.limit = function (numRows) {
	            return this.toCollection().limit(numRows);
	        };
	        Table.prototype.each = function (callback) {
	            return this.toCollection().each(callback);
	        };
	        Table.prototype.toArray = function (thenShortcut) {
	            return this.toCollection().toArray(thenShortcut);
	        };
	        Table.prototype.toCollection = function () {
	            return new this.db.Collection(new this.db.WhereClause(this));
	        };
	        Table.prototype.orderBy = function (index) {
	            return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ?
	                "[".concat(index.join('+'), "]") :
	                index));
	        };
	        Table.prototype.reverse = function () {
	            return this.toCollection().reverse();
	        };
	        Table.prototype.mapToClass = function (constructor) {
	            var _a = this, db = _a.db, tableName = _a.name;
	            this.schema.mappedClass = constructor;
	            if (constructor.prototype instanceof Entity) {
	                constructor =  (function (_super) {
	                    __extends(class_1, _super);
	                    function class_1() {
	                        return _super !== null && _super.apply(this, arguments) || this;
	                    }
	                    Object.defineProperty(class_1.prototype, "db", {
	                        get: function () { return db; },
	                        enumerable: false,
	                        configurable: true
	                    });
	                    class_1.prototype.table = function () { return tableName; };
	                    return class_1;
	                }(constructor));
	            }
	            var inheritedProps = new Set();
	            for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
	                Object.getOwnPropertyNames(proto).forEach(function (propName) { return inheritedProps.add(propName); });
	            }
	            var readHook = function (obj) {
	                if (!obj)
	                    return obj;
	                var res = Object.create(constructor.prototype);
	                for (var m in obj)
	                    if (!inheritedProps.has(m))
	                        try {
	                            res[m] = obj[m];
	                        }
	                        catch (_) { }
	                return res;
	            };
	            if (this.schema.readHook) {
	                this.hook.reading.unsubscribe(this.schema.readHook);
	            }
	            this.schema.readHook = readHook;
	            this.hook("reading", readHook);
	            return constructor;
	        };
	        Table.prototype.defineClass = function () {
	            function Class(content) {
	                extend(this, content);
	            }
	            return this.mapToClass(Class);
	        };
	        Table.prototype.add = function (obj, key) {
	            var _this = this;
	            var _a = this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
	            var objToAdd = obj;
	            if (keyPath && auto) {
	                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
	            }
	            return this._trans('readwrite', function (trans) {
	                return _this.core.mutate({ trans: trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd] });
	            }).then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult; })
	                .then(function (lastResult) {
	                if (keyPath) {
	                    try {
	                        setByKeyPath(obj, keyPath, lastResult);
	                    }
	                    catch (_) { }
	                }
	                return lastResult;
	            });
	        };
	        Table.prototype.update = function (keyOrObject, modifications) {
	            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
	                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
	                if (key === undefined)
	                    return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
	                return this.where(":id").equals(key).modify(modifications);
	            }
	            else {
	                return this.where(":id").equals(keyOrObject).modify(modifications);
	            }
	        };
	        Table.prototype.put = function (obj, key) {
	            var _this = this;
	            var _a = this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
	            var objToAdd = obj;
	            if (keyPath && auto) {
	                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
	            }
	            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null }); })
	                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult; })
	                .then(function (lastResult) {
	                if (keyPath) {
	                    try {
	                        setByKeyPath(obj, keyPath, lastResult);
	                    }
	                    catch (_) { }
	                }
	                return lastResult;
	            });
	        };
	        Table.prototype.delete = function (key) {
	            var _this = this;
	            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'delete', keys: [key] }); })
	                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined; });
	        };
	        Table.prototype.clear = function () {
	            var _this = this;
	            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'deleteRange', range: AnyRange }); })
	                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined; });
	        };
	        Table.prototype.bulkGet = function (keys) {
	            var _this = this;
	            return this._trans('readonly', function (trans) {
	                return _this.core.getMany({
	                    keys: keys,
	                    trans: trans
	                }).then(function (result) { return result.map(function (res) { return _this.hook.reading.fire(res); }); });
	            });
	        };
	        Table.prototype.bulkAdd = function (objects, keysOrOptions, options) {
	            var _this = this;
	            var keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
	            options = options || (keys ? undefined : keysOrOptions);
	            var wantResults = options ? options.allKeys : undefined;
	            return this._trans('readwrite', function (trans) {
	                var _a = _this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
	                if (keyPath && keys)
	                    throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
	                if (keys && keys.length !== objects.length)
	                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
	                var numObjects = objects.length;
	                var objectsToAdd = keyPath && auto ?
	                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
	                    objects;
	                return _this.core.mutate({ trans: trans, type: 'add', keys: keys, values: objectsToAdd, wantResults: wantResults })
	                    .then(function (_a) {
	                    var numFailures = _a.numFailures, results = _a.results, lastResult = _a.lastResult, failures = _a.failures;
	                    var result = wantResults ? results : lastResult;
	                    if (numFailures === 0)
	                        return result;
	                    throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
	                });
	            });
	        };
	        Table.prototype.bulkPut = function (objects, keysOrOptions, options) {
	            var _this = this;
	            var keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
	            options = options || (keys ? undefined : keysOrOptions);
	            var wantResults = options ? options.allKeys : undefined;
	            return this._trans('readwrite', function (trans) {
	                var _a = _this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
	                if (keyPath && keys)
	                    throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
	                if (keys && keys.length !== objects.length)
	                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
	                var numObjects = objects.length;
	                var objectsToPut = keyPath && auto ?
	                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
	                    objects;
	                return _this.core.mutate({ trans: trans, type: 'put', keys: keys, values: objectsToPut, wantResults: wantResults })
	                    .then(function (_a) {
	                    var numFailures = _a.numFailures, results = _a.results, lastResult = _a.lastResult, failures = _a.failures;
	                    var result = wantResults ? results : lastResult;
	                    if (numFailures === 0)
	                        return result;
	                    throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
	                });
	            });
	        };
	        Table.prototype.bulkUpdate = function (keysAndChanges) {
	            var _this = this;
	            var coreTable = this.core;
	            var keys = keysAndChanges.map(function (entry) { return entry.key; });
	            var changeSpecs = keysAndChanges.map(function (entry) { return entry.changes; });
	            var offsetMap = [];
	            return this._trans('readwrite', function (trans) {
	                return coreTable.getMany({ trans: trans, keys: keys, cache: 'clone' }).then(function (objs) {
	                    var resultKeys = [];
	                    var resultObjs = [];
	                    keysAndChanges.forEach(function (_a, idx) {
	                        var key = _a.key, changes = _a.changes;
	                        var obj = objs[idx];
	                        if (obj) {
	                            for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
	                                var keyPath = _b[_i];
	                                var value = changes[keyPath];
	                                if (keyPath === _this.schema.primKey.keyPath) {
	                                    if (cmp(value, key) !== 0) {
	                                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
	                                    }
	                                }
	                                else {
	                                    setByKeyPath(obj, keyPath, value);
	                                }
	                            }
	                            offsetMap.push(idx);
	                            resultKeys.push(key);
	                            resultObjs.push(obj);
	                        }
	                    });
	                    var numEntries = resultKeys.length;
	                    return coreTable
	                        .mutate({
	                        trans: trans,
	                        type: 'put',
	                        keys: resultKeys,
	                        values: resultObjs,
	                        updates: {
	                            keys: keys,
	                            changeSpecs: changeSpecs
	                        }
	                    })
	                        .then(function (_a) {
	                        var numFailures = _a.numFailures, failures = _a.failures;
	                        if (numFailures === 0)
	                            return numEntries;
	                        for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
	                            var offset = _b[_i];
	                            var mappedOffset = offsetMap[Number(offset)];
	                            if (mappedOffset != null) {
	                                var failure = failures[offset];
	                                delete failures[offset];
	                                failures[mappedOffset] = failure;
	                            }
	                        }
	                        throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
	                    });
	                });
	            });
	        };
	        Table.prototype.bulkDelete = function (keys) {
	            var _this = this;
	            var numKeys = keys.length;
	            return this._trans('readwrite', function (trans) {
	                return _this.core.mutate({ trans: trans, type: 'delete', keys: keys });
	            }).then(function (_a) {
	                var numFailures = _a.numFailures, lastResult = _a.lastResult, failures = _a.failures;
	                if (numFailures === 0)
	                    return lastResult;
	                throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
	            });
	        };
	        return Table;
	    }());

	    function Events(ctx) {
	        var evs = {};
	        var rv = function (eventName, subscriber) {
	            if (subscriber) {
	                var i = arguments.length, args = new Array(i - 1);
	                while (--i)
	                    args[i - 1] = arguments[i];
	                evs[eventName].subscribe.apply(null, args);
	                return ctx;
	            }
	            else if (typeof (eventName) === 'string') {
	                return evs[eventName];
	            }
	        };
	        rv.addEventType = add;
	        for (var i = 1, l = arguments.length; i < l; ++i) {
	            add(arguments[i]);
	        }
	        return rv;
	        function add(eventName, chainFunction, defaultFunction) {
	            if (typeof eventName === 'object')
	                return addConfiguredEvents(eventName);
	            if (!chainFunction)
	                chainFunction = reverseStoppableEventChain;
	            if (!defaultFunction)
	                defaultFunction = nop;
	            var context = {
	                subscribers: [],
	                fire: defaultFunction,
	                subscribe: function (cb) {
	                    if (context.subscribers.indexOf(cb) === -1) {
	                        context.subscribers.push(cb);
	                        context.fire = chainFunction(context.fire, cb);
	                    }
	                },
	                unsubscribe: function (cb) {
	                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
	                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
	                }
	            };
	            evs[eventName] = rv[eventName] = context;
	            return context;
	        }
	        function addConfiguredEvents(cfg) {
	            keys(cfg).forEach(function (eventName) {
	                var args = cfg[eventName];
	                if (isArray(args)) {
	                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
	                }
	                else if (args === 'asap') {
	                    var context = add(eventName, mirror, function fire() {
	                        var i = arguments.length, args = new Array(i);
	                        while (i--)
	                            args[i] = arguments[i];
	                        context.subscribers.forEach(function (fn) {
	                            asap$1(function fireEvent() {
	                                fn.apply(null, args);
	                            });
	                        });
	                    });
	                }
	                else
	                    throw new exceptions.InvalidArgument("Invalid event config");
	            });
	        }
	    }

	    function makeClassConstructor(prototype, constructor) {
	        derive(constructor).from({ prototype: prototype });
	        return constructor;
	    }

	    function createTableConstructor(db) {
	        return makeClassConstructor(Table.prototype, function Table(name, tableSchema, trans) {
	            this.db = db;
	            this._tx = trans;
	            this.name = name;
	            this.schema = tableSchema;
	            this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
	                "creating": [hookCreatingChain, nop],
	                "reading": [pureFunctionChain, mirror],
	                "updating": [hookUpdatingChain, nop],
	                "deleting": [hookDeletingChain, nop]
	            });
	        });
	    }

	    function isPlainKeyRange(ctx, ignoreLimitFilter) {
	        return !(ctx.filter || ctx.algorithm || ctx.or) &&
	            (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
	    }
	    function addFilter(ctx, fn) {
	        ctx.filter = combine(ctx.filter, fn);
	    }
	    function addReplayFilter(ctx, factory, isLimitFilter) {
	        var curr = ctx.replayFilter;
	        ctx.replayFilter = curr ? function () { return combine(curr(), factory()); } : factory;
	        ctx.justLimit = isLimitFilter && !curr;
	    }
	    function addMatchFilter(ctx, fn) {
	        ctx.isMatch = combine(ctx.isMatch, fn);
	    }
	    function getIndexOrStore(ctx, coreSchema) {
	        if (ctx.isPrimKey)
	            return coreSchema.primaryKey;
	        var index = coreSchema.getIndexByKeyPath(ctx.index);
	        if (!index)
	            throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
	        return index;
	    }
	    function openCursor(ctx, coreTable, trans) {
	        var index = getIndexOrStore(ctx, coreTable.schema);
	        return coreTable.openCursor({
	            trans: trans,
	            values: !ctx.keysOnly,
	            reverse: ctx.dir === 'prev',
	            unique: !!ctx.unique,
	            query: {
	                index: index,
	                range: ctx.range
	            }
	        });
	    }
	    function iter(ctx, fn, coreTrans, coreTable) {
	        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
	        if (!ctx.or) {
	            return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
	        }
	        else {
	            var set_1 = {};
	            var union = function (item, cursor, advance) {
	                if (!filter || filter(cursor, advance, function (result) { return cursor.stop(result); }, function (err) { return cursor.fail(err); })) {
	                    var primaryKey = cursor.primaryKey;
	                    var key = '' + primaryKey;
	                    if (key === '[object ArrayBuffer]')
	                        key = '' + new Uint8Array(primaryKey);
	                    if (!hasOwn(set_1, key)) {
	                        set_1[key] = true;
	                        fn(item, cursor, advance);
	                    }
	                }
	            };
	            return Promise.all([
	                ctx.or._iterate(union, coreTrans),
	                iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
	            ]);
	        }
	    }
	    function iterate(cursorPromise, filter, fn, valueMapper) {
	        var mappedFn = valueMapper ? function (x, c, a) { return fn(valueMapper(x), c, a); } : fn;
	        var wrappedFn = wrap(mappedFn);
	        return cursorPromise.then(function (cursor) {
	            if (cursor) {
	                return cursor.start(function () {
	                    var c = function () { return cursor.continue(); };
	                    if (!filter || filter(cursor, function (advancer) { return c = advancer; }, function (val) { cursor.stop(val); c = nop; }, function (e) { cursor.fail(e); c = nop; }))
	                        wrappedFn(cursor.value, cursor, function (advancer) { return c = advancer; });
	                    c();
	                });
	            }
	        });
	    }

	    var PropModSymbol = Symbol();
	    var PropModification =  (function () {
	        function PropModification(spec) {
	            Object.assign(this, spec);
	        }
	        PropModification.prototype.execute = function (value) {
	            var _a;
	            if (this.add !== undefined) {
	                var term = this.add;
	                if (isArray(term)) {
	                    return __spreadArray(__spreadArray([], (isArray(value) ? value : []), true), term).sort();
	                }
	                if (typeof term === 'number')
	                    return (Number(value) || 0) + term;
	                if (typeof term === 'bigint') {
	                    try {
	                        return BigInt(value) + term;
	                    }
	                    catch (_b) {
	                        return BigInt(0) + term;
	                    }
	                }
	                throw new TypeError("Invalid term ".concat(term));
	            }
	            if (this.remove !== undefined) {
	                var subtrahend_1 = this.remove;
	                if (isArray(subtrahend_1)) {
	                    return isArray(value) ? value.filter(function (item) { return !subtrahend_1.includes(item); }).sort() : [];
	                }
	                if (typeof subtrahend_1 === 'number')
	                    return Number(value) - subtrahend_1;
	                if (typeof subtrahend_1 === 'bigint') {
	                    try {
	                        return BigInt(value) - subtrahend_1;
	                    }
	                    catch (_c) {
	                        return BigInt(0) - subtrahend_1;
	                    }
	                }
	                throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
	            }
	            var prefixToReplace = (_a = this.replacePrefix) === null || _a === void 0 ? void 0 : _a[0];
	            if (prefixToReplace && typeof value === 'string' && value.startsWith(prefixToReplace)) {
	                return this.replacePrefix[1] + value.substring(prefixToReplace.length);
	            }
	            return value;
	        };
	        return PropModification;
	    }());

	    var Collection =  (function () {
	        function Collection() {
	        }
	        Collection.prototype._read = function (fn, cb) {
	            var ctx = this._ctx;
	            return ctx.error ?
	                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
	                ctx.table._trans('readonly', fn).then(cb);
	        };
	        Collection.prototype._write = function (fn) {
	            var ctx = this._ctx;
	            return ctx.error ?
	                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
	                ctx.table._trans('readwrite', fn, "locked");
	        };
	        Collection.prototype._addAlgorithm = function (fn) {
	            var ctx = this._ctx;
	            ctx.algorithm = combine(ctx.algorithm, fn);
	        };
	        Collection.prototype._iterate = function (fn, coreTrans) {
	            return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
	        };
	        Collection.prototype.clone = function (props) {
	            var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
	            if (props)
	                extend(ctx, props);
	            rv._ctx = ctx;
	            return rv;
	        };
	        Collection.prototype.raw = function () {
	            this._ctx.valueMapper = null;
	            return this;
	        };
	        Collection.prototype.each = function (fn) {
	            var ctx = this._ctx;
	            return this._read(function (trans) { return iter(ctx, fn, trans, ctx.table.core); });
	        };
	        Collection.prototype.count = function (cb) {
	            var _this = this;
	            return this._read(function (trans) {
	                var ctx = _this._ctx;
	                var coreTable = ctx.table.core;
	                if (isPlainKeyRange(ctx, true)) {
	                    return coreTable.count({
	                        trans: trans,
	                        query: {
	                            index: getIndexOrStore(ctx, coreTable.schema),
	                            range: ctx.range
	                        }
	                    }).then(function (count) { return Math.min(count, ctx.limit); });
	                }
	                else {
	                    var count = 0;
	                    return iter(ctx, function () { ++count; return false; }, trans, coreTable)
	                        .then(function () { return count; });
	                }
	            }).then(cb);
	        };
	        Collection.prototype.sortBy = function (keyPath, cb) {
	            var parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
	            function getval(obj, i) {
	                if (i)
	                    return getval(obj[parts[i]], i - 1);
	                return obj[lastPart];
	            }
	            var order = this._ctx.dir === "next" ? 1 : -1;
	            function sorter(a, b) {
	                var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
	                return aVal < bVal ? -order : aVal > bVal ? order : 0;
	            }
	            return this.toArray(function (a) {
	                return a.sort(sorter);
	            }).then(cb);
	        };
	        Collection.prototype.toArray = function (cb) {
	            var _this = this;
	            return this._read(function (trans) {
	                var ctx = _this._ctx;
	                if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
	                    var valueMapper_1 = ctx.valueMapper;
	                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
	                    return ctx.table.core.query({
	                        trans: trans,
	                        limit: ctx.limit,
	                        values: true,
	                        query: {
	                            index: index,
	                            range: ctx.range
	                        }
	                    }).then(function (_a) {
	                        var result = _a.result;
	                        return valueMapper_1 ? result.map(valueMapper_1) : result;
	                    });
	                }
	                else {
	                    var a_1 = [];
	                    return iter(ctx, function (item) { return a_1.push(item); }, trans, ctx.table.core).then(function () { return a_1; });
	                }
	            }, cb);
	        };
	        Collection.prototype.offset = function (offset) {
	            var ctx = this._ctx;
	            if (offset <= 0)
	                return this;
	            ctx.offset += offset;
	            if (isPlainKeyRange(ctx)) {
	                addReplayFilter(ctx, function () {
	                    var offsetLeft = offset;
	                    return function (cursor, advance) {
	                        if (offsetLeft === 0)
	                            return true;
	                        if (offsetLeft === 1) {
	                            --offsetLeft;
	                            return false;
	                        }
	                        advance(function () {
	                            cursor.advance(offsetLeft);
	                            offsetLeft = 0;
	                        });
	                        return false;
	                    };
	                });
	            }
	            else {
	                addReplayFilter(ctx, function () {
	                    var offsetLeft = offset;
	                    return function () { return (--offsetLeft < 0); };
	                });
	            }
	            return this;
	        };
	        Collection.prototype.limit = function (numRows) {
	            this._ctx.limit = Math.min(this._ctx.limit, numRows);
	            addReplayFilter(this._ctx, function () {
	                var rowsLeft = numRows;
	                return function (cursor, advance, resolve) {
	                    if (--rowsLeft <= 0)
	                        advance(resolve);
	                    return rowsLeft >= 0;
	                };
	            }, true);
	            return this;
	        };
	        Collection.prototype.until = function (filterFunction, bIncludeStopEntry) {
	            addFilter(this._ctx, function (cursor, advance, resolve) {
	                if (filterFunction(cursor.value)) {
	                    advance(resolve);
	                    return bIncludeStopEntry;
	                }
	                else {
	                    return true;
	                }
	            });
	            return this;
	        };
	        Collection.prototype.first = function (cb) {
	            return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
	        };
	        Collection.prototype.last = function (cb) {
	            return this.reverse().first(cb);
	        };
	        Collection.prototype.filter = function (filterFunction) {
	            addFilter(this._ctx, function (cursor) {
	                return filterFunction(cursor.value);
	            });
	            addMatchFilter(this._ctx, filterFunction);
	            return this;
	        };
	        Collection.prototype.and = function (filter) {
	            return this.filter(filter);
	        };
	        Collection.prototype.or = function (indexName) {
	            return new this.db.WhereClause(this._ctx.table, indexName, this);
	        };
	        Collection.prototype.reverse = function () {
	            this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
	            if (this._ondirectionchange)
	                this._ondirectionchange(this._ctx.dir);
	            return this;
	        };
	        Collection.prototype.desc = function () {
	            return this.reverse();
	        };
	        Collection.prototype.eachKey = function (cb) {
	            var ctx = this._ctx;
	            ctx.keysOnly = !ctx.isMatch;
	            return this.each(function (val, cursor) { cb(cursor.key, cursor); });
	        };
	        Collection.prototype.eachUniqueKey = function (cb) {
	            this._ctx.unique = "unique";
	            return this.eachKey(cb);
	        };
	        Collection.prototype.eachPrimaryKey = function (cb) {
	            var ctx = this._ctx;
	            ctx.keysOnly = !ctx.isMatch;
	            return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
	        };
	        Collection.prototype.keys = function (cb) {
	            var ctx = this._ctx;
	            ctx.keysOnly = !ctx.isMatch;
	            var a = [];
	            return this.each(function (item, cursor) {
	                a.push(cursor.key);
	            }).then(function () {
	                return a;
	            }).then(cb);
	        };
	        Collection.prototype.primaryKeys = function (cb) {
	            var ctx = this._ctx;
	            if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
	                return this._read(function (trans) {
	                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
	                    return ctx.table.core.query({
	                        trans: trans,
	                        values: false,
	                        limit: ctx.limit,
	                        query: {
	                            index: index,
	                            range: ctx.range
	                        }
	                    });
	                }).then(function (_a) {
	                    var result = _a.result;
	                    return result;
	                }).then(cb);
	            }
	            ctx.keysOnly = !ctx.isMatch;
	            var a = [];
	            return this.each(function (item, cursor) {
	                a.push(cursor.primaryKey);
	            }).then(function () {
	                return a;
	            }).then(cb);
	        };
	        Collection.prototype.uniqueKeys = function (cb) {
	            this._ctx.unique = "unique";
	            return this.keys(cb);
	        };
	        Collection.prototype.firstKey = function (cb) {
	            return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
	        };
	        Collection.prototype.lastKey = function (cb) {
	            return this.reverse().firstKey(cb);
	        };
	        Collection.prototype.distinct = function () {
	            var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
	            if (!idx || !idx.multi)
	                return this;
	            var set = {};
	            addFilter(this._ctx, function (cursor) {
	                var strKey = cursor.primaryKey.toString();
	                var found = hasOwn(set, strKey);
	                set[strKey] = true;
	                return !found;
	            });
	            return this;
	        };
	        Collection.prototype.modify = function (changes) {
	            var _this = this;
	            var ctx = this._ctx;
	            return this._write(function (trans) {
	                var modifyer;
	                if (typeof changes === 'function') {
	                    modifyer = changes;
	                }
	                else {
	                    var keyPaths = keys(changes);
	                    var numKeys = keyPaths.length;
	                    modifyer = function (item) {
	                        var anythingModified = false;
	                        for (var i = 0; i < numKeys; ++i) {
	                            var keyPath = keyPaths[i];
	                            var val = changes[keyPath];
	                            var origVal = getByKeyPath(item, keyPath);
	                            if (val instanceof PropModification) {
	                                setByKeyPath(item, keyPath, val.execute(origVal));
	                                anythingModified = true;
	                            }
	                            else if (origVal !== val) {
	                                setByKeyPath(item, keyPath, val);
	                                anythingModified = true;
	                            }
	                        }
	                        return anythingModified;
	                    };
	                }
	                var coreTable = ctx.table.core;
	                var _a = coreTable.schema.primaryKey, outbound = _a.outbound, extractKey = _a.extractKey;
	                var limit = _this.db._options.modifyChunkSize || 200;
	                var totalFailures = [];
	                var successCount = 0;
	                var failedKeys = [];
	                var applyMutateResult = function (expectedCount, res) {
	                    var failures = res.failures, numFailures = res.numFailures;
	                    successCount += expectedCount - numFailures;
	                    for (var _i = 0, _a = keys(failures); _i < _a.length; _i++) {
	                        var pos = _a[_i];
	                        totalFailures.push(failures[pos]);
	                    }
	                };
	                return _this.clone().primaryKeys().then(function (keys) {
	                    var criteria = isPlainKeyRange(ctx) &&
	                        ctx.limit === Infinity &&
	                        (typeof changes !== 'function' || changes === deleteCallback) && {
	                        index: ctx.index,
	                        range: ctx.range
	                    };
	                    var nextChunk = function (offset) {
	                        var count = Math.min(limit, keys.length - offset);
	                        return coreTable.getMany({
	                            trans: trans,
	                            keys: keys.slice(offset, offset + count),
	                            cache: "immutable"
	                        }).then(function (values) {
	                            var addValues = [];
	                            var putValues = [];
	                            var putKeys = outbound ? [] : null;
	                            var deleteKeys = [];
	                            for (var i = 0; i < count; ++i) {
	                                var origValue = values[i];
	                                var ctx_1 = {
	                                    value: deepClone(origValue),
	                                    primKey: keys[offset + i]
	                                };
	                                if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
	                                    if (ctx_1.value == null) {
	                                        deleteKeys.push(keys[offset + i]);
	                                    }
	                                    else if (!outbound && cmp(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
	                                        deleteKeys.push(keys[offset + i]);
	                                        addValues.push(ctx_1.value);
	                                    }
	                                    else {
	                                        putValues.push(ctx_1.value);
	                                        if (outbound)
	                                            putKeys.push(keys[offset + i]);
	                                    }
	                                }
	                            }
	                            return Promise.resolve(addValues.length > 0 &&
	                                coreTable.mutate({ trans: trans, type: 'add', values: addValues })
	                                    .then(function (res) {
	                                    for (var pos in res.failures) {
	                                        deleteKeys.splice(parseInt(pos), 1);
	                                    }
	                                    applyMutateResult(addValues.length, res);
	                                })).then(function () { return (putValues.length > 0 || (criteria && typeof changes === 'object')) &&
	                                coreTable.mutate({
	                                    trans: trans,
	                                    type: 'put',
	                                    keys: putKeys,
	                                    values: putValues,
	                                    criteria: criteria,
	                                    changeSpec: typeof changes !== 'function'
	                                        && changes,
	                                    isAdditionalChunk: offset > 0
	                                }).then(function (res) { return applyMutateResult(putValues.length, res); }); }).then(function () { return (deleteKeys.length > 0 || (criteria && changes === deleteCallback)) &&
	                                coreTable.mutate({
	                                    trans: trans,
	                                    type: 'delete',
	                                    keys: deleteKeys,
	                                    criteria: criteria,
	                                    isAdditionalChunk: offset > 0
	                                }).then(function (res) { return applyMutateResult(deleteKeys.length, res); }); }).then(function () {
	                                return keys.length > offset + count && nextChunk(offset + limit);
	                            });
	                        });
	                    };
	                    return nextChunk(0).then(function () {
	                        if (totalFailures.length > 0)
	                            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
	                        return keys.length;
	                    });
	                });
	            });
	        };
	        Collection.prototype.delete = function () {
	            var ctx = this._ctx, range = ctx.range;
	            if (isPlainKeyRange(ctx) &&
	                (ctx.isPrimKey || range.type === 3 ))
	             {
	                return this._write(function (trans) {
	                    var primaryKey = ctx.table.core.schema.primaryKey;
	                    var coreRange = range;
	                    return ctx.table.core.count({ trans: trans, query: { index: primaryKey, range: coreRange } }).then(function (count) {
	                        return ctx.table.core.mutate({ trans: trans, type: 'deleteRange', range: coreRange })
	                            .then(function (_a) {
	                            var failures = _a.failures; _a.lastResult; _a.results; var numFailures = _a.numFailures;
	                            if (numFailures)
	                                throw new ModifyError("Could not delete some values", Object.keys(failures).map(function (pos) { return failures[pos]; }), count - numFailures);
	                            return count - numFailures;
	                        });
	                    });
	                });
	            }
	            return this.modify(deleteCallback);
	        };
	        return Collection;
	    }());
	    var deleteCallback = function (value, ctx) { return ctx.value = null; };

	    function createCollectionConstructor(db) {
	        return makeClassConstructor(Collection.prototype, function Collection(whereClause, keyRangeGenerator) {
	            this.db = db;
	            var keyRange = AnyRange, error = null;
	            if (keyRangeGenerator)
	                try {
	                    keyRange = keyRangeGenerator();
	                }
	                catch (ex) {
	                    error = ex;
	                }
	            var whereCtx = whereClause._ctx;
	            var table = whereCtx.table;
	            var readingHook = table.hook.reading.fire;
	            this._ctx = {
	                table: table,
	                index: whereCtx.index,
	                isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
	                range: keyRange,
	                keysOnly: false,
	                dir: "next",
	                unique: "",
	                algorithm: null,
	                filter: null,
	                replayFilter: null,
	                justLimit: true,
	                isMatch: null,
	                offset: 0,
	                limit: Infinity,
	                error: error,
	                or: whereCtx.or,
	                valueMapper: readingHook !== mirror ? readingHook : null
	            };
	        });
	    }

	    function simpleCompare(a, b) {
	        return a < b ? -1 : a === b ? 0 : 1;
	    }
	    function simpleCompareReverse(a, b) {
	        return a > b ? -1 : a === b ? 0 : 1;
	    }

	    function fail(collectionOrWhereClause, err, T) {
	        var collection = collectionOrWhereClause instanceof WhereClause ?
	            new collectionOrWhereClause.Collection(collectionOrWhereClause) :
	            collectionOrWhereClause;
	        collection._ctx.error = T ? new T(err) : new TypeError(err);
	        return collection;
	    }
	    function emptyCollection(whereClause) {
	        return new whereClause.Collection(whereClause, function () { return rangeEqual(""); }).limit(0);
	    }
	    function upperFactory(dir) {
	        return dir === "next" ?
	            function (s) { return s.toUpperCase(); } :
	            function (s) { return s.toLowerCase(); };
	    }
	    function lowerFactory(dir) {
	        return dir === "next" ?
	            function (s) { return s.toLowerCase(); } :
	            function (s) { return s.toUpperCase(); };
	    }
	    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
	        var length = Math.min(key.length, lowerNeedle.length);
	        var llp = -1;
	        for (var i = 0; i < length; ++i) {
	            var lwrKeyChar = lowerKey[i];
	            if (lwrKeyChar !== lowerNeedle[i]) {
	                if (cmp(key[i], upperNeedle[i]) < 0)
	                    return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
	                if (cmp(key[i], lowerNeedle[i]) < 0)
	                    return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
	                if (llp >= 0)
	                    return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
	                return null;
	            }
	            if (cmp(key[i], lwrKeyChar) < 0)
	                llp = i;
	        }
	        if (length < lowerNeedle.length && dir === "next")
	            return key + upperNeedle.substr(key.length);
	        if (length < key.length && dir === "prev")
	            return key.substr(0, upperNeedle.length);
	        return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
	    }
	    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
	        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
	        if (!needles.every(function (s) { return typeof s === 'string'; })) {
	            return fail(whereClause, STRING_EXPECTED);
	        }
	        function initDirection(dir) {
	            upper = upperFactory(dir);
	            lower = lowerFactory(dir);
	            compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
	            var needleBounds = needles.map(function (needle) {
	                return { lower: lower(needle), upper: upper(needle) };
	            }).sort(function (a, b) {
	                return compare(a.lower, b.lower);
	            });
	            upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
	            lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
	            direction = dir;
	            nextKeySuffix = (dir === "next" ? "" : suffix);
	        }
	        initDirection("next");
	        var c = new whereClause.Collection(whereClause, function () { return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix); });
	        c._ondirectionchange = function (direction) {
	            initDirection(direction);
	        };
	        var firstPossibleNeedle = 0;
	        c._addAlgorithm(function (cursor, advance, resolve) {
	            var key = cursor.key;
	            if (typeof key !== 'string')
	                return false;
	            var lowerKey = lower(key);
	            if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
	                return true;
	            }
	            else {
	                var lowestPossibleCasing = null;
	                for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
	                    var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
	                    if (casing === null && lowestPossibleCasing === null)
	                        firstPossibleNeedle = i + 1;
	                    else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
	                        lowestPossibleCasing = casing;
	                    }
	                }
	                if (lowestPossibleCasing !== null) {
	                    advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
	                }
	                else {
	                    advance(resolve);
	                }
	                return false;
	            }
	        });
	        return c;
	    }
	    function createRange(lower, upper, lowerOpen, upperOpen) {
	        return {
	            type: 2 ,
	            lower: lower,
	            upper: upper,
	            lowerOpen: lowerOpen,
	            upperOpen: upperOpen
	        };
	    }
	    function rangeEqual(value) {
	        return {
	            type: 1 ,
	            lower: value,
	            upper: value
	        };
	    }

	    var WhereClause =  (function () {
	        function WhereClause() {
	        }
	        Object.defineProperty(WhereClause.prototype, "Collection", {
	            get: function () {
	                return this._ctx.table.db.Collection;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        WhereClause.prototype.between = function (lower, upper, includeLower, includeUpper) {
	            includeLower = includeLower !== false;
	            includeUpper = includeUpper === true;
	            try {
	                if ((this._cmp(lower, upper) > 0) ||
	                    (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
	                    return emptyCollection(this);
	                return new this.Collection(this, function () { return createRange(lower, upper, !includeLower, !includeUpper); });
	            }
	            catch (e) {
	                return fail(this, INVALID_KEY_ARGUMENT);
	            }
	        };
	        WhereClause.prototype.equals = function (value) {
	            if (value == null)
	                return fail(this, INVALID_KEY_ARGUMENT);
	            return new this.Collection(this, function () { return rangeEqual(value); });
	        };
	        WhereClause.prototype.above = function (value) {
	            if (value == null)
	                return fail(this, INVALID_KEY_ARGUMENT);
	            return new this.Collection(this, function () { return createRange(value, undefined, true); });
	        };
	        WhereClause.prototype.aboveOrEqual = function (value) {
	            if (value == null)
	                return fail(this, INVALID_KEY_ARGUMENT);
	            return new this.Collection(this, function () { return createRange(value, undefined, false); });
	        };
	        WhereClause.prototype.below = function (value) {
	            if (value == null)
	                return fail(this, INVALID_KEY_ARGUMENT);
	            return new this.Collection(this, function () { return createRange(undefined, value, false, true); });
	        };
	        WhereClause.prototype.belowOrEqual = function (value) {
	            if (value == null)
	                return fail(this, INVALID_KEY_ARGUMENT);
	            return new this.Collection(this, function () { return createRange(undefined, value); });
	        };
	        WhereClause.prototype.startsWith = function (str) {
	            if (typeof str !== 'string')
	                return fail(this, STRING_EXPECTED);
	            return this.between(str, str + maxString, true, true);
	        };
	        WhereClause.prototype.startsWithIgnoreCase = function (str) {
	            if (str === "")
	                return this.startsWith(str);
	            return addIgnoreCaseAlgorithm(this, function (x, a) { return x.indexOf(a[0]) === 0; }, [str], maxString);
	        };
	        WhereClause.prototype.equalsIgnoreCase = function (str) {
	            return addIgnoreCaseAlgorithm(this, function (x, a) { return x === a[0]; }, [str], "");
	        };
	        WhereClause.prototype.anyOfIgnoreCase = function () {
	            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	            if (set.length === 0)
	                return emptyCollection(this);
	            return addIgnoreCaseAlgorithm(this, function (x, a) { return a.indexOf(x) !== -1; }, set, "");
	        };
	        WhereClause.prototype.startsWithAnyOfIgnoreCase = function () {
	            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	            if (set.length === 0)
	                return emptyCollection(this);
	            return addIgnoreCaseAlgorithm(this, function (x, a) { return a.some(function (n) { return x.indexOf(n) === 0; }); }, set, maxString);
	        };
	        WhereClause.prototype.anyOf = function () {
	            var _this = this;
	            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	            var compare = this._cmp;
	            try {
	                set.sort(compare);
	            }
	            catch (e) {
	                return fail(this, INVALID_KEY_ARGUMENT);
	            }
	            if (set.length === 0)
	                return emptyCollection(this);
	            var c = new this.Collection(this, function () { return createRange(set[0], set[set.length - 1]); });
	            c._ondirectionchange = function (direction) {
	                compare = (direction === "next" ?
	                    _this._ascending :
	                    _this._descending);
	                set.sort(compare);
	            };
	            var i = 0;
	            c._addAlgorithm(function (cursor, advance, resolve) {
	                var key = cursor.key;
	                while (compare(key, set[i]) > 0) {
	                    ++i;
	                    if (i === set.length) {
	                        advance(resolve);
	                        return false;
	                    }
	                }
	                if (compare(key, set[i]) === 0) {
	                    return true;
	                }
	                else {
	                    advance(function () { cursor.continue(set[i]); });
	                    return false;
	                }
	            });
	            return c;
	        };
	        WhereClause.prototype.notEqual = function (value) {
	            return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
	        };
	        WhereClause.prototype.noneOf = function () {
	            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	            if (set.length === 0)
	                return new this.Collection(this);
	            try {
	                set.sort(this._ascending);
	            }
	            catch (e) {
	                return fail(this, INVALID_KEY_ARGUMENT);
	            }
	            var ranges = set.reduce(function (res, val) { return res ?
	                res.concat([[res[res.length - 1][1], val]]) :
	                [[minKey, val]]; }, null);
	            ranges.push([set[set.length - 1], this.db._maxKey]);
	            return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
	        };
	        WhereClause.prototype.inAnyRange = function (ranges, options) {
	            var _this = this;
	            var cmp = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
	            if (ranges.length === 0)
	                return emptyCollection(this);
	            if (!ranges.every(function (range) {
	                return range[0] !== undefined &&
	                    range[1] !== undefined &&
	                    ascending(range[0], range[1]) <= 0;
	            })) {
	                return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
	            }
	            var includeLowers = !options || options.includeLowers !== false;
	            var includeUppers = options && options.includeUppers === true;
	            function addRange(ranges, newRange) {
	                var i = 0, l = ranges.length;
	                for (; i < l; ++i) {
	                    var range = ranges[i];
	                    if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
	                        range[0] = min(range[0], newRange[0]);
	                        range[1] = max(range[1], newRange[1]);
	                        break;
	                    }
	                }
	                if (i === l)
	                    ranges.push(newRange);
	                return ranges;
	            }
	            var sortDirection = ascending;
	            function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
	            var set;
	            try {
	                set = ranges.reduce(addRange, []);
	                set.sort(rangeSorter);
	            }
	            catch (ex) {
	                return fail(this, INVALID_KEY_ARGUMENT);
	            }
	            var rangePos = 0;
	            var keyIsBeyondCurrentEntry = includeUppers ?
	                function (key) { return ascending(key, set[rangePos][1]) > 0; } :
	                function (key) { return ascending(key, set[rangePos][1]) >= 0; };
	            var keyIsBeforeCurrentEntry = includeLowers ?
	                function (key) { return descending(key, set[rangePos][0]) > 0; } :
	                function (key) { return descending(key, set[rangePos][0]) >= 0; };
	            function keyWithinCurrentRange(key) {
	                return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
	            }
	            var checkKey = keyIsBeyondCurrentEntry;
	            var c = new this.Collection(this, function () { return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers); });
	            c._ondirectionchange = function (direction) {
	                if (direction === "next") {
	                    checkKey = keyIsBeyondCurrentEntry;
	                    sortDirection = ascending;
	                }
	                else {
	                    checkKey = keyIsBeforeCurrentEntry;
	                    sortDirection = descending;
	                }
	                set.sort(rangeSorter);
	            };
	            c._addAlgorithm(function (cursor, advance, resolve) {
	                var key = cursor.key;
	                while (checkKey(key)) {
	                    ++rangePos;
	                    if (rangePos === set.length) {
	                        advance(resolve);
	                        return false;
	                    }
	                }
	                if (keyWithinCurrentRange(key)) {
	                    return true;
	                }
	                else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
	                    return false;
	                }
	                else {
	                    advance(function () {
	                        if (sortDirection === ascending)
	                            cursor.continue(set[rangePos][0]);
	                        else
	                            cursor.continue(set[rangePos][1]);
	                    });
	                    return false;
	                }
	            });
	            return c;
	        };
	        WhereClause.prototype.startsWithAnyOf = function () {
	            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	            if (!set.every(function (s) { return typeof s === 'string'; })) {
	                return fail(this, "startsWithAnyOf() only works with strings");
	            }
	            if (set.length === 0)
	                return emptyCollection(this);
	            return this.inAnyRange(set.map(function (str) { return [str, str + maxString]; }));
	        };
	        return WhereClause;
	    }());

	    function createWhereClauseConstructor(db) {
	        return makeClassConstructor(WhereClause.prototype, function WhereClause(table, index, orCollection) {
	            this.db = db;
	            this._ctx = {
	                table: table,
	                index: index === ":id" ? null : index,
	                or: orCollection
	            };
	            this._cmp = this._ascending = cmp;
	            this._descending = function (a, b) { return cmp(b, a); };
	            this._max = function (a, b) { return cmp(a, b) > 0 ? a : b; };
	            this._min = function (a, b) { return cmp(a, b) < 0 ? a : b; };
	            this._IDBKeyRange = db._deps.IDBKeyRange;
	            if (!this._IDBKeyRange)
	                throw new exceptions.MissingAPI();
	        });
	    }

	    function eventRejectHandler(reject) {
	        return wrap(function (event) {
	            preventDefault(event);
	            reject(event.target.error);
	            return false;
	        });
	    }
	    function preventDefault(event) {
	        if (event.stopPropagation)
	            event.stopPropagation();
	        if (event.preventDefault)
	            event.preventDefault();
	    }

	    var DEXIE_STORAGE_MUTATED_EVENT_NAME = 'storagemutated';
	    var STORAGE_MUTATED_DOM_EVENT_NAME = 'x-storagemutated-1';
	    var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);

	    var Transaction =  (function () {
	        function Transaction() {
	        }
	        Transaction.prototype._lock = function () {
	            assert(!PSD.global);
	            ++this._reculock;
	            if (this._reculock === 1 && !PSD.global)
	                PSD.lockOwnerFor = this;
	            return this;
	        };
	        Transaction.prototype._unlock = function () {
	            assert(!PSD.global);
	            if (--this._reculock === 0) {
	                if (!PSD.global)
	                    PSD.lockOwnerFor = null;
	                while (this._blockedFuncs.length > 0 && !this._locked()) {
	                    var fnAndPSD = this._blockedFuncs.shift();
	                    try {
	                        usePSD(fnAndPSD[1], fnAndPSD[0]);
	                    }
	                    catch (e) { }
	                }
	            }
	            return this;
	        };
	        Transaction.prototype._locked = function () {
	            return this._reculock && PSD.lockOwnerFor !== this;
	        };
	        Transaction.prototype.create = function (idbtrans) {
	            var _this = this;
	            if (!this.mode)
	                return this;
	            var idbdb = this.db.idbdb;
	            var dbOpenError = this.db._state.dbOpenError;
	            assert(!this.idbtrans);
	            if (!idbtrans && !idbdb) {
	                switch (dbOpenError && dbOpenError.name) {
	                    case "DatabaseClosedError":
	                        throw new exceptions.DatabaseClosed(dbOpenError);
	                    case "MissingAPIError":
	                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
	                    default:
	                        throw new exceptions.OpenFailed(dbOpenError);
	                }
	            }
	            if (!this.active)
	                throw new exceptions.TransactionInactive();
	            assert(this._completion._state === null);
	            idbtrans = this.idbtrans = idbtrans ||
	                (this.db.core
	                    ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })
	                    : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
	            idbtrans.onerror = wrap(function (ev) {
	                preventDefault(ev);
	                _this._reject(idbtrans.error);
	            });
	            idbtrans.onabort = wrap(function (ev) {
	                preventDefault(ev);
	                _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
	                _this.active = false;
	                _this.on("abort").fire(ev);
	            });
	            idbtrans.oncomplete = wrap(function () {
	                _this.active = false;
	                _this._resolve();
	                if ('mutatedParts' in idbtrans) {
	                    globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
	                }
	            });
	            return this;
	        };
	        Transaction.prototype._promise = function (mode, fn, bWriteLock) {
	            var _this = this;
	            if (mode === 'readwrite' && this.mode !== 'readwrite')
	                return rejection(new exceptions.ReadOnly("Transaction is readonly"));
	            if (!this.active)
	                return rejection(new exceptions.TransactionInactive());
	            if (this._locked()) {
	                return new DexiePromise(function (resolve, reject) {
	                    _this._blockedFuncs.push([function () {
	                            _this._promise(mode, fn, bWriteLock).then(resolve, reject);
	                        }, PSD]);
	                });
	            }
	            else if (bWriteLock) {
	                return newScope(function () {
	                    var p = new DexiePromise(function (resolve, reject) {
	                        _this._lock();
	                        var rv = fn(resolve, reject, _this);
	                        if (rv && rv.then)
	                            rv.then(resolve, reject);
	                    });
	                    p.finally(function () { return _this._unlock(); });
	                    p._lib = true;
	                    return p;
	                });
	            }
	            else {
	                var p = new DexiePromise(function (resolve, reject) {
	                    var rv = fn(resolve, reject, _this);
	                    if (rv && rv.then)
	                        rv.then(resolve, reject);
	                });
	                p._lib = true;
	                return p;
	            }
	        };
	        Transaction.prototype._root = function () {
	            return this.parent ? this.parent._root() : this;
	        };
	        Transaction.prototype.waitFor = function (promiseLike) {
	            var root = this._root();
	            var promise = DexiePromise.resolve(promiseLike);
	            if (root._waitingFor) {
	                root._waitingFor = root._waitingFor.then(function () { return promise; });
	            }
	            else {
	                root._waitingFor = promise;
	                root._waitingQueue = [];
	                var store = root.idbtrans.objectStore(root.storeNames[0]);
	                (function spin() {
	                    ++root._spinCount;
	                    while (root._waitingQueue.length)
	                        (root._waitingQueue.shift())();
	                    if (root._waitingFor)
	                        store.get(-Infinity).onsuccess = spin;
	                }());
	            }
	            var currentWaitPromise = root._waitingFor;
	            return new DexiePromise(function (resolve, reject) {
	                promise.then(function (res) { return root._waitingQueue.push(wrap(resolve.bind(null, res))); }, function (err) { return root._waitingQueue.push(wrap(reject.bind(null, err))); }).finally(function () {
	                    if (root._waitingFor === currentWaitPromise) {
	                        root._waitingFor = null;
	                    }
	                });
	            });
	        };
	        Transaction.prototype.abort = function () {
	            if (this.active) {
	                this.active = false;
	                if (this.idbtrans)
	                    this.idbtrans.abort();
	                this._reject(new exceptions.Abort());
	            }
	        };
	        Transaction.prototype.table = function (tableName) {
	            var memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
	            if (hasOwn(memoizedTables, tableName))
	                return memoizedTables[tableName];
	            var tableSchema = this.schema[tableName];
	            if (!tableSchema) {
	                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
	            }
	            var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
	            transactionBoundTable.core = this.db.core.table(tableName);
	            memoizedTables[tableName] = transactionBoundTable;
	            return transactionBoundTable;
	        };
	        return Transaction;
	    }());

	    function createTransactionConstructor(db) {
	        return makeClassConstructor(Transaction.prototype, function Transaction(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
	            var _this = this;
	            this.db = db;
	            this.mode = mode;
	            this.storeNames = storeNames;
	            this.schema = dbschema;
	            this.chromeTransactionDurability = chromeTransactionDurability;
	            this.idbtrans = null;
	            this.on = Events(this, "complete", "error", "abort");
	            this.parent = parent || null;
	            this.active = true;
	            this._reculock = 0;
	            this._blockedFuncs = [];
	            this._resolve = null;
	            this._reject = null;
	            this._waitingFor = null;
	            this._waitingQueue = null;
	            this._spinCount = 0;
	            this._completion = new DexiePromise(function (resolve, reject) {
	                _this._resolve = resolve;
	                _this._reject = reject;
	            });
	            this._completion.then(function () {
	                _this.active = false;
	                _this.on.complete.fire();
	            }, function (e) {
	                var wasActive = _this.active;
	                _this.active = false;
	                _this.on.error.fire(e);
	                _this.parent ?
	                    _this.parent._reject(e) :
	                    wasActive && _this.idbtrans && _this.idbtrans.abort();
	                return rejection(e);
	            });
	        });
	    }

	    function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
	        return {
	            name: name,
	            keyPath: keyPath,
	            unique: unique,
	            multi: multi,
	            auto: auto,
	            compound: compound,
	            src: (unique && !isPrimKey ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
	        };
	    }
	    function nameFromKeyPath(keyPath) {
	        return typeof keyPath === 'string' ?
	            keyPath :
	            keyPath ? ('[' + [].join.call(keyPath, '+') + ']') : "";
	    }

	    function createTableSchema(name, primKey, indexes) {
	        return {
	            name: name,
	            primKey: primKey,
	            indexes: indexes,
	            mappedClass: null,
	            idxByName: arrayToObject(indexes, function (index) { return [index.name, index]; })
	        };
	    }

	    function safariMultiStoreFix(storeNames) {
	        return storeNames.length === 1 ? storeNames[0] : storeNames;
	    }
	    var getMaxKey = function (IdbKeyRange) {
	        try {
	            IdbKeyRange.only([[]]);
	            getMaxKey = function () { return [[]]; };
	            return [[]];
	        }
	        catch (e) {
	            getMaxKey = function () { return maxString; };
	            return maxString;
	        }
	    };

	    function getKeyExtractor(keyPath) {
	        if (keyPath == null) {
	            return function () { return undefined; };
	        }
	        else if (typeof keyPath === 'string') {
	            return getSinglePathKeyExtractor(keyPath);
	        }
	        else {
	            return function (obj) { return getByKeyPath(obj, keyPath); };
	        }
	    }
	    function getSinglePathKeyExtractor(keyPath) {
	        var split = keyPath.split('.');
	        if (split.length === 1) {
	            return function (obj) { return obj[keyPath]; };
	        }
	        else {
	            return function (obj) { return getByKeyPath(obj, keyPath); };
	        }
	    }

	    function arrayify(arrayLike) {
	        return [].slice.call(arrayLike);
	    }
	    var _id_counter = 0;
	    function getKeyPathAlias(keyPath) {
	        return keyPath == null ?
	            ":id" :
	            typeof keyPath === 'string' ?
	                keyPath :
	                "[".concat(keyPath.join('+'), "]");
	    }
	    function createDBCore(db, IdbKeyRange, tmpTrans) {
	        function extractSchema(db, trans) {
	            var tables = arrayify(db.objectStoreNames);
	            return {
	                schema: {
	                    name: db.name,
	                    tables: tables.map(function (table) { return trans.objectStore(table); }).map(function (store) {
	                        var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
	                        var compound = isArray(keyPath);
	                        var outbound = keyPath == null;
	                        var indexByKeyPath = {};
	                        var result = {
	                            name: store.name,
	                            primaryKey: {
	                                name: null,
	                                isPrimaryKey: true,
	                                outbound: outbound,
	                                compound: compound,
	                                keyPath: keyPath,
	                                autoIncrement: autoIncrement,
	                                unique: true,
	                                extractKey: getKeyExtractor(keyPath)
	                            },
	                            indexes: arrayify(store.indexNames).map(function (indexName) { return store.index(indexName); })
	                                .map(function (index) {
	                                var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath = index.keyPath;
	                                var compound = isArray(keyPath);
	                                var result = {
	                                    name: name,
	                                    compound: compound,
	                                    keyPath: keyPath,
	                                    unique: unique,
	                                    multiEntry: multiEntry,
	                                    extractKey: getKeyExtractor(keyPath)
	                                };
	                                indexByKeyPath[getKeyPathAlias(keyPath)] = result;
	                                return result;
	                            }),
	                            getIndexByKeyPath: function (keyPath) { return indexByKeyPath[getKeyPathAlias(keyPath)]; }
	                        };
	                        indexByKeyPath[":id"] = result.primaryKey;
	                        if (keyPath != null) {
	                            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
	                        }
	                        return result;
	                    })
	                },
	                hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
	                    !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
	                        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
	                        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
	            };
	        }
	        function makeIDBKeyRange(range) {
	            if (range.type === 3 )
	                return null;
	            if (range.type === 4 )
	                throw new Error("Cannot convert never type to IDBKeyRange");
	            var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
	            var idbRange = lower === undefined ?
	                upper === undefined ?
	                    null :
	                    IdbKeyRange.upperBound(upper, !!upperOpen) :
	                upper === undefined ?
	                    IdbKeyRange.lowerBound(lower, !!lowerOpen) :
	                    IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
	            return idbRange;
	        }
	        function createDbCoreTable(tableSchema) {
	            var tableName = tableSchema.name;
	            function mutate(_a) {
	                var trans = _a.trans, type = _a.type, keys = _a.keys, values = _a.values, range = _a.range;
	                return new Promise(function (resolve, reject) {
	                    resolve = wrap(resolve);
	                    var store = trans.objectStore(tableName);
	                    var outbound = store.keyPath == null;
	                    var isAddOrPut = type === "put" || type === "add";
	                    if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
	                        throw new Error("Invalid operation type: " + type);
	                    var length = (keys || values || { length: 1 }).length;
	                    if (keys && values && keys.length !== values.length) {
	                        throw new Error("Given keys array must have same length as given values array.");
	                    }
	                    if (length === 0)
	                        return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
	                    var req;
	                    var reqs = [];
	                    var failures = [];
	                    var numFailures = 0;
	                    var errorHandler = function (event) {
	                        ++numFailures;
	                        preventDefault(event);
	                    };
	                    if (type === 'deleteRange') {
	                        if (range.type === 4 )
	                            return resolve({ numFailures: numFailures, failures: failures, results: [], lastResult: undefined });
	                        if (range.type === 3 )
	                            reqs.push(req = store.clear());
	                        else
	                            reqs.push(req = store.delete(makeIDBKeyRange(range)));
	                    }
	                    else {
	                        var _a = isAddOrPut ?
	                            outbound ?
	                                [values, keys] :
	                                [values, null] :
	                            [keys, null], args1 = _a[0], args2 = _a[1];
	                        if (isAddOrPut) {
	                            for (var i = 0; i < length; ++i) {
	                                reqs.push(req = (args2 && args2[i] !== undefined ?
	                                    store[type](args1[i], args2[i]) :
	                                    store[type](args1[i])));
	                                req.onerror = errorHandler;
	                            }
	                        }
	                        else {
	                            for (var i = 0; i < length; ++i) {
	                                reqs.push(req = store[type](args1[i]));
	                                req.onerror = errorHandler;
	                            }
	                        }
	                    }
	                    var done = function (event) {
	                        var lastResult = event.target.result;
	                        reqs.forEach(function (req, i) { return req.error != null && (failures[i] = req.error); });
	                        resolve({
	                            numFailures: numFailures,
	                            failures: failures,
	                            results: type === "delete" ? keys : reqs.map(function (req) { return req.result; }),
	                            lastResult: lastResult
	                        });
	                    };
	                    req.onerror = function (event) {
	                        errorHandler(event);
	                        done(event);
	                    };
	                    req.onsuccess = done;
	                });
	            }
	            function openCursor(_a) {
	                var trans = _a.trans, values = _a.values, query = _a.query, reverse = _a.reverse, unique = _a.unique;
	                return new Promise(function (resolve, reject) {
	                    resolve = wrap(resolve);
	                    var index = query.index, range = query.range;
	                    var store = trans.objectStore(tableName);
	                    var source = index.isPrimaryKey ?
	                        store :
	                        store.index(index.name);
	                    var direction = reverse ?
	                        unique ?
	                            "prevunique" :
	                            "prev" :
	                        unique ?
	                            "nextunique" :
	                            "next";
	                    var req = values || !('openKeyCursor' in source) ?
	                        source.openCursor(makeIDBKeyRange(range), direction) :
	                        source.openKeyCursor(makeIDBKeyRange(range), direction);
	                    req.onerror = eventRejectHandler(reject);
	                    req.onsuccess = wrap(function (ev) {
	                        var cursor = req.result;
	                        if (!cursor) {
	                            resolve(null);
	                            return;
	                        }
	                        cursor.___id = ++_id_counter;
	                        cursor.done = false;
	                        var _cursorContinue = cursor.continue.bind(cursor);
	                        var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
	                        if (_cursorContinuePrimaryKey)
	                            _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
	                        var _cursorAdvance = cursor.advance.bind(cursor);
	                        var doThrowCursorIsNotStarted = function () { throw new Error("Cursor not started"); };
	                        var doThrowCursorIsStopped = function () { throw new Error("Cursor not stopped"); };
	                        cursor.trans = trans;
	                        cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
	                        cursor.fail = wrap(reject);
	                        cursor.next = function () {
	                            var _this = this;
	                            var gotOne = 1;
	                            return this.start(function () { return gotOne-- ? _this.continue() : _this.stop(); }).then(function () { return _this; });
	                        };
	                        cursor.start = function (callback) {
	                            var iterationPromise = new Promise(function (resolveIteration, rejectIteration) {
	                                resolveIteration = wrap(resolveIteration);
	                                req.onerror = eventRejectHandler(rejectIteration);
	                                cursor.fail = rejectIteration;
	                                cursor.stop = function (value) {
	                                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
	                                    resolveIteration(value);
	                                };
	                            });
	                            var guardedCallback = function () {
	                                if (req.result) {
	                                    try {
	                                        callback();
	                                    }
	                                    catch (err) {
	                                        cursor.fail(err);
	                                    }
	                                }
	                                else {
	                                    cursor.done = true;
	                                    cursor.start = function () { throw new Error("Cursor behind last entry"); };
	                                    cursor.stop();
	                                }
	                            };
	                            req.onsuccess = wrap(function (ev) {
	                                req.onsuccess = guardedCallback;
	                                guardedCallback();
	                            });
	                            cursor.continue = _cursorContinue;
	                            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
	                            cursor.advance = _cursorAdvance;
	                            guardedCallback();
	                            return iterationPromise;
	                        };
	                        resolve(cursor);
	                    }, reject);
	                });
	            }
	            function query(hasGetAll) {
	                return function (request) {
	                    return new Promise(function (resolve, reject) {
	                        resolve = wrap(resolve);
	                        var trans = request.trans, values = request.values, limit = request.limit, query = request.query;
	                        var nonInfinitLimit = limit === Infinity ? undefined : limit;
	                        var index = query.index, range = query.range;
	                        var store = trans.objectStore(tableName);
	                        var source = index.isPrimaryKey ? store : store.index(index.name);
	                        var idbKeyRange = makeIDBKeyRange(range);
	                        if (limit === 0)
	                            return resolve({ result: [] });
	                        if (hasGetAll) {
	                            var req = values ?
	                                source.getAll(idbKeyRange, nonInfinitLimit) :
	                                source.getAllKeys(idbKeyRange, nonInfinitLimit);
	                            req.onsuccess = function (event) { return resolve({ result: event.target.result }); };
	                            req.onerror = eventRejectHandler(reject);
	                        }
	                        else {
	                            var count_1 = 0;
	                            var req_1 = values || !('openKeyCursor' in source) ?
	                                source.openCursor(idbKeyRange) :
	                                source.openKeyCursor(idbKeyRange);
	                            var result_1 = [];
	                            req_1.onsuccess = function (event) {
	                                var cursor = req_1.result;
	                                if (!cursor)
	                                    return resolve({ result: result_1 });
	                                result_1.push(values ? cursor.value : cursor.primaryKey);
	                                if (++count_1 === limit)
	                                    return resolve({ result: result_1 });
	                                cursor.continue();
	                            };
	                            req_1.onerror = eventRejectHandler(reject);
	                        }
	                    });
	                };
	            }
	            return {
	                name: tableName,
	                schema: tableSchema,
	                mutate: mutate,
	                getMany: function (_a) {
	                    var trans = _a.trans, keys = _a.keys;
	                    return new Promise(function (resolve, reject) {
	                        resolve = wrap(resolve);
	                        var store = trans.objectStore(tableName);
	                        var length = keys.length;
	                        var result = new Array(length);
	                        var keyCount = 0;
	                        var callbackCount = 0;
	                        var req;
	                        var successHandler = function (event) {
	                            var req = event.target;
	                            if ((result[req._pos] = req.result) != null)
	                                ;
	                            if (++callbackCount === keyCount)
	                                resolve(result);
	                        };
	                        var errorHandler = eventRejectHandler(reject);
	                        for (var i = 0; i < length; ++i) {
	                            var key = keys[i];
	                            if (key != null) {
	                                req = store.get(keys[i]);
	                                req._pos = i;
	                                req.onsuccess = successHandler;
	                                req.onerror = errorHandler;
	                                ++keyCount;
	                            }
	                        }
	                        if (keyCount === 0)
	                            resolve(result);
	                    });
	                },
	                get: function (_a) {
	                    var trans = _a.trans, key = _a.key;
	                    return new Promise(function (resolve, reject) {
	                        resolve = wrap(resolve);
	                        var store = trans.objectStore(tableName);
	                        var req = store.get(key);
	                        req.onsuccess = function (event) { return resolve(event.target.result); };
	                        req.onerror = eventRejectHandler(reject);
	                    });
	                },
	                query: query(hasGetAll),
	                openCursor: openCursor,
	                count: function (_a) {
	                    var query = _a.query, trans = _a.trans;
	                    var index = query.index, range = query.range;
	                    return new Promise(function (resolve, reject) {
	                        var store = trans.objectStore(tableName);
	                        var source = index.isPrimaryKey ? store : store.index(index.name);
	                        var idbKeyRange = makeIDBKeyRange(range);
	                        var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
	                        req.onsuccess = wrap(function (ev) { return resolve(ev.target.result); });
	                        req.onerror = eventRejectHandler(reject);
	                    });
	                }
	            };
	        }
	        var _a = extractSchema(db, tmpTrans), schema = _a.schema, hasGetAll = _a.hasGetAll;
	        var tables = schema.tables.map(function (tableSchema) { return createDbCoreTable(tableSchema); });
	        var tableMap = {};
	        tables.forEach(function (table) { return tableMap[table.name] = table; });
	        return {
	            stack: "dbcore",
	            transaction: db.transaction.bind(db),
	            table: function (name) {
	                var result = tableMap[name];
	                if (!result)
	                    throw new Error("Table '".concat(name, "' not found"));
	                return tableMap[name];
	            },
	            MIN_KEY: -Infinity,
	            MAX_KEY: getMaxKey(IdbKeyRange),
	            schema: schema
	        };
	    }

	    function createMiddlewareStack(stackImpl, middlewares) {
	        return middlewares.reduce(function (down, _a) {
	            var create = _a.create;
	            return (__assign(__assign({}, down), create(down)));
	        }, stackImpl);
	    }
	    function createMiddlewareStacks(middlewares, idbdb, _a, tmpTrans) {
	        var IDBKeyRange = _a.IDBKeyRange; _a.indexedDB;
	        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
	        return {
	            dbcore: dbcore
	        };
	    }
	    function generateMiddlewareStacks(db, tmpTrans) {
	        var idbdb = tmpTrans.db;
	        var stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
	        db.core = stacks.dbcore;
	        db.tables.forEach(function (table) {
	            var tableName = table.name;
	            if (db.core.schema.tables.some(function (tbl) { return tbl.name === tableName; })) {
	                table.core = db.core.table(tableName);
	                if (db[tableName] instanceof db.Table) {
	                    db[tableName].core = table.core;
	                }
	            }
	        });
	    }

	    function setApiOnPlace(db, objs, tableNames, dbschema) {
	        tableNames.forEach(function (tableName) {
	            var schema = dbschema[tableName];
	            objs.forEach(function (obj) {
	                var propDesc = getPropertyDescriptor(obj, tableName);
	                if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
	                    if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
	                        setProp(obj, tableName, {
	                            get: function () { return this.table(tableName); },
	                            set: function (value) {
	                                defineProperty(this, tableName, { value: value, writable: true, configurable: true, enumerable: true });
	                            }
	                        });
	                    }
	                    else {
	                        obj[tableName] = new db.Table(tableName, schema);
	                    }
	                }
	            });
	        });
	    }
	    function removeTablesApi(db, objs) {
	        objs.forEach(function (obj) {
	            for (var key in obj) {
	                if (obj[key] instanceof db.Table)
	                    delete obj[key];
	            }
	        });
	    }
	    function lowerVersionFirst(a, b) {
	        return a._cfg.version - b._cfg.version;
	    }
	    function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
	        var globalSchema = db._dbSchema;
	        if (idbUpgradeTrans.objectStoreNames.contains('$meta') && !globalSchema.$meta) {
	            globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
	            db._storeNames.push('$meta');
	        }
	        var trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
	        trans.create(idbUpgradeTrans);
	        trans._completion.catch(reject);
	        var rejectTransaction = trans._reject.bind(trans);
	        var transless = PSD.transless || PSD;
	        newScope(function () {
	            PSD.trans = trans;
	            PSD.transless = transless;
	            if (oldVersion === 0) {
	                keys(globalSchema).forEach(function (tableName) {
	                    createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
	                });
	                generateMiddlewareStacks(db, idbUpgradeTrans);
	                DexiePromise.follow(function () { return db.on.populate.fire(trans); }).catch(rejectTransaction);
	            }
	            else {
	                generateMiddlewareStacks(db, idbUpgradeTrans);
	                return getExistingVersion(db, trans, oldVersion)
	                    .then(function (oldVersion) { return updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans); })
	                    .catch(rejectTransaction);
	            }
	        });
	    }
	    function patchCurrentVersion(db, idbUpgradeTrans) {
	        createMissingTables(db._dbSchema, idbUpgradeTrans);
	        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains('$meta')) {
	            idbUpgradeTrans.db.createObjectStore('$meta').add(Math.ceil((idbUpgradeTrans.db.version / 10) - 1), 'version');
	        }
	        var globalSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
	        adjustToExistingIndexNames(db, db._dbSchema, idbUpgradeTrans);
	        var diff = getSchemaDiff(globalSchema, db._dbSchema);
	        var _loop_1 = function (tableChange) {
	            if (tableChange.change.length || tableChange.recreate) {
	                console.warn("Unable to patch indexes of table ".concat(tableChange.name, " because it has changes on the type of index or primary key."));
	                return { value: void 0 };
	            }
	            var store = idbUpgradeTrans.objectStore(tableChange.name);
	            tableChange.add.forEach(function (idx) {
	                if (debug)
	                    console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange.name, ".").concat(idx.src));
	                addIndex(store, idx);
	            });
	        };
	        for (var _i = 0, _a = diff.change; _i < _a.length; _i++) {
	            var tableChange = _a[_i];
	            var state_1 = _loop_1(tableChange);
	            if (typeof state_1 === "object")
	                return state_1.value;
	        }
	    }
	    function getExistingVersion(db, trans, oldVersion) {
	        if (trans.storeNames.includes('$meta')) {
	            return trans.table('$meta').get('version').then(function (metaVersion) {
	                return metaVersion != null ? metaVersion : oldVersion;
	            });
	        }
	        else {
	            return DexiePromise.resolve(oldVersion);
	        }
	    }
	    function updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans) {
	        var queue = [];
	        var versions = db._versions;
	        var globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
	        var versToRun = versions.filter(function (v) { return v._cfg.version >= oldVersion; });
	        if (versToRun.length === 0) {
	            return DexiePromise.resolve();
	        }
	        versToRun.forEach(function (version) {
	            queue.push(function () {
	                var oldSchema = globalSchema;
	                var newSchema = version._cfg.dbschema;
	                adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
	                adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
	                globalSchema = db._dbSchema = newSchema;
	                var diff = getSchemaDiff(oldSchema, newSchema);
	                diff.add.forEach(function (tuple) {
	                    createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
	                });
	                diff.change.forEach(function (change) {
	                    if (change.recreate) {
	                        throw new exceptions.Upgrade("Not yet support for changing primary key");
	                    }
	                    else {
	                        var store_1 = idbUpgradeTrans.objectStore(change.name);
	                        change.add.forEach(function (idx) { return addIndex(store_1, idx); });
	                        change.change.forEach(function (idx) {
	                            store_1.deleteIndex(idx.name);
	                            addIndex(store_1, idx);
	                        });
	                        change.del.forEach(function (idxName) { return store_1.deleteIndex(idxName); });
	                    }
	                });
	                var contentUpgrade = version._cfg.contentUpgrade;
	                if (contentUpgrade && version._cfg.version > oldVersion) {
	                    generateMiddlewareStacks(db, idbUpgradeTrans);
	                    trans._memoizedTables = {};
	                    var upgradeSchema_1 = shallowClone(newSchema);
	                    diff.del.forEach(function (table) {
	                        upgradeSchema_1[table] = oldSchema[table];
	                    });
	                    removeTablesApi(db, [db.Transaction.prototype]);
	                    setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
	                    trans.schema = upgradeSchema_1;
	                    var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
	                    if (contentUpgradeIsAsync_1) {
	                        incrementExpectedAwaits();
	                    }
	                    var returnValue_1;
	                    var promiseFollowed = DexiePromise.follow(function () {
	                        returnValue_1 = contentUpgrade(trans);
	                        if (returnValue_1) {
	                            if (contentUpgradeIsAsync_1) {
	                                var decrementor = decrementExpectedAwaits.bind(null, null);
	                                returnValue_1.then(decrementor, decrementor);
	                            }
	                        }
	                    });
	                    return (returnValue_1 && typeof returnValue_1.then === 'function' ?
	                        DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function () { return returnValue_1; }));
	                }
	            });
	            queue.push(function (idbtrans) {
	                var newSchema = version._cfg.dbschema;
	                deleteRemovedTables(newSchema, idbtrans);
	                removeTablesApi(db, [db.Transaction.prototype]);
	                setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
	                trans.schema = db._dbSchema;
	            });
	            queue.push(function (idbtrans) {
	                if (db.idbdb.objectStoreNames.contains('$meta')) {
	                    if (Math.ceil(db.idbdb.version / 10) === version._cfg.version) {
	                        db.idbdb.deleteObjectStore('$meta');
	                        delete db._dbSchema.$meta;
	                        db._storeNames = db._storeNames.filter(function (name) { return name !== '$meta'; });
	                    }
	                    else {
	                        idbtrans.objectStore('$meta').put(version._cfg.version, 'version');
	                    }
	                }
	            });
	        });
	        function runQueue() {
	            return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
	                DexiePromise.resolve();
	        }
	        return runQueue().then(function () {
	            createMissingTables(globalSchema, idbUpgradeTrans);
	        });
	    }
	    function getSchemaDiff(oldSchema, newSchema) {
	        var diff = {
	            del: [],
	            add: [],
	            change: []
	        };
	        var table;
	        for (table in oldSchema) {
	            if (!newSchema[table])
	                diff.del.push(table);
	        }
	        for (table in newSchema) {
	            var oldDef = oldSchema[table], newDef = newSchema[table];
	            if (!oldDef) {
	                diff.add.push([table, newDef]);
	            }
	            else {
	                var change = {
	                    name: table,
	                    def: newDef,
	                    recreate: false,
	                    del: [],
	                    add: [],
	                    change: []
	                };
	                if ((
	                '' + (oldDef.primKey.keyPath || '')) !== ('' + (newDef.primKey.keyPath || '')) ||
	                    (oldDef.primKey.auto !== newDef.primKey.auto)) {
	                    change.recreate = true;
	                    diff.change.push(change);
	                }
	                else {
	                    var oldIndexes = oldDef.idxByName;
	                    var newIndexes = newDef.idxByName;
	                    var idxName = void 0;
	                    for (idxName in oldIndexes) {
	                        if (!newIndexes[idxName])
	                            change.del.push(idxName);
	                    }
	                    for (idxName in newIndexes) {
	                        var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
	                        if (!oldIdx)
	                            change.add.push(newIdx);
	                        else if (oldIdx.src !== newIdx.src)
	                            change.change.push(newIdx);
	                    }
	                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
	                        diff.change.push(change);
	                    }
	                }
	            }
	        }
	        return diff;
	    }
	    function createTable(idbtrans, tableName, primKey, indexes) {
	        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ?
	            { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
	            { autoIncrement: primKey.auto });
	        indexes.forEach(function (idx) { return addIndex(store, idx); });
	        return store;
	    }
	    function createMissingTables(newSchema, idbtrans) {
	        keys(newSchema).forEach(function (tableName) {
	            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
	                if (debug)
	                    console.debug('Dexie: Creating missing table', tableName);
	                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
	            }
	        });
	    }
	    function deleteRemovedTables(newSchema, idbtrans) {
	        [].slice.call(idbtrans.db.objectStoreNames).forEach(function (storeName) {
	            return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
	        });
	    }
	    function addIndex(store, idx) {
	        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
	    }
	    function buildGlobalSchema(db, idbdb, tmpTrans) {
	        var globalSchema = {};
	        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
	        dbStoreNames.forEach(function (storeName) {
	            var store = tmpTrans.objectStore(storeName);
	            var keyPath = store.keyPath;
	            var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
	            var indexes = [];
	            for (var j = 0; j < store.indexNames.length; ++j) {
	                var idbindex = store.index(store.indexNames[j]);
	                keyPath = idbindex.keyPath;
	                var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
	                indexes.push(index);
	            }
	            globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
	        });
	        return globalSchema;
	    }
	    function readGlobalSchema(db, idbdb, tmpTrans) {
	        db.verno = idbdb.version / 10;
	        var globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
	        db._storeNames = slice(idbdb.objectStoreNames, 0);
	        setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
	    }
	    function verifyInstalledSchema(db, tmpTrans) {
	        var installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
	        var diff = getSchemaDiff(installedSchema, db._dbSchema);
	        return !(diff.add.length || diff.change.some(function (ch) { return ch.add.length || ch.change.length; }));
	    }
	    function adjustToExistingIndexNames(db, schema, idbtrans) {
	        var storeNames = idbtrans.db.objectStoreNames;
	        for (var i = 0; i < storeNames.length; ++i) {
	            var storeName = storeNames[i];
	            var store = idbtrans.objectStore(storeName);
	            db._hasGetAll = 'getAll' in store;
	            for (var j = 0; j < store.indexNames.length; ++j) {
	                var indexName = store.indexNames[j];
	                var keyPath = store.index(indexName).keyPath;
	                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
	                if (schema[storeName]) {
	                    var indexSpec = schema[storeName].idxByName[dexieName];
	                    if (indexSpec) {
	                        indexSpec.name = indexName;
	                        delete schema[storeName].idxByName[dexieName];
	                        schema[storeName].idxByName[indexName] = indexSpec;
	                    }
	                }
	            }
	        }
	        if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
	            !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
	            _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
	            [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
	            db._hasGetAll = false;
	        }
	    }
	    function parseIndexSyntax(primKeyAndIndexes) {
	        return primKeyAndIndexes.split(',').map(function (index, indexNum) {
	            index = index.trim();
	            var name = index.replace(/([&*]|\+\+)/g, "");
	            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
	            return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0);
	        });
	    }

	    var Version =  (function () {
	        function Version() {
	        }
	        Version.prototype._parseStoresSpec = function (stores, outSchema) {
	            keys(stores).forEach(function (tableName) {
	                if (stores[tableName] !== null) {
	                    var indexes = parseIndexSyntax(stores[tableName]);
	                    var primKey = indexes.shift();
	                    primKey.unique = true;
	                    if (primKey.multi)
	                        throw new exceptions.Schema("Primary key cannot be multi-valued");
	                    indexes.forEach(function (idx) {
	                        if (idx.auto)
	                            throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
	                        if (!idx.keyPath)
	                            throw new exceptions.Schema("Index must have a name and cannot be an empty string");
	                    });
	                    outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
	                }
	            });
	        };
	        Version.prototype.stores = function (stores) {
	            var db = this.db;
	            this._cfg.storesSource = this._cfg.storesSource ?
	                extend(this._cfg.storesSource, stores) :
	                stores;
	            var versions = db._versions;
	            var storesSpec = {};
	            var dbschema = {};
	            versions.forEach(function (version) {
	                extend(storesSpec, version._cfg.storesSource);
	                dbschema = (version._cfg.dbschema = {});
	                version._parseStoresSpec(storesSpec, dbschema);
	            });
	            db._dbSchema = dbschema;
	            removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
	            setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
	            db._storeNames = keys(dbschema);
	            return this;
	        };
	        Version.prototype.upgrade = function (upgradeFunction) {
	            this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
	            return this;
	        };
	        return Version;
	    }());

	    function createVersionConstructor(db) {
	        return makeClassConstructor(Version.prototype, function Version(versionNumber) {
	            this.db = db;
	            this._cfg = {
	                version: versionNumber,
	                storesSource: null,
	                dbschema: {},
	                tables: {},
	                contentUpgrade: null
	            };
	        });
	    }

	    function getDbNamesTable(indexedDB, IDBKeyRange) {
	        var dbNamesDB = indexedDB["_dbNamesDB"];
	        if (!dbNamesDB) {
	            dbNamesDB = indexedDB["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
	                addons: [],
	                indexedDB: indexedDB,
	                IDBKeyRange: IDBKeyRange,
	            });
	            dbNamesDB.version(1).stores({ dbnames: "name" });
	        }
	        return dbNamesDB.table("dbnames");
	    }
	    function hasDatabasesNative(indexedDB) {
	        return indexedDB && typeof indexedDB.databases === "function";
	    }
	    function getDatabaseNames(_a) {
	        var indexedDB = _a.indexedDB, IDBKeyRange = _a.IDBKeyRange;
	        return hasDatabasesNative(indexedDB)
	            ? Promise.resolve(indexedDB.databases()).then(function (infos) {
	                return infos
	                    .map(function (info) { return info.name; })
	                    .filter(function (name) { return name !== DBNAMES_DB; });
	            })
	            : getDbNamesTable(indexedDB, IDBKeyRange).toCollection().primaryKeys();
	    }
	    function _onDatabaseCreated(_a, name) {
	        var indexedDB = _a.indexedDB, IDBKeyRange = _a.IDBKeyRange;
	        !hasDatabasesNative(indexedDB) &&
	            name !== DBNAMES_DB &&
	            getDbNamesTable(indexedDB, IDBKeyRange).put({ name: name }).catch(nop);
	    }
	    function _onDatabaseDeleted(_a, name) {
	        var indexedDB = _a.indexedDB, IDBKeyRange = _a.IDBKeyRange;
	        !hasDatabasesNative(indexedDB) &&
	            name !== DBNAMES_DB &&
	            getDbNamesTable(indexedDB, IDBKeyRange).delete(name).catch(nop);
	    }

	    function vip(fn) {
	        return newScope(function () {
	            PSD.letThrough = true;
	            return fn();
	        });
	    }

	    function idbReady() {
	        var isSafari = !navigator.userAgentData &&
	            /Safari\//.test(navigator.userAgent) &&
	            !/Chrom(e|ium)\//.test(navigator.userAgent);
	        if (!isSafari || !indexedDB.databases)
	            return Promise.resolve();
	        var intervalId;
	        return new Promise(function (resolve) {
	            var tryIdb = function () { return indexedDB.databases().finally(resolve); };
	            intervalId = setInterval(tryIdb, 100);
	            tryIdb();
	        }).finally(function () { return clearInterval(intervalId); });
	    }

	    var _a;
	    function isEmptyRange(node) {
	        return !("from" in node);
	    }
	    var RangeSet = function (fromOrTree, to) {
	        if (this) {
	            extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
	        }
	        else {
	            var rv = new RangeSet();
	            if (fromOrTree && ("d" in fromOrTree)) {
	                extend(rv, fromOrTree);
	            }
	            return rv;
	        }
	    };
	    props(RangeSet.prototype, (_a = {
	            add: function (rangeSet) {
	                mergeRanges(this, rangeSet);
	                return this;
	            },
	            addKey: function (key) {
	                addRange(this, key, key);
	                return this;
	            },
	            addKeys: function (keys) {
	                var _this = this;
	                keys.forEach(function (key) { return addRange(_this, key, key); });
	                return this;
	            }
	        },
	        _a[iteratorSymbol] = function () {
	            return getRangeSetIterator(this);
	        },
	        _a));
	    function addRange(target, from, to) {
	        var diff = cmp(from, to);
	        if (isNaN(diff))
	            return;
	        if (diff > 0)
	            throw RangeError();
	        if (isEmptyRange(target))
	            return extend(target, { from: from, to: to, d: 1 });
	        var left = target.l;
	        var right = target.r;
	        if (cmp(to, target.from) < 0) {
	            left
	                ? addRange(left, from, to)
	                : (target.l = { from: from, to: to, d: 1, l: null, r: null });
	            return rebalance(target);
	        }
	        if (cmp(from, target.to) > 0) {
	            right
	                ? addRange(right, from, to)
	                : (target.r = { from: from, to: to, d: 1, l: null, r: null });
	            return rebalance(target);
	        }
	        if (cmp(from, target.from) < 0) {
	            target.from = from;
	            target.l = null;
	            target.d = right ? right.d + 1 : 1;
	        }
	        if (cmp(to, target.to) > 0) {
	            target.to = to;
	            target.r = null;
	            target.d = target.l ? target.l.d + 1 : 1;
	        }
	        var rightWasCutOff = !target.r;
	        if (left && !target.l) {
	            mergeRanges(target, left);
	        }
	        if (right && rightWasCutOff) {
	            mergeRanges(target, right);
	        }
	    }
	    function mergeRanges(target, newSet) {
	        function _addRangeSet(target, _a) {
	            var from = _a.from, to = _a.to, l = _a.l, r = _a.r;
	            addRange(target, from, to);
	            if (l)
	                _addRangeSet(target, l);
	            if (r)
	                _addRangeSet(target, r);
	        }
	        if (!isEmptyRange(newSet))
	            _addRangeSet(target, newSet);
	    }
	    function rangesOverlap(rangeSet1, rangeSet2) {
	        var i1 = getRangeSetIterator(rangeSet2);
	        var nextResult1 = i1.next();
	        if (nextResult1.done)
	            return false;
	        var a = nextResult1.value;
	        var i2 = getRangeSetIterator(rangeSet1);
	        var nextResult2 = i2.next(a.from);
	        var b = nextResult2.value;
	        while (!nextResult1.done && !nextResult2.done) {
	            if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
	                return true;
	            cmp(a.from, b.from) < 0
	                ? (a = (nextResult1 = i1.next(b.from)).value)
	                : (b = (nextResult2 = i2.next(a.from)).value);
	        }
	        return false;
	    }
	    function getRangeSetIterator(node) {
	        var state = isEmptyRange(node) ? null : { s: 0, n: node };
	        return {
	            next: function (key) {
	                var keyProvided = arguments.length > 0;
	                while (state) {
	                    switch (state.s) {
	                        case 0:
	                            state.s = 1;
	                            if (keyProvided) {
	                                while (state.n.l && cmp(key, state.n.from) < 0)
	                                    state = { up: state, n: state.n.l, s: 1 };
	                            }
	                            else {
	                                while (state.n.l)
	                                    state = { up: state, n: state.n.l, s: 1 };
	                            }
	                        case 1:
	                            state.s = 2;
	                            if (!keyProvided || cmp(key, state.n.to) <= 0)
	                                return { value: state.n, done: false };
	                        case 2:
	                            if (state.n.r) {
	                                state.s = 3;
	                                state = { up: state, n: state.n.r, s: 0 };
	                                continue;
	                            }
	                        case 3:
	                            state = state.up;
	                    }
	                }
	                return { done: true };
	            },
	        };
	    }
	    function rebalance(target) {
	        var _a, _b;
	        var diff = (((_a = target.r) === null || _a === void 0 ? void 0 : _a.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
	        var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
	        if (r) {
	            var l = r === "r" ? "l" : "r";
	            var rootClone = __assign({}, target);
	            var oldRootRight = target[r];
	            target.from = oldRootRight.from;
	            target.to = oldRootRight.to;
	            target[r] = oldRootRight[r];
	            rootClone[r] = oldRootRight[l];
	            target[l] = rootClone;
	            rootClone.d = computeDepth(rootClone);
	        }
	        target.d = computeDepth(target);
	    }
	    function computeDepth(_a) {
	        var r = _a.r, l = _a.l;
	        return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
	    }

	    function extendObservabilitySet(target, newSet) {
	        keys(newSet).forEach(function (part) {
	            if (target[part])
	                mergeRanges(target[part], newSet[part]);
	            else
	                target[part] = cloneSimpleObjectTree(newSet[part]);
	        });
	        return target;
	    }

	    function obsSetsOverlap(os1, os2) {
	        return os1.all || os2.all || Object.keys(os1).some(function (key) { return os2[key] && rangesOverlap(os2[key], os1[key]); });
	    }

	    var cache = {};

	    var unsignaledParts = {};
	    var isTaskEnqueued = false;
	    function signalSubscribersLazily(part, optimistic) {
	        extendObservabilitySet(unsignaledParts, part);
	        if (!isTaskEnqueued) {
	            isTaskEnqueued = true;
	            setTimeout(function () {
	                isTaskEnqueued = false;
	                var parts = unsignaledParts;
	                unsignaledParts = {};
	                signalSubscribersNow(parts, false);
	            }, 0);
	        }
	    }
	    function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
	        if (deleteAffectedCacheEntries === void 0) { deleteAffectedCacheEntries = false; }
	        var queriesToSignal = new Set();
	        if (updatedParts.all) {
	            for (var _i = 0, _a = Object.values(cache); _i < _a.length; _i++) {
	                var tblCache = _a[_i];
	                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
	            }
	        }
	        else {
	            for (var key in updatedParts) {
	                var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
	                if (parts) {
	                    var dbName = parts[1], tableName = parts[2];
	                    var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
	                    if (tblCache)
	                        collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
	                }
	            }
	        }
	        queriesToSignal.forEach(function (requery) { return requery(); });
	    }
	    function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
	        var updatedEntryLists = [];
	        for (var _i = 0, _a = Object.entries(tblCache.queries.query); _i < _a.length; _i++) {
	            var _b = _a[_i], indexName = _b[0], entries = _b[1];
	            var filteredEntries = [];
	            for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
	                var entry = entries_1[_c];
	                if (obsSetsOverlap(updatedParts, entry.obsSet)) {
	                    entry.subscribers.forEach(function (requery) { return outQueriesToSignal.add(requery); });
	                }
	                else if (deleteAffectedCacheEntries) {
	                    filteredEntries.push(entry);
	                }
	            }
	            if (deleteAffectedCacheEntries)
	                updatedEntryLists.push([indexName, filteredEntries]);
	        }
	        if (deleteAffectedCacheEntries) {
	            for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
	                var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
	                tblCache.queries.query[indexName] = filteredEntries;
	            }
	        }
	    }

	    function dexieOpen(db) {
	        var state = db._state;
	        var indexedDB = db._deps.indexedDB;
	        if (state.isBeingOpened || db.idbdb)
	            return state.dbReadyPromise.then(function () { return state.dbOpenError ?
	                rejection(state.dbOpenError) :
	                db; });
	        state.isBeingOpened = true;
	        state.dbOpenError = null;
	        state.openComplete = false;
	        var openCanceller = state.openCanceller;
	        var nativeVerToOpen = Math.round(db.verno * 10);
	        var schemaPatchMode = false;
	        function throwIfCancelled() {
	            if (state.openCanceller !== openCanceller)
	                throw new exceptions.DatabaseClosed('db.open() was cancelled');
	        }
	        var resolveDbReady = state.dbReadyResolve,
	        upgradeTransaction = null, wasCreated = false;
	        var tryOpenDB = function () { return new DexiePromise(function (resolve, reject) {
	            throwIfCancelled();
	            if (!indexedDB)
	                throw new exceptions.MissingAPI();
	            var dbName = db.name;
	            var req = state.autoSchema || !nativeVerToOpen ?
	                indexedDB.open(dbName) :
	                indexedDB.open(dbName, nativeVerToOpen);
	            if (!req)
	                throw new exceptions.MissingAPI();
	            req.onerror = eventRejectHandler(reject);
	            req.onblocked = wrap(db._fireOnBlocked);
	            req.onupgradeneeded = wrap(function (e) {
	                upgradeTransaction = req.transaction;
	                if (state.autoSchema && !db._options.allowEmptyDB) {
	                    req.onerror = preventDefault;
	                    upgradeTransaction.abort();
	                    req.result.close();
	                    var delreq = indexedDB.deleteDatabase(dbName);
	                    delreq.onsuccess = delreq.onerror = wrap(function () {
	                        reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
	                    });
	                }
	                else {
	                    upgradeTransaction.onerror = eventRejectHandler(reject);
	                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
	                    wasCreated = oldVer < 1;
	                    db.idbdb = req.result;
	                    if (schemaPatchMode) {
	                        patchCurrentVersion(db, upgradeTransaction);
	                    }
	                    runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
	                }
	            }, reject);
	            req.onsuccess = wrap(function () {
	                upgradeTransaction = null;
	                var idbdb = db.idbdb = req.result;
	                var objectStoreNames = slice(idbdb.objectStoreNames);
	                if (objectStoreNames.length > 0)
	                    try {
	                        var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
	                        if (state.autoSchema)
	                            readGlobalSchema(db, idbdb, tmpTrans);
	                        else {
	                            adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
	                            if (!verifyInstalledSchema(db, tmpTrans) && !schemaPatchMode) {
	                                console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
	                                idbdb.close();
	                                nativeVerToOpen = idbdb.version + 1;
	                                schemaPatchMode = true;
	                                return resolve(tryOpenDB());
	                            }
	                        }
	                        generateMiddlewareStacks(db, tmpTrans);
	                    }
	                    catch (e) {
	                    }
	                connections.push(db);
	                idbdb.onversionchange = wrap(function (ev) {
	                    state.vcFired = true;
	                    db.on("versionchange").fire(ev);
	                });
	                idbdb.onclose = wrap(function (ev) {
	                    db.on("close").fire(ev);
	                });
	                if (wasCreated)
	                    _onDatabaseCreated(db._deps, dbName);
	                resolve();
	            }, reject);
	        }).catch(function (err) {
	            switch (err === null || err === void 0 ? void 0 : err.name) {
	                case "UnknownError":
	                    if (state.PR1398_maxLoop > 0) {
	                        state.PR1398_maxLoop--;
	                        console.warn('Dexie: Workaround for Chrome UnknownError on open()');
	                        return tryOpenDB();
	                    }
	                    break;
	                case "VersionError":
	                    if (nativeVerToOpen > 0) {
	                        nativeVerToOpen = 0;
	                        return tryOpenDB();
	                    }
	                    break;
	            }
	            return DexiePromise.reject(err);
	        }); };
	        return DexiePromise.race([
	            openCanceller,
	            (typeof navigator === 'undefined' ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
	        ]).then(function () {
	            throwIfCancelled();
	            state.onReadyBeingFired = [];
	            return DexiePromise.resolve(vip(function () { return db.on.ready.fire(db.vip); })).then(function fireRemainders() {
	                if (state.onReadyBeingFired.length > 0) {
	                    var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
	                    state.onReadyBeingFired = [];
	                    return DexiePromise.resolve(vip(function () { return remainders_1(db.vip); })).then(fireRemainders);
	                }
	            });
	        }).finally(function () {
	            if (state.openCanceller === openCanceller) {
	                state.onReadyBeingFired = null;
	                state.isBeingOpened = false;
	            }
	        }).catch(function (err) {
	            state.dbOpenError = err;
	            try {
	                upgradeTransaction && upgradeTransaction.abort();
	            }
	            catch (_a) { }
	            if (openCanceller === state.openCanceller) {
	                db._close();
	            }
	            return rejection(err);
	        }).finally(function () {
	            state.openComplete = true;
	            resolveDbReady();
	        }).then(function () {
	            if (wasCreated) {
	                var everything_1 = {};
	                db.tables.forEach(function (table) {
	                    table.schema.indexes.forEach(function (idx) {
	                        if (idx.name)
	                            everything_1["idb://".concat(db.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet(-Infinity, [[[]]]);
	                    });
	                    everything_1["idb://".concat(db.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db.name, "/").concat(table.name, "/:dels")] = new RangeSet(-Infinity, [[[]]]);
	                });
	                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
	                signalSubscribersNow(everything_1, true);
	            }
	            return db;
	        });
	    }

	    function awaitIterator(iterator) {
	        var callNext = function (result) { return iterator.next(result); }, doThrow = function (error) { return iterator.throw(error); }, onSuccess = step(callNext), onError = step(doThrow);
	        function step(getNext) {
	            return function (val) {
	                var next = getNext(val), value = next.value;
	                return next.done ? value :
	                    (!value || typeof value.then !== 'function' ?
	                        isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) :
	                        value.then(onSuccess, onError));
	            };
	        }
	        return step(callNext)();
	    }

	    function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
	        var i = arguments.length;
	        if (i < 2)
	            throw new exceptions.InvalidArgument("Too few arguments");
	        var args = new Array(i - 1);
	        while (--i)
	            args[i - 1] = arguments[i];
	        scopeFunc = args.pop();
	        var tables = flatten(args);
	        return [mode, tables, scopeFunc];
	    }
	    function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
	        return DexiePromise.resolve().then(function () {
	            var transless = PSD.transless || PSD;
	            var trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
	            trans.explicit = true;
	            var zoneProps = {
	                trans: trans,
	                transless: transless
	            };
	            if (parentTransaction) {
	                trans.idbtrans = parentTransaction.idbtrans;
	            }
	            else {
	                try {
	                    trans.create();
	                    trans.idbtrans._explicit = true;
	                    db._state.PR1398_maxLoop = 3;
	                }
	                catch (ex) {
	                    if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
	                        console.warn('Dexie: Need to reopen db');
	                        db.close({ disableAutoOpen: false });
	                        return db.open().then(function () { return enterTransactionScope(db, mode, storeNames, null, scopeFunc); });
	                    }
	                    return rejection(ex);
	                }
	            }
	            var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
	            if (scopeFuncIsAsync) {
	                incrementExpectedAwaits();
	            }
	            var returnValue;
	            var promiseFollowed = DexiePromise.follow(function () {
	                returnValue = scopeFunc.call(trans, trans);
	                if (returnValue) {
	                    if (scopeFuncIsAsync) {
	                        var decrementor = decrementExpectedAwaits.bind(null, null);
	                        returnValue.then(decrementor, decrementor);
	                    }
	                    else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
	                        returnValue = awaitIterator(returnValue);
	                    }
	                }
	            }, zoneProps);
	            return (returnValue && typeof returnValue.then === 'function' ?
	                DexiePromise.resolve(returnValue).then(function (x) { return trans.active ?
	                    x
	                    : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")); })
	                : promiseFollowed.then(function () { return returnValue; })).then(function (x) {
	                if (parentTransaction)
	                    trans._resolve();
	                return trans._completion.then(function () { return x; });
	            }).catch(function (e) {
	                trans._reject(e);
	                return rejection(e);
	            });
	        });
	    }

	    function pad(a, value, count) {
	        var result = isArray(a) ? a.slice() : [a];
	        for (var i = 0; i < count; ++i)
	            result.push(value);
	        return result;
	    }
	    function createVirtualIndexMiddleware(down) {
	        return __assign(__assign({}, down), { table: function (tableName) {
	                var table = down.table(tableName);
	                var schema = table.schema;
	                var indexLookup = {};
	                var allVirtualIndexes = [];
	                function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
	                    var keyPathAlias = getKeyPathAlias(keyPath);
	                    var indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
	                    var keyLength = keyPath == null ? 0 : typeof keyPath === 'string' ? 1 : keyPath.length;
	                    var isVirtual = keyTail > 0;
	                    var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual
	                            ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")")
	                            : lowLevelIndex.name, lowLevelIndex: lowLevelIndex, isVirtual: isVirtual, keyTail: keyTail, keyLength: keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
	                    indexList.push(virtualIndex);
	                    if (!virtualIndex.isPrimaryKey) {
	                        allVirtualIndexes.push(virtualIndex);
	                    }
	                    if (keyLength > 1) {
	                        var virtualKeyPath = keyLength === 2 ?
	                            keyPath[0] :
	                            keyPath.slice(0, keyLength - 1);
	                        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
	                    }
	                    indexList.sort(function (a, b) { return a.keyTail - b.keyTail; });
	                    return virtualIndex;
	                }
	                var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
	                indexLookup[":id"] = [primaryKey];
	                for (var _i = 0, _a = schema.indexes; _i < _a.length; _i++) {
	                    var index = _a[_i];
	                    addVirtualIndexes(index.keyPath, 0, index);
	                }
	                function findBestIndex(keyPath) {
	                    var result = indexLookup[getKeyPathAlias(keyPath)];
	                    return result && result[0];
	                }
	                function translateRange(range, keyTail) {
	                    return {
	                        type: range.type === 1  ?
	                            2  :
	                            range.type,
	                        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
	                        lowerOpen: true,
	                        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
	                        upperOpen: true
	                    };
	                }
	                function translateRequest(req) {
	                    var index = req.query.index;
	                    return index.isVirtual ? __assign(__assign({}, req), { query: {
	                            index: index.lowLevelIndex,
	                            range: translateRange(req.query.range, index.keyTail)
	                        } }) : req;
	                }
	                var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey: primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function (req) {
	                        return table.count(translateRequest(req));
	                    }, query: function (req) {
	                        return table.query(translateRequest(req));
	                    }, openCursor: function (req) {
	                        var _a = req.query.index, keyTail = _a.keyTail, isVirtual = _a.isVirtual, keyLength = _a.keyLength;
	                        if (!isVirtual)
	                            return table.openCursor(req);
	                        function createVirtualCursor(cursor) {
	                            function _continue(key) {
	                                key != null ?
	                                    cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
	                                    req.unique ?
	                                        cursor.continue(cursor.key.slice(0, keyLength)
	                                            .concat(req.reverse
	                                            ? down.MIN_KEY
	                                            : down.MAX_KEY, keyTail)) :
	                                        cursor.continue();
	                            }
	                            var virtualCursor = Object.create(cursor, {
	                                continue: { value: _continue },
	                                continuePrimaryKey: {
	                                    value: function (key, primaryKey) {
	                                        cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
	                                    }
	                                },
	                                primaryKey: {
	                                    get: function () {
	                                        return cursor.primaryKey;
	                                    }
	                                },
	                                key: {
	                                    get: function () {
	                                        var key = cursor.key;
	                                        return keyLength === 1 ?
	                                            key[0] :
	                                            key.slice(0, keyLength);
	                                    }
	                                },
	                                value: {
	                                    get: function () {
	                                        return cursor.value;
	                                    }
	                                }
	                            });
	                            return virtualCursor;
	                        }
	                        return table.openCursor(translateRequest(req))
	                            .then(function (cursor) { return cursor && createVirtualCursor(cursor); });
	                    } });
	                return result;
	            } });
	    }
	    var virtualIndexMiddleware = {
	        stack: "dbcore",
	        name: "VirtualIndexMiddleware",
	        level: 1,
	        create: createVirtualIndexMiddleware
	    };

	    function getObjectDiff(a, b, rv, prfx) {
	        rv = rv || {};
	        prfx = prfx || '';
	        keys(a).forEach(function (prop) {
	            if (!hasOwn(b, prop)) {
	                rv[prfx + prop] = undefined;
	            }
	            else {
	                var ap = a[prop], bp = b[prop];
	                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
	                    var apTypeName = toStringTag(ap);
	                    var bpTypeName = toStringTag(bp);
	                    if (apTypeName !== bpTypeName) {
	                        rv[prfx + prop] = b[prop];
	                    }
	                    else if (apTypeName === 'Object') {
	                        getObjectDiff(ap, bp, rv, prfx + prop + '.');
	                    }
	                    else if (ap !== bp) {
	                        rv[prfx + prop] = b[prop];
	                    }
	                }
	                else if (ap !== bp)
	                    rv[prfx + prop] = b[prop];
	            }
	        });
	        keys(b).forEach(function (prop) {
	            if (!hasOwn(a, prop)) {
	                rv[prfx + prop] = b[prop];
	            }
	        });
	        return rv;
	    }

	    function getEffectiveKeys(primaryKey, req) {
	        if (req.type === 'delete')
	            return req.keys;
	        return req.keys || req.values.map(primaryKey.extractKey);
	    }

	    var hooksMiddleware = {
	        stack: "dbcore",
	        name: "HooksMiddleware",
	        level: 2,
	        create: function (downCore) { return (__assign(__assign({}, downCore), { table: function (tableName) {
	                var downTable = downCore.table(tableName);
	                var primaryKey = downTable.schema.primaryKey;
	                var tableMiddleware = __assign(__assign({}, downTable), { mutate: function (req) {
	                        var dxTrans = PSD.trans;
	                        var _a = dxTrans.table(tableName).hook, deleting = _a.deleting, creating = _a.creating, updating = _a.updating;
	                        switch (req.type) {
	                            case 'add':
	                                if (creating.fire === nop)
	                                    break;
	                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
	                            case 'put':
	                                if (creating.fire === nop && updating.fire === nop)
	                                    break;
	                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
	                            case 'delete':
	                                if (deleting.fire === nop)
	                                    break;
	                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
	                            case 'deleteRange':
	                                if (deleting.fire === nop)
	                                    break;
	                                return dxTrans._promise('readwrite', function () { return deleteRange(req); }, true);
	                        }
	                        return downTable.mutate(req);
	                        function addPutOrDelete(req) {
	                            var dxTrans = PSD.trans;
	                            var keys = req.keys || getEffectiveKeys(primaryKey, req);
	                            if (!keys)
	                                throw new Error("Keys missing");
	                            req = req.type === 'add' || req.type === 'put' ? __assign(__assign({}, req), { keys: keys }) : __assign({}, req);
	                            if (req.type !== 'delete')
	                                req.values = __spreadArray([], req.values);
	                            if (req.keys)
	                                req.keys = __spreadArray([], req.keys);
	                            return getExistingValues(downTable, req, keys).then(function (existingValues) {
	                                var contexts = keys.map(function (key, i) {
	                                    var existingValue = existingValues[i];
	                                    var ctx = { onerror: null, onsuccess: null };
	                                    if (req.type === 'delete') {
	                                        deleting.fire.call(ctx, key, existingValue, dxTrans);
	                                    }
	                                    else if (req.type === 'add' || existingValue === undefined) {
	                                        var generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
	                                        if (key == null && generatedPrimaryKey != null) {
	                                            key = generatedPrimaryKey;
	                                            req.keys[i] = key;
	                                            if (!primaryKey.outbound) {
	                                                setByKeyPath(req.values[i], primaryKey.keyPath, key);
	                                            }
	                                        }
	                                    }
	                                    else {
	                                        var objectDiff = getObjectDiff(existingValue, req.values[i]);
	                                        var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
	                                        if (additionalChanges_1) {
	                                            var requestedValue_1 = req.values[i];
	                                            Object.keys(additionalChanges_1).forEach(function (keyPath) {
	                                                if (hasOwn(requestedValue_1, keyPath)) {
	                                                    requestedValue_1[keyPath] = additionalChanges_1[keyPath];
	                                                }
	                                                else {
	                                                    setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
	                                                }
	                                            });
	                                        }
	                                    }
	                                    return ctx;
	                                });
	                                return downTable.mutate(req).then(function (_a) {
	                                    var failures = _a.failures, results = _a.results, numFailures = _a.numFailures, lastResult = _a.lastResult;
	                                    for (var i = 0; i < keys.length; ++i) {
	                                        var primKey = results ? results[i] : keys[i];
	                                        var ctx = contexts[i];
	                                        if (primKey == null) {
	                                            ctx.onerror && ctx.onerror(failures[i]);
	                                        }
	                                        else {
	                                            ctx.onsuccess && ctx.onsuccess(req.type === 'put' && existingValues[i] ?
	                                                req.values[i] :
	                                                primKey
	                                            );
	                                        }
	                                    }
	                                    return { failures: failures, results: results, numFailures: numFailures, lastResult: lastResult };
	                                }).catch(function (error) {
	                                    contexts.forEach(function (ctx) { return ctx.onerror && ctx.onerror(error); });
	                                    return Promise.reject(error);
	                                });
	                            });
	                        }
	                        function deleteRange(req) {
	                            return deleteNextChunk(req.trans, req.range, 10000);
	                        }
	                        function deleteNextChunk(trans, range, limit) {
	                            return downTable.query({ trans: trans, values: false, query: { index: primaryKey, range: range }, limit: limit })
	                                .then(function (_a) {
	                                var result = _a.result;
	                                return addPutOrDelete({ type: 'delete', keys: result, trans: trans }).then(function (res) {
	                                    if (res.numFailures > 0)
	                                        return Promise.reject(res.failures[0]);
	                                    if (result.length < limit) {
	                                        return { failures: [], numFailures: 0, lastResult: undefined };
	                                    }
	                                    else {
	                                        return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
	                                    }
	                                });
	                            });
	                        }
	                    } });
	                return tableMiddleware;
	            } })); }
	    };
	    function getExistingValues(table, req, effectiveKeys) {
	        return req.type === "add"
	            ? Promise.resolve([])
	            : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
	    }

	    function getFromTransactionCache(keys, cache, clone) {
	        try {
	            if (!cache)
	                return null;
	            if (cache.keys.length < keys.length)
	                return null;
	            var result = [];
	            for (var i = 0, j = 0; i < cache.keys.length && j < keys.length; ++i) {
	                if (cmp(cache.keys[i], keys[j]) !== 0)
	                    continue;
	                result.push(clone ? deepClone(cache.values[i]) : cache.values[i]);
	                ++j;
	            }
	            return result.length === keys.length ? result : null;
	        }
	        catch (_a) {
	            return null;
	        }
	    }
	    var cacheExistingValuesMiddleware = {
	        stack: "dbcore",
	        level: -1,
	        create: function (core) {
	            return {
	                table: function (tableName) {
	                    var table = core.table(tableName);
	                    return __assign(__assign({}, table), { getMany: function (req) {
	                            if (!req.cache) {
	                                return table.getMany(req);
	                            }
	                            var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
	                            if (cachedResult) {
	                                return DexiePromise.resolve(cachedResult);
	                            }
	                            return table.getMany(req).then(function (res) {
	                                req.trans["_cache"] = {
	                                    keys: req.keys,
	                                    values: req.cache === "clone" ? deepClone(res) : res,
	                                };
	                                return res;
	                            });
	                        }, mutate: function (req) {
	                            if (req.type !== "add")
	                                req.trans["_cache"] = null;
	                            return table.mutate(req);
	                        } });
	                },
	            };
	        },
	    };

	    function isCachableContext(ctx, table) {
	        return (ctx.trans.mode === 'readonly' &&
	            !!ctx.subscr &&
	            !ctx.trans.explicit &&
	            ctx.trans.db._options.cache !== 'disabled' &&
	            !table.schema.primaryKey.outbound);
	    }

	    function isCachableRequest(type, req) {
	        switch (type) {
	            case 'query':
	                return req.values && !req.unique;
	            case 'get':
	                return false;
	            case 'getMany':
	                return false;
	            case 'count':
	                return false;
	            case 'openCursor':
	                return false;
	        }
	    }

	    var observabilityMiddleware = {
	        stack: "dbcore",
	        level: 0,
	        name: "Observability",
	        create: function (core) {
	            var dbName = core.schema.name;
	            var FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
	            return __assign(__assign({}, core), { transaction: function (stores, mode, options) {
	                    if (PSD.subscr && mode !== 'readonly') {
	                        throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
	                    }
	                    return core.transaction(stores, mode, options);
	                }, table: function (tableName) {
	                    var table = core.table(tableName);
	                    var schema = table.schema;
	                    var primaryKey = schema.primaryKey, indexes = schema.indexes;
	                    var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
	                    var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function (index) { return index.compound && index.keyPath.includes(primaryKey.keyPath); });
	                    var tableClone = __assign(__assign({}, table), { mutate: function (req) {
	                            var trans = req.trans;
	                            var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
	                            var getRangeSet = function (indexName) {
	                                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
	                                return (mutatedParts[part] ||
	                                    (mutatedParts[part] = new RangeSet()));
	                            };
	                            var pkRangeSet = getRangeSet("");
	                            var delsRangeSet = getRangeSet(":dels");
	                            var type = req.type;
	                            var _a = req.type === "deleteRange"
	                                ? [req.range]
	                                : req.type === "delete"
	                                    ? [req.keys]
	                                    : req.values.length < 50
	                                        ? [getEffectiveKeys(primaryKey, req).filter(function (id) { return id; }), req.values]
	                                        : [], keys = _a[0], newObjs = _a[1];
	                            var oldCache = req.trans["_cache"];
	                            if (isArray(keys)) {
	                                pkRangeSet.addKeys(keys);
	                                var oldObjs = type === 'delete' || keys.length === newObjs.length ? getFromTransactionCache(keys, oldCache) : null;
	                                if (!oldObjs) {
	                                    delsRangeSet.addKeys(keys);
	                                }
	                                if (oldObjs || newObjs) {
	                                    trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
	                                }
	                            }
	                            else if (keys) {
	                                var range = { from: keys.lower, to: keys.upper };
	                                delsRangeSet.add(range);
	                                pkRangeSet.add(range);
	                            }
	                            else {
	                                pkRangeSet.add(FULL_RANGE);
	                                delsRangeSet.add(FULL_RANGE);
	                                schema.indexes.forEach(function (idx) { return getRangeSet(idx.name).add(FULL_RANGE); });
	                            }
	                            return table.mutate(req).then(function (res) {
	                                if (keys && (req.type === 'add' || req.type === 'put')) {
	                                    pkRangeSet.addKeys(res.results);
	                                    if (indexesWithAutoIncPK) {
	                                        indexesWithAutoIncPK.forEach(function (idx) {
	                                            var idxVals = req.values.map(function (v) { return idx.extractKey(v); });
	                                            var pkPos = idx.keyPath.findIndex(function (prop) { return prop === primaryKey.keyPath; });
	                                            res.results.forEach(function (pk) { return idxVals[pkPos] = pk; });
	                                            getRangeSet(idx.name).addKeys(idxVals);
	                                        });
	                                    }
	                                }
	                                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
	                                return res;
	                            });
	                        } });
	                    var getRange = function (_a) {
	                        var _b, _c;
	                        var _d = _a.query, index = _d.index, range = _d.range;
	                        return [
	                            index,
	                            new RangeSet((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY),
	                        ];
	                    };
	                    var readSubscribers = {
	                        get: function (req) { return [primaryKey, new RangeSet(req.key)]; },
	                        getMany: function (req) { return [primaryKey, new RangeSet().addKeys(req.keys)]; },
	                        count: getRange,
	                        query: getRange,
	                        openCursor: getRange,
	                    };
	                    keys(readSubscribers).forEach(function (method) {
	                        tableClone[method] = function (req) {
	                            var subscr = PSD.subscr;
	                            var isLiveQuery = !!subscr;
	                            var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
	                            var obsSet = cachable
	                                ? req.obsSet = {}
	                                : subscr;
	                            if (isLiveQuery) {
	                                var getRangeSet = function (indexName) {
	                                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
	                                    return (obsSet[part] ||
	                                        (obsSet[part] = new RangeSet()));
	                                };
	                                var pkRangeSet_1 = getRangeSet("");
	                                var delsRangeSet_1 = getRangeSet(":dels");
	                                var _a = readSubscribers[method](req), queriedIndex = _a[0], queriedRanges = _a[1];
	                                if (method === 'query' && queriedIndex.isPrimaryKey && !req.values) {
	                                    delsRangeSet_1.add(queriedRanges);
	                                }
	                                else {
	                                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
	                                }
	                                if (!queriedIndex.isPrimaryKey) {
	                                    if (method === "count") {
	                                        delsRangeSet_1.add(FULL_RANGE);
	                                    }
	                                    else {
	                                        var keysPromise_1 = method === "query" &&
	                                            outbound &&
	                                            req.values &&
	                                            table.query(__assign(__assign({}, req), { values: false }));
	                                        return table[method].apply(this, arguments).then(function (res) {
	                                            if (method === "query") {
	                                                if (outbound && req.values) {
	                                                    return keysPromise_1.then(function (_a) {
	                                                        var resultingKeys = _a.result;
	                                                        pkRangeSet_1.addKeys(resultingKeys);
	                                                        return res;
	                                                    });
	                                                }
	                                                var pKeys = req.values
	                                                    ? res.result.map(extractKey)
	                                                    : res.result;
	                                                if (req.values) {
	                                                    pkRangeSet_1.addKeys(pKeys);
	                                                }
	                                                else {
	                                                    delsRangeSet_1.addKeys(pKeys);
	                                                }
	                                            }
	                                            else if (method === "openCursor") {
	                                                var cursor_1 = res;
	                                                var wantValues_1 = req.values;
	                                                return (cursor_1 &&
	                                                    Object.create(cursor_1, {
	                                                        key: {
	                                                            get: function () {
	                                                                delsRangeSet_1.addKey(cursor_1.primaryKey);
	                                                                return cursor_1.key;
	                                                            },
	                                                        },
	                                                        primaryKey: {
	                                                            get: function () {
	                                                                var pkey = cursor_1.primaryKey;
	                                                                delsRangeSet_1.addKey(pkey);
	                                                                return pkey;
	                                                            },
	                                                        },
	                                                        value: {
	                                                            get: function () {
	                                                                wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
	                                                                return cursor_1.value;
	                                                            },
	                                                        },
	                                                    }));
	                                            }
	                                            return res;
	                                        });
	                                    }
	                                }
	                            }
	                            return table[method].apply(this, arguments);
	                        };
	                    });
	                    return tableClone;
	                } });
	        },
	    };
	    function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
	        function addAffectedIndex(ix) {
	            var rangeSet = getRangeSet(ix.name || "");
	            function extractKey(obj) {
	                return obj != null ? ix.extractKey(obj) : null;
	            }
	            var addKeyOrKeys = function (key) { return ix.multiEntry && isArray(key)
	                ? key.forEach(function (key) { return rangeSet.addKey(key); })
	                : rangeSet.addKey(key); };
	            (oldObjs || newObjs).forEach(function (_, i) {
	                var oldKey = oldObjs && extractKey(oldObjs[i]);
	                var newKey = newObjs && extractKey(newObjs[i]);
	                if (cmp(oldKey, newKey) !== 0) {
	                    if (oldKey != null)
	                        addKeyOrKeys(oldKey);
	                    if (newKey != null)
	                        addKeyOrKeys(newKey);
	                }
	            });
	        }
	        schema.indexes.forEach(addAffectedIndex);
	    }

	    function adjustOptimisticFromFailures(tblCache, req, res) {
	        if (res.numFailures === 0)
	            return req;
	        if (req.type === 'deleteRange') {
	            return null;
	        }
	        var numBulkOps = req.keys
	            ? req.keys.length
	            : 'values' in req && req.values
	                ? req.values.length
	                : 1;
	        if (res.numFailures === numBulkOps) {
	            return null;
	        }
	        var clone = __assign({}, req);
	        if (isArray(clone.keys)) {
	            clone.keys = clone.keys.filter(function (_, i) { return !(i in res.failures); });
	        }
	        if ('values' in clone && isArray(clone.values)) {
	            clone.values = clone.values.filter(function (_, i) { return !(i in res.failures); });
	        }
	        return clone;
	    }

	    function isAboveLower(key, range) {
	        return range.lower === undefined
	            ? true
	            : range.lowerOpen
	                ? cmp(key, range.lower) > 0
	                : cmp(key, range.lower) >= 0;
	    }
	    function isBelowUpper(key, range) {
	        return range.upper === undefined
	            ? true
	            : range.upperOpen
	                ? cmp(key, range.upper) < 0
	                : cmp(key, range.upper) <= 0;
	    }
	    function isWithinRange(key, range) {
	        return isAboveLower(key, range) && isBelowUpper(key, range);
	    }

	    function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
	        if (!ops || ops.length === 0)
	            return result;
	        var index = req.query.index;
	        var multiEntry = index.multiEntry;
	        var queryRange = req.query.range;
	        var primaryKey = table.schema.primaryKey;
	        var extractPrimKey = primaryKey.extractKey;
	        var extractIndex = index.extractKey;
	        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
	        var finalResult = ops.reduce(function (result, op) {
	            var modifedResult = result;
	            var includedValues = op.type === 'add' || op.type === 'put'
	                ? op.values.filter(function (v) {
	                    var key = extractIndex(v);
	                    return multiEntry && isArray(key)
	                        ? key.some(function (k) { return isWithinRange(k, queryRange); })
	                        : isWithinRange(key, queryRange);
	                }).map(function (v) {
	                    v = deepClone(v);
	                    if (immutable)
	                        Object.freeze(v);
	                    return v;
	                })
	                : [];
	            switch (op.type) {
	                case 'add':
	                    modifedResult = result.concat(req.values
	                        ? includedValues
	                        : includedValues.map(function (v) { return extractPrimKey(v); }));
	                    break;
	                case 'put':
	                    var keySet_1 = new RangeSet().addKeys(op.values.map(function (v) { return extractPrimKey(v); }));
	                    modifedResult = result
	                        .filter(function (item) {
	                        var key = req.values ? extractPrimKey(item) : item;
	                        return !rangesOverlap(new RangeSet(key), keySet_1);
	                    })
	                        .concat(req.values
	                        ? includedValues
	                        : includedValues.map(function (v) { return extractPrimKey(v); }));
	                    break;
	                case 'delete':
	                    var keysToDelete_1 = new RangeSet().addKeys(op.keys);
	                    modifedResult = result.filter(function (item) {
	                        var key = req.values ? extractPrimKey(item) : item;
	                        return !rangesOverlap(new RangeSet(key), keysToDelete_1);
	                    });
	                    break;
	                case 'deleteRange':
	                    var range_1 = op.range;
	                    modifedResult = result.filter(function (item) { return !isWithinRange(extractPrimKey(item), range_1); });
	                    break;
	            }
	            return modifedResult;
	        }, result);
	        if (finalResult === result)
	            return result;
	        finalResult.sort(function (a, b) {
	            return cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) ||
	                cmp(extractPrimKey(a), extractPrimKey(b));
	        });
	        if (req.limit && req.limit < Infinity) {
	            if (finalResult.length > req.limit) {
	                finalResult.length = req.limit;
	            }
	            else if (result.length === req.limit && finalResult.length < req.limit) {
	                cacheEntry.dirty = true;
	            }
	        }
	        return immutable ? Object.freeze(finalResult) : finalResult;
	    }

	    function areRangesEqual(r1, r2) {
	        return (cmp(r1.lower, r2.lower) === 0 &&
	            cmp(r1.upper, r2.upper) === 0 &&
	            !!r1.lowerOpen === !!r2.lowerOpen &&
	            !!r1.upperOpen === !!r2.upperOpen);
	    }

	    function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
	        if (lower1 === undefined)
	            return lower2 !== undefined ? -1 : 0;
	        if (lower2 === undefined)
	            return 1;
	        var c = cmp(lower1, lower2);
	        if (c === 0) {
	            if (lowerOpen1 && lowerOpen2)
	                return 0;
	            if (lowerOpen1)
	                return 1;
	            if (lowerOpen2)
	                return -1;
	        }
	        return c;
	    }
	    function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
	        if (upper1 === undefined)
	            return upper2 !== undefined ? 1 : 0;
	        if (upper2 === undefined)
	            return -1;
	        var c = cmp(upper1, upper2);
	        if (c === 0) {
	            if (upperOpen1 && upperOpen2)
	                return 0;
	            if (upperOpen1)
	                return -1;
	            if (upperOpen2)
	                return 1;
	        }
	        return c;
	    }
	    function isSuperRange(r1, r2) {
	        return (compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 &&
	            compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0);
	    }

	    function findCompatibleQuery(dbName, tableName, type, req) {
	        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
	        if (!tblCache)
	            return [];
	        var queries = tblCache.queries[type];
	        if (!queries)
	            return [null, false, tblCache, null];
	        var indexName = req.query ? req.query.index.name : null;
	        var entries = queries[indexName || ''];
	        if (!entries)
	            return [null, false, tblCache, null];
	        switch (type) {
	            case 'query':
	                var equalEntry = entries.find(function (entry) {
	                    return entry.req.limit === req.limit &&
	                        entry.req.values === req.values &&
	                        areRangesEqual(entry.req.query.range, req.query.range);
	                });
	                if (equalEntry)
	                    return [
	                        equalEntry,
	                        true,
	                        tblCache,
	                        entries,
	                    ];
	                var superEntry = entries.find(function (entry) {
	                    var limit = 'limit' in entry.req ? entry.req.limit : Infinity;
	                    return (limit >= req.limit &&
	                        (req.values ? entry.req.values : true) &&
	                        isSuperRange(entry.req.query.range, req.query.range));
	                });
	                return [superEntry, false, tblCache, entries];
	            case 'count':
	                var countQuery = entries.find(function (entry) {
	                    return areRangesEqual(entry.req.query.range, req.query.range);
	                });
	                return [countQuery, !!countQuery, tblCache, entries];
	        }
	    }

	    function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
	        cacheEntry.subscribers.add(requery);
	        signal.addEventListener("abort", function () {
	            cacheEntry.subscribers.delete(requery);
	            if (cacheEntry.subscribers.size === 0) {
	                enqueForDeletion(cacheEntry, container);
	            }
	        });
	    }
	    function enqueForDeletion(cacheEntry, container) {
	        setTimeout(function () {
	            if (cacheEntry.subscribers.size === 0) {
	                delArrayItem(container, cacheEntry);
	            }
	        }, 3000);
	    }

	    var cacheMiddleware = {
	        stack: 'dbcore',
	        level: 0,
	        name: 'Cache',
	        create: function (core) {
	            var dbName = core.schema.name;
	            var coreMW = __assign(__assign({}, core), { transaction: function (stores, mode, options) {
	                    var idbtrans = core.transaction(stores, mode, options);
	                    if (mode === 'readwrite') {
	                        var ac_1 = new AbortController();
	                        var signal = ac_1.signal;
	                        var endTransaction = function (wasCommitted) { return function () {
	                            ac_1.abort();
	                            if (mode === 'readwrite') {
	                                var affectedSubscribers_1 = new Set();
	                                for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
	                                    var storeName = stores_1[_i];
	                                    var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
	                                    if (tblCache) {
	                                        var table = core.table(storeName);
	                                        var ops = tblCache.optimisticOps.filter(function (op) { return op.trans === idbtrans; });
	                                        if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
	                                            for (var _a = 0, _b = Object.values(tblCache.queries.query); _a < _b.length; _a++) {
	                                                var entries = _b[_a];
	                                                for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
	                                                    var entry = _d[_c];
	                                                    if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
	                                                        delArrayItem(entries, entry);
	                                                        entry.subscribers.forEach(function (requery) { return affectedSubscribers_1.add(requery); });
	                                                    }
	                                                }
	                                            }
	                                        }
	                                        else if (ops.length > 0) {
	                                            tblCache.optimisticOps = tblCache.optimisticOps.filter(function (op) { return op.trans !== idbtrans; });
	                                            for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
	                                                var entries = _f[_e];
	                                                for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
	                                                    var entry = _h[_g];
	                                                    if (entry.res != null &&
	                                                        idbtrans.mutatedParts
	    ) {
	                                                        if (wasCommitted && !entry.dirty) {
	                                                            var freezeResults = Object.isFrozen(entry.res);
	                                                            var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
	                                                            if (entry.dirty) {
	                                                                delArrayItem(entries, entry);
	                                                                entry.subscribers.forEach(function (requery) { return affectedSubscribers_1.add(requery); });
	                                                            }
	                                                            else if (modRes !== entry.res) {
	                                                                entry.res = modRes;
	                                                                entry.promise = DexiePromise.resolve({ result: modRes });
	                                                            }
	                                                        }
	                                                        else {
	                                                            if (entry.dirty) {
	                                                                delArrayItem(entries, entry);
	                                                            }
	                                                            entry.subscribers.forEach(function (requery) { return affectedSubscribers_1.add(requery); });
	                                                        }
	                                                    }
	                                                }
	                                            }
	                                        }
	                                    }
	                                }
	                                affectedSubscribers_1.forEach(function (requery) { return requery(); });
	                            }
	                        }; };
	                        idbtrans.addEventListener('abort', endTransaction(false), {
	                            signal: signal,
	                        });
	                        idbtrans.addEventListener('error', endTransaction(false), {
	                            signal: signal,
	                        });
	                        idbtrans.addEventListener('complete', endTransaction(true), {
	                            signal: signal,
	                        });
	                    }
	                    return idbtrans;
	                }, table: function (tableName) {
	                    var downTable = core.table(tableName);
	                    var primKey = downTable.schema.primaryKey;
	                    var tableMW = __assign(__assign({}, downTable), { mutate: function (req) {
	                            var trans = PSD.trans;
	                            if (primKey.outbound ||
	                                trans.db._options.cache === 'disabled' ||
	                                trans.explicit
	                            ) {
	                                return downTable.mutate(req);
	                            }
	                            var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
	                            if (!tblCache)
	                                return downTable.mutate(req);
	                            var promise = downTable.mutate(req);
	                            if ((req.type === 'add' || req.type === 'put') && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function (key) { return key == null; }))) {
	                                promise.then(function (res) {
	                                    var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function (value, i) {
	                                            var _a;
	                                            var valueWithKey = ((_a = primKey.keyPath) === null || _a === void 0 ? void 0 : _a.includes('.'))
	                                                ? deepClone(value)
	                                                : __assign({}, value);
	                                            setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
	                                            return valueWithKey;
	                                        }) });
	                                    var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
	                                    tblCache.optimisticOps.push(adjustedReq);
	                                    queueMicrotask(function () { return req.mutatedParts && signalSubscribersLazily(req.mutatedParts); });
	                                });
	                            }
	                            else {
	                                tblCache.optimisticOps.push(req);
	                                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
	                                promise.then(function (res) {
	                                    if (res.numFailures > 0) {
	                                        delArrayItem(tblCache.optimisticOps, req);
	                                        var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
	                                        if (adjustedReq) {
	                                            tblCache.optimisticOps.push(adjustedReq);
	                                        }
	                                        req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
	                                    }
	                                });
	                                promise.catch(function () {
	                                    delArrayItem(tblCache.optimisticOps, req);
	                                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
	                                });
	                            }
	                            return promise;
	                        }, query: function (req) {
	                            var _a;
	                            if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
	                                return downTable.query(req);
	                            var freezeResults = ((_a = PSD.trans) === null || _a === void 0 ? void 0 : _a.db._options.cache) === 'immutable';
	                            var _b = PSD, requery = _b.requery, signal = _b.signal;
	                            var _c = findCompatibleQuery(dbName, tableName, 'query', req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
	                            if (cacheEntry && exactMatch) {
	                                cacheEntry.obsSet = req.obsSet;
	                            }
	                            else {
	                                var promise = downTable.query(req).then(function (res) {
	                                    var result = res.result;
	                                    if (cacheEntry)
	                                        cacheEntry.res = result;
	                                    if (freezeResults) {
	                                        for (var i = 0, l = result.length; i < l; ++i) {
	                                            Object.freeze(result[i]);
	                                        }
	                                        Object.freeze(result);
	                                    }
	                                    else {
	                                        res.result = deepClone(result);
	                                    }
	                                    return res;
	                                }).catch(function (error) {
	                                    if (container && cacheEntry)
	                                        delArrayItem(container, cacheEntry);
	                                    return Promise.reject(error);
	                                });
	                                cacheEntry = {
	                                    obsSet: req.obsSet,
	                                    promise: promise,
	                                    subscribers: new Set(),
	                                    type: 'query',
	                                    req: req,
	                                    dirty: false,
	                                };
	                                if (container) {
	                                    container.push(cacheEntry);
	                                }
	                                else {
	                                    container = [cacheEntry];
	                                    if (!tblCache) {
	                                        tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
	                                            queries: {
	                                                query: {},
	                                                count: {},
	                                            },
	                                            objs: new Map(),
	                                            optimisticOps: [],
	                                            unsignaledParts: {}
	                                        };
	                                    }
	                                    tblCache.queries.query[req.query.index.name || ''] = container;
	                                }
	                            }
	                            subscribeToCacheEntry(cacheEntry, container, requery, signal);
	                            return cacheEntry.promise.then(function (res) {
	                                return {
	                                    result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults),
	                                };
	                            });
	                        } });
	                    return tableMW;
	                } });
	            return coreMW;
	        },
	    };

	    function vipify(target, vipDb) {
	        return new Proxy(target, {
	            get: function (target, prop, receiver) {
	                if (prop === 'db')
	                    return vipDb;
	                return Reflect.get(target, prop, receiver);
	            }
	        });
	    }

	    var Dexie$1 =  (function () {
	        function Dexie(name, options) {
	            var _this = this;
	            this._middlewares = {};
	            this.verno = 0;
	            var deps = Dexie.dependencies;
	            this._options = options = __assign({
	                addons: Dexie.addons, autoOpen: true,
	                indexedDB: deps.indexedDB, IDBKeyRange: deps.IDBKeyRange, cache: 'cloned' }, options);
	            this._deps = {
	                indexedDB: options.indexedDB,
	                IDBKeyRange: options.IDBKeyRange
	            };
	            var addons = options.addons;
	            this._dbSchema = {};
	            this._versions = [];
	            this._storeNames = [];
	            this._allTables = {};
	            this.idbdb = null;
	            this._novip = this;
	            var state = {
	                dbOpenError: null,
	                isBeingOpened: false,
	                onReadyBeingFired: null,
	                openComplete: false,
	                dbReadyResolve: nop,
	                dbReadyPromise: null,
	                cancelOpen: nop,
	                openCanceller: null,
	                autoSchema: true,
	                PR1398_maxLoop: 3,
	                autoOpen: options.autoOpen,
	            };
	            state.dbReadyPromise = new DexiePromise(function (resolve) {
	                state.dbReadyResolve = resolve;
	            });
	            state.openCanceller = new DexiePromise(function (_, reject) {
	                state.cancelOpen = reject;
	            });
	            this._state = state;
	            this.name = name;
	            this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
	            this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
	                return function (subscriber, bSticky) {
	                    Dexie.vip(function () {
	                        var state = _this._state;
	                        if (state.openComplete) {
	                            if (!state.dbOpenError)
	                                DexiePromise.resolve().then(subscriber);
	                            if (bSticky)
	                                subscribe(subscriber);
	                        }
	                        else if (state.onReadyBeingFired) {
	                            state.onReadyBeingFired.push(subscriber);
	                            if (bSticky)
	                                subscribe(subscriber);
	                        }
	                        else {
	                            subscribe(subscriber);
	                            var db_1 = _this;
	                            if (!bSticky)
	                                subscribe(function unsubscribe() {
	                                    db_1.on.ready.unsubscribe(subscriber);
	                                    db_1.on.ready.unsubscribe(unsubscribe);
	                                });
	                        }
	                    });
	                };
	            });
	            this.Collection = createCollectionConstructor(this);
	            this.Table = createTableConstructor(this);
	            this.Transaction = createTransactionConstructor(this);
	            this.Version = createVersionConstructor(this);
	            this.WhereClause = createWhereClauseConstructor(this);
	            this.on("versionchange", function (ev) {
	                if (ev.newVersion > 0)
	                    console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
	                else
	                    console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
	                _this.close({ disableAutoOpen: false });
	            });
	            this.on("blocked", function (ev) {
	                if (!ev.newVersion || ev.newVersion < ev.oldVersion)
	                    console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
	                else
	                    console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
	            });
	            this._maxKey = getMaxKey(options.IDBKeyRange);
	            this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) { return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction); };
	            this._fireOnBlocked = function (ev) {
	                _this.on("blocked").fire(ev);
	                connections
	                    .filter(function (c) { return c.name === _this.name && c !== _this && !c._state.vcFired; })
	                    .map(function (c) { return c.on("versionchange").fire(ev); });
	            };
	            this.use(cacheExistingValuesMiddleware);
	            this.use(cacheMiddleware);
	            this.use(observabilityMiddleware);
	            this.use(virtualIndexMiddleware);
	            this.use(hooksMiddleware);
	            var vipDB = new Proxy(this, {
	                get: function (_, prop, receiver) {
	                    if (prop === '_vip')
	                        return true;
	                    if (prop === 'table')
	                        return function (tableName) { return vipify(_this.table(tableName), vipDB); };
	                    var rv = Reflect.get(_, prop, receiver);
	                    if (rv instanceof Table)
	                        return vipify(rv, vipDB);
	                    if (prop === 'tables')
	                        return rv.map(function (t) { return vipify(t, vipDB); });
	                    if (prop === '_createTransaction')
	                        return function () {
	                            var tx = rv.apply(this, arguments);
	                            return vipify(tx, vipDB);
	                        };
	                    return rv;
	                }
	            });
	            this.vip = vipDB;
	            addons.forEach(function (addon) { return addon(_this); });
	        }
	        Dexie.prototype.version = function (versionNumber) {
	            if (isNaN(versionNumber) || versionNumber < 0.1)
	                throw new exceptions.Type("Given version is not a positive number");
	            versionNumber = Math.round(versionNumber * 10) / 10;
	            if (this.idbdb || this._state.isBeingOpened)
	                throw new exceptions.Schema("Cannot add version when database is open");
	            this.verno = Math.max(this.verno, versionNumber);
	            var versions = this._versions;
	            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
	            if (versionInstance)
	                return versionInstance;
	            versionInstance = new this.Version(versionNumber);
	            versions.push(versionInstance);
	            versions.sort(lowerVersionFirst);
	            versionInstance.stores({});
	            this._state.autoSchema = false;
	            return versionInstance;
	        };
	        Dexie.prototype._whenReady = function (fn) {
	            var _this = this;
	            return (this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip)) ? fn() : new DexiePromise(function (resolve, reject) {
	                if (_this._state.openComplete) {
	                    return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
	                }
	                if (!_this._state.isBeingOpened) {
	                    if (!_this._state.autoOpen) {
	                        reject(new exceptions.DatabaseClosed());
	                        return;
	                    }
	                    _this.open().catch(nop);
	                }
	                _this._state.dbReadyPromise.then(resolve, reject);
	            }).then(fn);
	        };
	        Dexie.prototype.use = function (_a) {
	            var stack = _a.stack, create = _a.create, level = _a.level, name = _a.name;
	            if (name)
	                this.unuse({ stack: stack, name: name });
	            var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
	            middlewares.push({ stack: stack, create: create, level: level == null ? 10 : level, name: name });
	            middlewares.sort(function (a, b) { return a.level - b.level; });
	            return this;
	        };
	        Dexie.prototype.unuse = function (_a) {
	            var stack = _a.stack, name = _a.name, create = _a.create;
	            if (stack && this._middlewares[stack]) {
	                this._middlewares[stack] = this._middlewares[stack].filter(function (mw) {
	                    return create ? mw.create !== create :
	                        name ? mw.name !== name :
	                            false;
	                });
	            }
	            return this;
	        };
	        Dexie.prototype.open = function () {
	            var _this = this;
	            return usePSD(globalPSD,
	            function () { return dexieOpen(_this); });
	        };
	        Dexie.prototype._close = function () {
	            var state = this._state;
	            var idx = connections.indexOf(this);
	            if (idx >= 0)
	                connections.splice(idx, 1);
	            if (this.idbdb) {
	                try {
	                    this.idbdb.close();
	                }
	                catch (e) { }
	                this.idbdb = null;
	            }
	            if (!state.isBeingOpened) {
	                state.dbReadyPromise = new DexiePromise(function (resolve) {
	                    state.dbReadyResolve = resolve;
	                });
	                state.openCanceller = new DexiePromise(function (_, reject) {
	                    state.cancelOpen = reject;
	                });
	            }
	        };
	        Dexie.prototype.close = function (_a) {
	            var _b = _a === void 0 ? { disableAutoOpen: true } : _a, disableAutoOpen = _b.disableAutoOpen;
	            var state = this._state;
	            if (disableAutoOpen) {
	                if (state.isBeingOpened) {
	                    state.cancelOpen(new exceptions.DatabaseClosed());
	                }
	                this._close();
	                state.autoOpen = false;
	                state.dbOpenError = new exceptions.DatabaseClosed();
	            }
	            else {
	                this._close();
	                state.autoOpen = this._options.autoOpen ||
	                    state.isBeingOpened;
	                state.openComplete = false;
	                state.dbOpenError = null;
	            }
	        };
	        Dexie.prototype.delete = function (closeOptions) {
	            var _this = this;
	            if (closeOptions === void 0) { closeOptions = { disableAutoOpen: true }; }
	            var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== 'object';
	            var state = this._state;
	            return new DexiePromise(function (resolve, reject) {
	                var doDelete = function () {
	                    _this.close(closeOptions);
	                    var req = _this._deps.indexedDB.deleteDatabase(_this.name);
	                    req.onsuccess = wrap(function () {
	                        _onDatabaseDeleted(_this._deps, _this.name);
	                        resolve();
	                    });
	                    req.onerror = eventRejectHandler(reject);
	                    req.onblocked = _this._fireOnBlocked;
	                };
	                if (hasInvalidArguments)
	                    throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
	                if (state.isBeingOpened) {
	                    state.dbReadyPromise.then(doDelete);
	                }
	                else {
	                    doDelete();
	                }
	            });
	        };
	        Dexie.prototype.backendDB = function () {
	            return this.idbdb;
	        };
	        Dexie.prototype.isOpen = function () {
	            return this.idbdb !== null;
	        };
	        Dexie.prototype.hasBeenClosed = function () {
	            var dbOpenError = this._state.dbOpenError;
	            return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
	        };
	        Dexie.prototype.hasFailed = function () {
	            return this._state.dbOpenError !== null;
	        };
	        Dexie.prototype.dynamicallyOpened = function () {
	            return this._state.autoSchema;
	        };
	        Object.defineProperty(Dexie.prototype, "tables", {
	            get: function () {
	                var _this = this;
	                return keys(this._allTables).map(function (name) { return _this._allTables[name]; });
	            },
	            enumerable: false,
	            configurable: true
	        });
	        Dexie.prototype.transaction = function () {
	            var args = extractTransactionArgs.apply(this, arguments);
	            return this._transaction.apply(this, args);
	        };
	        Dexie.prototype._transaction = function (mode, tables, scopeFunc) {
	            var _this = this;
	            var parentTransaction = PSD.trans;
	            if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1)
	                parentTransaction = null;
	            var onlyIfCompatible = mode.indexOf('?') !== -1;
	            mode = mode.replace('!', '').replace('?', '');
	            var idbMode, storeNames;
	            try {
	                storeNames = tables.map(function (table) {
	                    var storeName = table instanceof _this.Table ? table.name : table;
	                    if (typeof storeName !== 'string')
	                        throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
	                    return storeName;
	                });
	                if (mode == "r" || mode === READONLY)
	                    idbMode = READONLY;
	                else if (mode == "rw" || mode == READWRITE)
	                    idbMode = READWRITE;
	                else
	                    throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
	                if (parentTransaction) {
	                    if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
	                        if (onlyIfCompatible) {
	                            parentTransaction = null;
	                        }
	                        else
	                            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
	                    }
	                    if (parentTransaction) {
	                        storeNames.forEach(function (storeName) {
	                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
	                                if (onlyIfCompatible) {
	                                    parentTransaction = null;
	                                }
	                                else
	                                    throw new exceptions.SubTransaction("Table " + storeName +
	                                        " not included in parent transaction.");
	                            }
	                        });
	                    }
	                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
	                        parentTransaction = null;
	                    }
	                }
	            }
	            catch (e) {
	                return parentTransaction ?
	                    parentTransaction._promise(null, function (_, reject) { reject(e); }) :
	                    rejection(e);
	            }
	            var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
	            return (parentTransaction ?
	                parentTransaction._promise(idbMode, enterTransaction, "lock") :
	                PSD.trans ?
	                    usePSD(PSD.transless, function () { return _this._whenReady(enterTransaction); }) :
	                    this._whenReady(enterTransaction));
	        };
	        Dexie.prototype.table = function (tableName) {
	            if (!hasOwn(this._allTables, tableName)) {
	                throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
	            }
	            return this._allTables[tableName];
	        };
	        return Dexie;
	    }());

	    var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol
	        ? Symbol.observable
	        : "@@observable";
	    var Observable =  (function () {
	        function Observable(subscribe) {
	            this._subscribe = subscribe;
	        }
	        Observable.prototype.subscribe = function (x, error, complete) {
	            return this._subscribe(!x || typeof x === "function" ? { next: x, error: error, complete: complete } : x);
	        };
	        Observable.prototype[symbolObservable] = function () {
	            return this;
	        };
	        return Observable;
	    }());

	    var domDeps;
	    try {
	        domDeps = {
	            indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
	            IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
	        };
	    }
	    catch (e) {
	        domDeps = { indexedDB: null, IDBKeyRange: null };
	    }

	    function liveQuery(querier) {
	        var hasValue = false;
	        var currentValue;
	        var observable = new Observable(function (observer) {
	            var scopeFuncIsAsync = isAsyncFunction(querier);
	            function execute(ctx) {
	                var wasRootExec = beginMicroTickScope();
	                try {
	                    if (scopeFuncIsAsync) {
	                        incrementExpectedAwaits();
	                    }
	                    var rv = newScope(querier, ctx);
	                    if (scopeFuncIsAsync) {
	                        rv = rv.finally(decrementExpectedAwaits);
	                    }
	                    return rv;
	                }
	                finally {
	                    wasRootExec && endMicroTickScope();
	                }
	            }
	            var closed = false;
	            var abortController;
	            var accumMuts = {};
	            var currentObs = {};
	            var subscription = {
	                get closed() {
	                    return closed;
	                },
	                unsubscribe: function () {
	                    if (closed)
	                        return;
	                    closed = true;
	                    if (abortController)
	                        abortController.abort();
	                    if (startedListening)
	                        globalEvents.storagemutated.unsubscribe(mutationListener);
	                },
	            };
	            observer.start && observer.start(subscription);
	            var startedListening = false;
	            var doQuery = function () { return execInGlobalContext(_doQuery); };
	            function shouldNotify() {
	                return obsSetsOverlap(currentObs, accumMuts);
	            }
	            var mutationListener = function (parts) {
	                extendObservabilitySet(accumMuts, parts);
	                if (shouldNotify()) {
	                    doQuery();
	                }
	            };
	            var _doQuery = function () {
	                if (closed ||
	                    !domDeps.indexedDB)
	                 {
	                    return;
	                }
	                accumMuts = {};
	                var subscr = {};
	                if (abortController)
	                    abortController.abort();
	                abortController = new AbortController();
	                var ctx = {
	                    subscr: subscr,
	                    signal: abortController.signal,
	                    requery: doQuery,
	                    querier: querier,
	                    trans: null
	                };
	                var ret = execute(ctx);
	                Promise.resolve(ret).then(function (result) {
	                    hasValue = true;
	                    currentValue = result;
	                    if (closed || ctx.signal.aborted) {
	                        return;
	                    }
	                    accumMuts = {};
	                    currentObs = subscr;
	                    if (!objectIsEmpty(currentObs) && !startedListening) {
	                        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
	                        startedListening = true;
	                    }
	                    execInGlobalContext(function () { return !closed && observer.next && observer.next(result); });
	                }, function (err) {
	                    hasValue = false;
	                    if (!['DatabaseClosedError', 'AbortError'].includes(err === null || err === void 0 ? void 0 : err.name)) {
	                        if (!closed)
	                            execInGlobalContext(function () {
	                                if (closed)
	                                    return;
	                                observer.error && observer.error(err);
	                            });
	                    }
	                });
	            };
	            setTimeout(doQuery, 0);
	            return subscription;
	        });
	        observable.hasValue = function () { return hasValue; };
	        observable.getValue = function () { return currentValue; };
	        return observable;
	    }

	    var Dexie = Dexie$1;
	    props(Dexie, __assign(__assign({}, fullNameExceptions), {
	        delete: function (databaseName) {
	            var db = new Dexie(databaseName, { addons: [] });
	            return db.delete();
	        },
	        exists: function (name) {
	            return new Dexie(name, { addons: [] }).open().then(function (db) {
	                db.close();
	                return true;
	            }).catch('NoSuchDatabaseError', function () { return false; });
	        },
	        getDatabaseNames: function (cb) {
	            try {
	                return getDatabaseNames(Dexie.dependencies).then(cb);
	            }
	            catch (_a) {
	                return rejection(new exceptions.MissingAPI());
	            }
	        },
	        defineClass: function () {
	            function Class(content) {
	                extend(this, content);
	            }
	            return Class;
	        }, ignoreTransaction: function (scopeFunc) {
	            return PSD.trans ?
	                usePSD(PSD.transless, scopeFunc) :
	                scopeFunc();
	        }, vip: vip, async: function (generatorFn) {
	            return function () {
	                try {
	                    var rv = awaitIterator(generatorFn.apply(this, arguments));
	                    if (!rv || typeof rv.then !== 'function')
	                        return DexiePromise.resolve(rv);
	                    return rv;
	                }
	                catch (e) {
	                    return rejection(e);
	                }
	            };
	        }, spawn: function (generatorFn, args, thiz) {
	            try {
	                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
	                if (!rv || typeof rv.then !== 'function')
	                    return DexiePromise.resolve(rv);
	                return rv;
	            }
	            catch (e) {
	                return rejection(e);
	            }
	        },
	        currentTransaction: {
	            get: function () { return PSD.trans || null; }
	        }, waitFor: function (promiseOrFunction, optionalTimeout) {
	            var promise = DexiePromise.resolve(typeof promiseOrFunction === 'function' ?
	                Dexie.ignoreTransaction(promiseOrFunction) :
	                promiseOrFunction)
	                .timeout(optionalTimeout || 60000);
	            return PSD.trans ?
	                PSD.trans.waitFor(promise) :
	                promise;
	        },
	        Promise: DexiePromise,
	        debug: {
	            get: function () { return debug; },
	            set: function (value) {
	                setDebug(value);
	            }
	        },
	        derive: derive, extend: extend, props: props, override: override,
	        Events: Events, on: globalEvents, liveQuery: liveQuery, extendObservabilitySet: extendObservabilitySet,
	        getByKeyPath: getByKeyPath, setByKeyPath: setByKeyPath, delByKeyPath: delByKeyPath, shallowClone: shallowClone, deepClone: deepClone, getObjectDiff: getObjectDiff, cmp: cmp, asap: asap$1,
	        minKey: minKey,
	        addons: [],
	        connections: connections,
	        errnames: errnames,
	        dependencies: domDeps, cache: cache,
	        semVer: DEXIE_VERSION, version: DEXIE_VERSION.split('.')
	            .map(function (n) { return parseInt(n); })
	            .reduce(function (p, c, i) { return p + (c / Math.pow(10, i * 2)); }) }));
	    Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);

	    if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
	        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function (updatedParts) {
	            if (!propagatingLocally) {
	                var event_1;
	                event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
	                    detail: updatedParts
	                });
	                propagatingLocally = true;
	                dispatchEvent(event_1);
	                propagatingLocally = false;
	            }
	        });
	        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function (_a) {
	            var detail = _a.detail;
	            if (!propagatingLocally) {
	                propagateLocally(detail);
	            }
	        });
	    }
	    function propagateLocally(updateParts) {
	        var wasMe = propagatingLocally;
	        try {
	            propagatingLocally = true;
	            globalEvents.storagemutated.fire(updateParts);
	            signalSubscribersNow(updateParts, true);
	        }
	        finally {
	            propagatingLocally = wasMe;
	        }
	    }
	    var propagatingLocally = false;

	    var bc;
	    var createBC = function () { };
	    if (typeof BroadcastChannel !== 'undefined') {
	        createBC = function () {
	            bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
	            bc.onmessage = function (ev) { return ev.data && propagateLocally(ev.data); };
	        };
	        createBC();
	        if (typeof bc.unref === 'function') {
	            bc.unref();
	        }
	        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function (changedParts) {
	            if (!propagatingLocally) {
	                bc.postMessage(changedParts);
	            }
	        });
	    }

	    if (typeof addEventListener !== 'undefined') {
	        addEventListener('pagehide', function (event) {
	            if (!Dexie$1.disableBfCache && event.persisted) {
	                if (debug)
	                    console.debug('Dexie: handling persisted pagehide');
	                bc === null || bc === void 0 ? void 0 : bc.close();
	                for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
	                    var db = connections_1[_i];
	                    db.close({ disableAutoOpen: false });
	                }
	            }
	        });
	        addEventListener('pageshow', function (event) {
	            if (!Dexie$1.disableBfCache && event.persisted) {
	                if (debug)
	                    console.debug('Dexie: handling persisted pageshow');
	                createBC();
	                propagateLocally({ all: new RangeSet(-Infinity, [[]]) });
	            }
	        });
	    }

	    function add(value) {
	        return new PropModification({ add: value });
	    }

	    function remove(value) {
	        return new PropModification({ remove: value });
	    }

	    function replacePrefix(a, b) {
	        return new PropModification({ replacePrefix: [a, b] });
	    }

	    DexiePromise.rejectionMapper = mapError;
	    setDebug(debug);

	    var namedExports = /*#__PURE__*/Object.freeze({
	        __proto__: null,
	        Dexie: Dexie$1,
	        liveQuery: liveQuery,
	        Entity: Entity,
	        cmp: cmp,
	        PropModSymbol: PropModSymbol,
	        PropModification: PropModification,
	        replacePrefix: replacePrefix,
	        add: add,
	        remove: remove,
	        'default': Dexie$1,
	        RangeSet: RangeSet,
	        mergeRanges: mergeRanges,
	        rangesOverlap: rangesOverlap
	    });

	    __assign(Dexie$1, namedExports, { default: Dexie$1 });

	    return Dexie$1;

	}));
	
} (dexie));

var dexieExports = dexie.exports;
var _Dexie = /*@__PURE__*/getDefaultExportFromCjs(dexieExports);

// Making the module version consumable via require - to prohibit
// multiple occurrancies of the same module in the same app
// (dual package hazard, https://nodejs.org/api/packages.html#dual-package-hazard)
const DexieSymbol = Symbol.for("Dexie");
const Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = _Dexie);
if (_Dexie.semVer !== Dexie.semVer) {
    throw new Error(`Two different versions of Dexie loaded in the same app: ${_Dexie.semVer} and ${Dexie.semVer}`);
}

var DEXIE_DOCS_TABLE_NAME = 'docs';
var DEXIE_CHANGES_TABLE_NAME = 'changes';
var DEXIE_ATTACHMENTS_TABLE_NAME = 'attachments';
var RX_STORAGE_NAME_DEXIE = 'dexie';
var DEXIE_STATE_DB_BY_NAME = new Map();
var REF_COUNT_PER_DEXIE_DB = new Map();
function getDexieDbWithTables(databaseName, collectionName, settings, schema) {
  var dexieDbName = 'rxdb-dexie-' + databaseName + '--' + schema.version + '--' + collectionName;
  var state = getFromMapOrCreate(DEXIE_STATE_DB_BY_NAME, dexieDbName, () => {
    var value = (async () => {
      /**
       * IndexedDB was not designed for dynamically adding tables on the fly,
       * so we create one dexie database per RxDB storage instance.
       * @link https://github.com/dexie/Dexie.js/issues/684#issuecomment-373224696
       */
      var useSettings = flatClone(settings);
      useSettings.autoOpen = false;
      var dexieDb = new Dexie(dexieDbName, useSettings);
      var dexieStoresSettings = {
        [DEXIE_DOCS_TABLE_NAME]: getDexieStoreSchema(schema),
        [DEXIE_CHANGES_TABLE_NAME]: '++sequence, id',
        [DEXIE_ATTACHMENTS_TABLE_NAME]: 'id'
      };
      dexieDb.version(1).stores(dexieStoresSettings);
      await dexieDb.open();
      return {
        dexieDb,
        dexieTable: dexieDb[DEXIE_DOCS_TABLE_NAME],
        dexieAttachmentsTable: dexieDb[DEXIE_ATTACHMENTS_TABLE_NAME],
        booleanIndexes: getBooleanIndexes(schema)
      };
    })();
    DEXIE_STATE_DB_BY_NAME.set(dexieDbName, state);
    REF_COUNT_PER_DEXIE_DB.set(state, 0);
    return value;
  });
  return state;
}
async function closeDexieDb(statePromise) {
  var state = await statePromise;
  var prevCount = REF_COUNT_PER_DEXIE_DB.get(statePromise);
  var newCount = prevCount - 1;
  if (newCount === 0) {
    state.dexieDb.close();
    REF_COUNT_PER_DEXIE_DB.delete(statePromise);
  } else {
    REF_COUNT_PER_DEXIE_DB.set(statePromise, newCount);
  }
}

/**
 * It is not possible to set non-javascript-variable-syntax
 * keys as IndexedDB indexes. So we have to substitute the pipe-char
 * which comes from the key-compression plugin.
 */
var DEXIE_PIPE_SUBSTITUTE = '__';
function dexieReplaceIfStartsWithPipe(str) {
  var split = str.split('.');
  if (split.length > 1) {
    return split.map(part => dexieReplaceIfStartsWithPipe(part)).join('.');
  }
  if (str.startsWith('|')) {
    var withoutFirst = str.substring(1);
    return DEXIE_PIPE_SUBSTITUTE + withoutFirst;
  } else {
    return str;
  }
}
function dexieReplaceIfStartsWithPipeRevert(str) {
  var split = str.split('.');
  if (split.length > 1) {
    return split.map(part => dexieReplaceIfStartsWithPipeRevert(part)).join('.');
  }
  if (str.startsWith(DEXIE_PIPE_SUBSTITUTE)) {
    var withoutFirst = str.substring(DEXIE_PIPE_SUBSTITUTE.length);
    return '|' + withoutFirst;
  } else {
    return str;
  }
}

/**
 * IndexedDB does not support boolean indexing.
 * So we have to replace true/false with '1'/'0'
 * @param d 
 */
function fromStorageToDexie(booleanIndexes, d) {
  if (!d) {
    return d;
  }
  d = flatClone(d);
  d = fromStorageToDexieField(d);
  booleanIndexes.forEach(idx => {
    var val = getProperty$1(d, idx);
    var newVal = val ? '1' : '0';
    setProperty(d, idx, newVal);
  });
  return d;
}
function fromDexieToStorage(booleanIndexes, d) {
  if (!d) {
    return d;
  }
  d = flatClone(d);
  d = fromDexieToStorageField(d);
  booleanIndexes.forEach(idx => {
    var val = getProperty$1(d, idx);
    var newVal = val === '1' ? true : false;
    setProperty(d, idx, newVal);
  });
  return d;
}

/**
 * @recursive
 */
function fromStorageToDexieField(documentData) {
  if (!documentData || typeof documentData === 'string' || typeof documentData === 'number' || typeof documentData === 'boolean') {
    return documentData;
  } else if (Array.isArray(documentData)) {
    return documentData.map(row => fromStorageToDexieField(row));
  } else if (typeof documentData === 'object') {
    var ret = {};
    Object.entries(documentData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        value = fromStorageToDexieField(value);
      }
      ret[dexieReplaceIfStartsWithPipe(key)] = value;
    });
    return ret;
  }
}
function fromDexieToStorageField(documentData) {
  if (!documentData || typeof documentData === 'string' || typeof documentData === 'number' || typeof documentData === 'boolean') {
    return documentData;
  } else if (Array.isArray(documentData)) {
    return documentData.map(row => fromDexieToStorageField(row));
  } else if (typeof documentData === 'object') {
    var ret = {};
    Object.entries(documentData).forEach(([key, value]) => {
      if (typeof value === 'object' || Array.isArray(documentData)) {
        value = fromDexieToStorageField(value);
      }
      ret[dexieReplaceIfStartsWithPipeRevert(key)] = value;
    });
    return ret;
  }
}

/**
 * Creates a string that can be used to create the dexie store.
 * @link https://dexie.org/docs/API-Reference#quick-reference
 */
function getDexieStoreSchema(rxJsonSchema) {
  var parts = [];

  /**
   * First part must be the primary key
   * @link https://github.com/dexie/Dexie.js/issues/1307#issuecomment-846590912
   */
  var primaryKey = getPrimaryFieldOfPrimaryKey(rxJsonSchema.primaryKey);
  parts.push([primaryKey]);
  parts.push(['_deleted', primaryKey]);

  // add other indexes
  if (rxJsonSchema.indexes) {
    rxJsonSchema.indexes.forEach(index => {
      var arIndex = toArray(index);
      parts.push(arIndex);
    });
  }

  // we also need the _meta.lwt+primaryKey index for the getChangedDocumentsSince() method.
  parts.push(['_meta.lwt', primaryKey]);

  // and this one for the cleanup()
  parts.push(['_meta.lwt']);

  /**
   * It is not possible to set non-javascript-variable-syntax
   * keys as IndexedDB indexes. So we have to substitute the pipe-char
   * which comes from the key-compression plugin.
   */
  parts = parts.map(part => {
    return part.map(str => dexieReplaceIfStartsWithPipe(str));
  });
  var dexieSchemaRows = parts.map(part => {
    if (part.length === 1) {
      return part[0];
    } else {
      return '[' + part.join('+') + ']';
    }
  });
  dexieSchemaRows = dexieSchemaRows.filter((elem, pos, arr) => arr.indexOf(elem) === pos); // unique;
  var dexieSchema = dexieSchemaRows.join(', ');
  return dexieSchema;
}

/**
 * Returns all documents in the database.
 * Non-deleted plus deleted ones.
 */
async function getDocsInDb(internals, docIds) {
  var state = await internals;
  var docsInDb = await state.dexieTable.bulkGet(docIds);
  return docsInDb.map(d => fromDexieToStorage(state.booleanIndexes, d));
}
function attachmentObjectId(documentId, attachmentId) {
  return documentId + '||' + attachmentId;
}
function getBooleanIndexes(schema) {
  var checkedFields = new Set();
  var ret = [];
  if (!schema.indexes) {
    return ret;
  }
  schema.indexes.forEach(index => {
    var fields = toArray(index);
    fields.forEach(field => {
      if (checkedFields.has(field)) {
        return;
      }
      checkedFields.add(field);
      var schemaObj = getSchemaByObjectPath(schema, field);
      if (schemaObj.type === 'boolean') {
        ret.push(field);
      }
    });
  });
  ret.push('_deleted');
  return uniqueArray(ret);
}

function mapKeyForKeyRange(k) {
  if (k === INDEX_MIN) {
    return -Infinity;
  } else {
    return k;
  }
}
function rangeFieldToBooleanSubstitute(booleanIndexes, fieldName, value) {
  if (booleanIndexes.includes(fieldName)) {
    var newValue = value === INDEX_MAX || value === true ? '1' : '0';
    return newValue;
  } else {
    return value;
  }
}
function getKeyRangeByQueryPlan(booleanIndexes, queryPlan, IDBKeyRange) {
  if (!IDBKeyRange) {
    if (typeof window === 'undefined') {
      throw new Error('IDBKeyRange missing');
    } else {
      IDBKeyRange = window.IDBKeyRange;
    }
  }
  var startKeys = queryPlan.startKeys.map((v, i) => {
    var fieldName = queryPlan.index[i];
    return rangeFieldToBooleanSubstitute(booleanIndexes, fieldName, v);
  }).map(mapKeyForKeyRange);
  var endKeys = queryPlan.endKeys.map((v, i) => {
    var fieldName = queryPlan.index[i];
    return rangeFieldToBooleanSubstitute(booleanIndexes, fieldName, v);
  }).map(mapKeyForKeyRange);
  var keyRange = IDBKeyRange.bound(startKeys, endKeys, !queryPlan.inclusiveStart, !queryPlan.inclusiveEnd);
  return keyRange;
}

/**
 * Runs mango queries over the Dexie.js database.
 */
async function dexieQuery(instance, preparedQuery) {
  var state = await instance.internals;
  var query = preparedQuery.query;
  var skip = query.skip ? query.skip : 0;
  var limit = query.limit ? query.limit : Infinity;
  var skipPlusLimit = skip + limit;
  var queryPlan = preparedQuery.queryPlan;
  var queryMatcher = false;
  if (!queryPlan.selectorSatisfiedByIndex) {
    queryMatcher = getQueryMatcher(instance.schema, preparedQuery.query);
  }
  var keyRange = getKeyRangeByQueryPlan(state.booleanIndexes, queryPlan, state.dexieDb._options.IDBKeyRange);
  var queryPlanFields = queryPlan.index;
  var rows = [];
  await state.dexieDb.transaction('r', state.dexieTable, async dexieTx => {
    /**
     * TODO here we use the native IndexedDB transaction
     * to get the cursor.
     * Instead we should not leave Dexie.js API and find
     * a way to create the cursor with Dexie.js.
     */
    var tx = dexieTx.idbtrans;

    // const nativeIndexedDB = state.dexieDb.backendDB();
    // const trans = nativeIndexedDB.transaction([DEXIE_DOCS_TABLE_NAME], 'readonly');

    var store = tx.objectStore(DEXIE_DOCS_TABLE_NAME);
    var index;
    var indexName;
    indexName = '[' + queryPlanFields.map(field => dexieReplaceIfStartsWithPipe(field)).join('+') + ']';
    index = store.index(indexName);
    var cursorReq = index.openCursor(keyRange);
    await new Promise(res => {
      cursorReq.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          // We have a record in cursor.value
          var docData = fromDexieToStorage(state.booleanIndexes, cursor.value);
          if (!queryMatcher || queryMatcher(docData)) {
            rows.push(docData);
          }

          /**
           * If we do not have to manually sort
           * and have enough documents,
           * we can abort iterating over the cursor
           * because we already have every relevant document.
           */
          if (queryPlan.sortSatisfiedByIndex && rows.length === skipPlusLimit) {
            res();
          } else {
            cursor.continue();
          }
        } else {
          // Iteration complete
          res();
        }
      };
    });
  });
  if (!queryPlan.sortSatisfiedByIndex) {
    var sortComparator = getSortComparator(instance.schema, preparedQuery.query);
    rows = rows.sort(sortComparator);
  }

  // apply skip and limit boundaries.
  rows = rows.slice(skip, skipPlusLimit);

  /**
   * Comment this in for debugging to check all fields in the database.
   */
  // const docsInDb = await state.dexieTable.filter(queryMatcher).toArray();
  // let documents = docsInDb
  //     .map(docData => stripDexieKey(docData))
  //     .sort(sortComparator);
  // if (preparedQuery.skip) {
  //     documents = documents.slice(preparedQuery.skip);
  // }
  // if (preparedQuery.limit && documents.length > preparedQuery.limit) {
  //     documents = documents.slice(0, preparedQuery.limit);
  // }

  return {
    documents: rows
  };
}
async function dexieCount(instance, preparedQuery) {
  var state = await instance.internals;
  var queryPlan = preparedQuery.queryPlan;
  var queryPlanFields = queryPlan.index;
  var keyRange = getKeyRangeByQueryPlan(state.booleanIndexes, queryPlan, state.dexieDb._options.IDBKeyRange);
  var count = -1;
  await state.dexieDb.transaction('r', state.dexieTable, async dexieTx => {
    var tx = dexieTx.idbtrans;
    var store = tx.objectStore(DEXIE_DOCS_TABLE_NAME);
    var index;
    var indexName;
    indexName = '[' + queryPlanFields.map(field => dexieReplaceIfStartsWithPipe(field)).join('+') + ']';
    index = store.index(indexName);
    var request = index.count(keyRange);
    count = await new Promise((res, rej) => {
      request.onsuccess = function () {
        res(request.result);
      };
      request.onerror = err => rej(err);
    });
  });
  return count;
}

var instanceId = now$2();
var DEXIE_TEST_META_FIELD = 'dexieTestMetaField';
var shownNonPremiumLog = false;
var RxStorageInstanceDexie = /*#__PURE__*/function () {
  function RxStorageInstanceDexie(storage, databaseName, collectionName, schema, internals, options, settings, devMode) {
    this.changes$ = new Subject();
    this.instanceId = instanceId++;
    this.storage = storage;
    this.databaseName = databaseName;
    this.collectionName = collectionName;
    this.schema = schema;
    this.internals = internals;
    this.options = options;
    this.settings = settings;
    this.devMode = devMode;
    this.primaryPath = getPrimaryFieldOfPrimaryKey(this.schema.primaryKey);
  }
  var _proto = RxStorageInstanceDexie.prototype;
  _proto.bulkWrite = async function bulkWrite(documentWrites, context) {
    ensureNotClosed(this);
    if (!shownNonPremiumLog && (!RXDB_UTILS_GLOBAL.premium || typeof RXDB_UTILS_GLOBAL.premium !== 'string' || (await defaultHashSha256(RXDB_UTILS_GLOBAL.premium)) !== PREMIUM_FLAG_HASH)) {
      console.warn(['-------------- RxDB Open Core RxStorage -------------------------------', 'You are using the free Dexie.js based RxStorage implementation from RxDB https://rxdb.info/rx-storage-dexie.html?console=dexie ', 'While this is a great option, we want to let you know that there are faster storage solutions available in our premium plugins.', 'For professional users and production environments, we highly recommend considering these premium options to enhance performance and reliability.', ' https://rxdb.info/premium?console=dexie ', 'If you already purchased premium access you can disable this log by calling the setPremiumFlag() function from rxdb-premium/plugins/shared.', '---------------------------------------------------------------------'].join('\n'));
      shownNonPremiumLog = true;
    } else {
      shownNonPremiumLog = true;
    }

    /**
     * Check some assumptions to ensure RxDB
     * does not call the storage with an invalid write.
     */
    documentWrites.forEach(row => {
      // ensure revision is set
      if (!row.document._rev || row.previous && !row.previous._rev) {
        throw newRxError('SNH', {
          args: {
            row
          }
        });
      }

      // ensure prev-data is set
      if (this.devMode) {
        if (row.previous && (!row.previous._meta[DEXIE_TEST_META_FIELD] || row.previous._meta[DEXIE_TEST_META_FIELD] !== row.previous._rev)) {
          console.dir(row);
          throw new Error('missing or wrong _meta.' + DEXIE_TEST_META_FIELD);
        }
      }
    });
    var state = await this.internals;
    var ret = {
      success: [],
      error: []
    };

    /**
     * Some storages might add any _meta fields
     * internally. To ensure RxDB can work with that in the
     * test suite, we add a random field here.
     * To ensure 
     */
    if (this.devMode) {
      documentWrites = documentWrites.map(row => {
        var doc = flatCloneDocWithMeta(row.document);
        doc._meta[DEXIE_TEST_META_FIELD] = doc._rev;
        return {
          previous: row.previous,
          document: doc
        };
      });
    }
    var documentKeys = documentWrites.map(writeRow => writeRow.document[this.primaryPath]);
    var categorized;
    await state.dexieDb.transaction('rw', state.dexieTable, state.dexieAttachmentsTable, async () => {
      var docsInDbMap = new Map();
      var docsInDbWithInternals = await getDocsInDb(this.internals, documentKeys);
      docsInDbWithInternals.forEach(docWithDexieInternals => {
        var doc = docWithDexieInternals;
        if (doc) {
          docsInDbMap.set(doc[this.primaryPath], doc);
        }
        return doc;
      });
      categorized = categorizeBulkWriteRows(this, this.primaryPath, docsInDbMap, documentWrites, context);
      ret.error = categorized.errors;

      /**
       * Batch up the database operations
       * so we can later run them in bulk.
       */
      var bulkPutDocs = [];
      categorized.bulkInsertDocs.forEach(row => {
        ret.success.push(row.document);
        bulkPutDocs.push(row.document);
      });
      categorized.bulkUpdateDocs.forEach(row => {
        ret.success.push(row.document);
        bulkPutDocs.push(row.document);
      });
      bulkPutDocs = bulkPutDocs.map(d => fromStorageToDexie(state.booleanIndexes, d));
      if (bulkPutDocs.length > 0) {
        await state.dexieTable.bulkPut(bulkPutDocs);
      }

      // handle attachments
      var putAttachments = [];
      categorized.attachmentsAdd.forEach(attachment => {
        putAttachments.push({
          id: attachmentObjectId(attachment.documentId, attachment.attachmentId),
          data: attachment.attachmentData.data
        });
      });
      categorized.attachmentsUpdate.forEach(attachment => {
        putAttachments.push({
          id: attachmentObjectId(attachment.documentId, attachment.attachmentId),
          data: attachment.attachmentData.data
        });
      });
      await state.dexieAttachmentsTable.bulkPut(putAttachments);
      await state.dexieAttachmentsTable.bulkDelete(categorized.attachmentsRemove.map(attachment => attachmentObjectId(attachment.documentId, attachment.attachmentId)));
    });
    categorized = ensureNotFalsy(categorized);
    if (categorized.eventBulk.events.length > 0) {
      var lastState = ensureNotFalsy(categorized.newestRow).document;
      categorized.eventBulk.checkpoint = {
        id: lastState[this.primaryPath],
        lwt: lastState._meta.lwt
      };
      categorized.eventBulk.endTime = now$2();
      this.changes$.next(categorized.eventBulk);
    }
    return ret;
  };
  _proto.findDocumentsById = async function findDocumentsById(ids, deleted) {
    ensureNotClosed(this);
    var state = await this.internals;
    var ret = [];
    await state.dexieDb.transaction('r', state.dexieTable, async () => {
      var docsInDb = await getDocsInDb(this.internals, ids);
      docsInDb.forEach(documentInDb => {
        if (documentInDb && (!documentInDb._deleted || deleted)) {
          ret.push(documentInDb);
        }
      });
    });
    return ret;
  };
  _proto.query = function query(preparedQuery) {
    ensureNotClosed(this);
    return dexieQuery(this, preparedQuery);
  };
  _proto.count = async function count(preparedQuery) {
    if (preparedQuery.queryPlan.selectorSatisfiedByIndex) {
      var result = await dexieCount(this, preparedQuery);
      return {
        count: result,
        mode: 'fast'
      };
    } else {
      var _result = await dexieQuery(this, preparedQuery);
      return {
        count: _result.documents.length,
        mode: 'slow'
      };
    }
  };
  _proto.changeStream = function changeStream() {
    ensureNotClosed(this);
    return this.changes$.asObservable();
  };
  _proto.cleanup = async function cleanup(minimumDeletedTime) {
    ensureNotClosed(this);
    var state = await this.internals;
    await state.dexieDb.transaction('rw', state.dexieTable, async () => {
      var maxDeletionTime = now$2() - minimumDeletedTime;
      /**
       * TODO only fetch _deleted=true
       */
      var toRemove = await state.dexieTable.where('_meta.lwt').below(maxDeletionTime).toArray();
      var removeIds = [];
      toRemove.forEach(doc => {
        if (doc._deleted === '1') {
          removeIds.push(doc[this.primaryPath]);
        }
      });
      await state.dexieTable.bulkDelete(removeIds);
    });

    /**
     * TODO instead of deleting all deleted docs at once,
     * only clean up some of them and return false if there are more documents to clean up.
     * This ensures that when many documents have to be purged,
     * we do not block the more important tasks too long.
     */
    return true;
  };
  _proto.getAttachmentData = async function getAttachmentData(documentId, attachmentId, _digest) {
    ensureNotClosed(this);
    var state = await this.internals;
    var id = attachmentObjectId(documentId, attachmentId);
    return await state.dexieDb.transaction('r', state.dexieAttachmentsTable, async () => {
      var attachment = await state.dexieAttachmentsTable.get(id);
      if (attachment) {
        return attachment.data;
      } else {
        throw new Error('attachment missing documentId: ' + documentId + ' attachmentId: ' + attachmentId);
      }
    });
  };
  _proto.remove = async function remove() {
    ensureNotClosed(this);
    var state = await this.internals;
    await state.dexieTable.clear();
    return this.close();
  };
  _proto.close = function close() {
    if (this.closed) {
      return this.closed;
    }
    this.closed = (async () => {
      this.changes$.complete();
      await closeDexieDb(this.internals);
    })();
    return this.closed;
  };
  _proto.conflictResultionTasks = function conflictResultionTasks() {
    return new Subject();
  };
  _proto.resolveConflictResultionTask = async function resolveConflictResultionTask(_taskSolution) {};
  return RxStorageInstanceDexie;
}();
async function createDexieStorageInstance(storage, params, settings) {
  var internals = getDexieDbWithTables(params.databaseName, params.collectionName, settings, params.schema);
  var instance = new RxStorageInstanceDexie(storage, params.databaseName, params.collectionName, params.schema, internals, params.options, settings, params.devMode);
  await addRxStorageMultiInstanceSupport(RX_STORAGE_NAME_DEXIE, params, instance);
  return Promise.resolve(instance);
}
function ensureNotClosed(instance) {
  if (instance.closed) {
    throw new Error('RxStorageInstanceDexie is closed ' + instance.databaseName + '-' + instance.collectionName);
  }
}

var RxStorageDexie = /*#__PURE__*/function () {
  function RxStorageDexie(settings) {
    this.name = RX_STORAGE_NAME_DEXIE;
    this.rxdbVersion = RXDB_VERSION;
    this.settings = settings;
  }
  var _proto = RxStorageDexie.prototype;
  _proto.createStorageInstance = function createStorageInstance(params) {
    ensureRxStorageInstanceParamsAreCorrect(params);
    return createDexieStorageInstance(this, params, this.settings);
  };
  return RxStorageDexie;
}();
function getRxStorageDexie(settings = {}) {
  var storage = new RxStorageDexie(settings);
  return storage;
}

const schema$5 = {
    "title": "session",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "userId": {
            "type": "string"
        },
        "token": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "userId",
        "token",
    ]
};
const sessionSchema = schema$5;

const schema$4 = {
    "title": "space",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "title": {
            "type": "string"
        },
        "avatar": {
            "type": "string"
        },
        "tag": {
            "type": "string"
        },
        "isPublic": {
            "type": "boolean"
        }
    },
    "required": [
        "id",
        "title",
        "avatar",
        "tag",
        "isPublic",
    ]
};
const spaceSchema = schema$4;

const schema$3 = {
    "title": "topic",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "title": {
            "type": "string"
        },
        "avatar": {
            "type": "string"
        },
        "spaceId": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "title",
        "avatar",
        "spaceId",
    ]
};
const topicSchema = schema$3;

const schema$2 = {
    "title": "member",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "userId": {
            "type": "string"
        },
        "spaceId": {
            "type": "string"
        },
        "topicId": {
            "type": "string"
        },
        "metadata": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "userId",
        "spaceId",
        "topicId",
        "metadata"
    ]
};
const memberSchema = schema$2;

const schema$1 = {
    "title": "invite",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "userId": {
            "type": "string"
        },
        "spaceId": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "userId",
        "spaceId"
    ]
};
const inviteSchema = schema$1;

const schema = {
    "title": "user",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "privateKey": {
            "type": "string"
        },
        "publicKey": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "privateKey",
        "publicKey"
    ]
};
const secretSchema = schema;

addRxPlugin(RxDBDevModePlugin);
class Storage {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = yield createRxDatabase({
                name: 'sigma',
                storage: getRxStorageDexie(),
                password: 'sigma',
                multiInstance: true,
                eventReduce: true,
                cleanupPolicy: {}
            });
            yield this.db.addCollections({
                users: {
                    schema: userSchema
                },
                sessions: {
                    schema: sessionSchema
                },
                spaces: {
                    schema: spaceSchema
                },
                topics: {
                    schema: topicSchema
                },
                members: {
                    schema: memberSchema
                },
                invites: {
                    schema: inviteSchema
                },
                secrets: {
                    schema: secretSchema
                }
            });
            this.db.$.subscribe(changeEvent => console.dir(changeEvent));
        });
    }
}

class Users {
    constructor(net, store, security) {
        this.net = net;
        this.store = store;
        this.security = security;
    }
    create(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let publicKey = yield this.security.getMyPublicKey();
            let { success, result } = yield this.net.safelyRequest(1, "users/create", "POST", Object.assign(Object.assign({}, body), { publicKey }));
            if (success) {
                yield Promise.all([
                    this.store.db.users.insert(result.user),
                    this.store.db.sessions.insert(result.session)
                ]);
                return { success: true, data: { user: result.user } };
            }
            else {
                return { success: false, data: { error: result.toString() } };
            }
        });
    }
    get(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let { success, result } = yield this.net.safelyRequest(1, "users/get", "GET", body);
            if (success) {
                return { success: true, data: { user: result.user } };
            }
            else {
                return { success: false, data: { error: result.toString() } };
            }
        });
    }
}

class Security {
    constructor(storage) {
        this.groups = {};
        this.keyStore = {};
        this.storage = storage;
    }
    generateKeyPair() {
        return __awaiter(this, void 0, void 0, function* () {
            let secret = yield this.storage.db.secrets.findOne("me").exec();
            if (!secret) {
                let keyPair = yield window.crypto.subtle.generateKey({
                    name: "RSA-OAEP",
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                }, true, ["encrypt", "decrypt"]);
                this.myPrivateKey = keyPair.privateKey;
                this.myPublicKey = keyPair.publicKey;
                yield this.storage.db.secrets.insert({
                    id: "me",
                    publicKey: this.ab2b64(yield crypto.subtle.exportKey('spki', keyPair.publicKey)),
                    privateKey: this.ab2b64(yield crypto.subtle.exportKey('pkcs8', keyPair.privateKey))
                });
            }
            else {
                this.myPublicKey = yield this.parsePublicKey(secret.publicKey);
                this.myPrivateKey = yield this.parsePrivateKey(secret.privateKey);
            }
        });
    }
    getMyPrivateKey() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.myPrivateKey) {
                yield this.generateKeyPair();
            }
            return this.ab2b64(yield crypto.subtle.exportKey('spki', this.myPrivateKey));
        });
    }
    getMyPublicKey() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.myPublicKey) {
                yield this.generateKeyPair();
            }
            return this.ab2b64(yield crypto.subtle.exportKey('spki', this.myPublicKey));
        });
    }
    updateGroupPacketId(newIdentifier, oldIdentifier) {
        this.keyStore[newIdentifier] = this.keyStore[oldIdentifier];
        delete this.keyStore[oldIdentifier];
    }
    encryptGroupPacket(identifier, groupId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.groups[groupId].history[identifier] = this.groups[groupId].key.keyId;
            return yield this.encryptDataByKey(this.groups[groupId].key.key, data);
        });
    }
    reDecryptGroupPacket(identifier, groupId, cipher) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.decryptDataByKey(this.keyStore[this.groups[groupId].history[identifier]], cipher);
        });
    }
    decryptGroupPacket(identifier, groupId, cipher) {
        return __awaiter(this, void 0, void 0, function* () {
            this.groups[groupId].history[identifier] = this.groups[groupId].key.keyId;
            return yield this.decryptDataByKey(this.groups[groupId].key.key, cipher);
        });
    }
    decryptGroupKey(keyCipher) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.decryptKey(keyCipher);
        });
    }
    refreshGroupKey(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = this.groups[groupId];
            let { id, key } = yield this.generateNewKey();
            group.key = { keyId: id, key: key };
            return this.encryptKeyBatch(group.publicKeys, group.key.key);
        });
    }
    newGroup(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id, key } = yield this.generateNewKey();
            yield this.putGroup({
                groupId: groupId,
                key: { key: key, keyId: id },
                publicKeys: {},
                history: {}
            });
        });
    }
    deleteGroup(groupId) {
        delete this.groups[groupId];
    }
    putGroup(group) {
        return __awaiter(this, void 0, void 0, function* () {
            let g = {
                groupId: group.groupId,
                key: group.key,
                publicKeys: {},
                history: group.history
            };
            let ids = Object.keys(group.publicKeys);
            for (let i = 0; i < ids.length; i++) {
                g.publicKeys[ids[i]] = yield this.parsePublicKey(group.publicKeys[ids[i]]);
            }
            if (!this.groups[group.groupId]) {
                this.groups[group.groupId] = g;
            }
        });
    }
    generateNewKey() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = window.crypto.randomUUID().toString();
            this.keyStore[id] = yield window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
            return { id: id, key: this.keyStore[id] };
        });
    }
    parsePublicKey(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield window.crypto.subtle.importKey("spki", new Uint8Array(this.b642ab(publicKey)), { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
        });
    }
    parsePrivateKey(privateKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield window.crypto.subtle.importKey("pkcs8", new Uint8Array(this.b642ab(privateKey)), { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
        });
    }
    encryptKey(publicKey, key) {
        return __awaiter(this, void 0, void 0, function* () {
            let encodedKey = new TextEncoder().encode(key);
            return this.ab2b64(yield window.crypto.subtle.encrypt({
                name: "RSA-OAEP",
            }, publicKey, encodedKey));
        });
    }
    decryptKey(cipherKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const dec = new TextDecoder();
            return dec.decode(yield window.crypto.subtle.decrypt({
                name: "RSA-OAEP",
            }, this.myPrivateKey, this.b642ab(cipherKey)));
        });
    }
    encryptKeyBatch(keys, key) {
        return __awaiter(this, void 0, void 0, function* () {
            let exportedKey = yield crypto.subtle.exportKey('raw', key);
            let keyMap = {};
            let ids = Object.keys(keys);
            for (let i = 0; i < ids.length; i++) {
                keyMap[ids[i]] = this.ab2b64(yield window.crypto.subtle.encrypt({
                    name: "RSA-OAEP",
                }, keys[ids[i]], exportedKey));
            }
            return keyMap;
        });
    }
    encryptDataByKey(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let enc = new TextEncoder();
            let iv = crypto.getRandomValues(new Uint8Array(12));
            let ivStr = Array.from(iv).map(b => String.fromCharCode(b)).join('');
            let encrypted = yield window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(data));
            const ctArray = Array.from(new Uint8Array(encrypted));
            const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
            return btoa(ivStr + ctStr);
        });
    }
    decryptDataByKey(key, cipher) {
        return __awaiter(this, void 0, void 0, function* () {
            const ivStr = atob(cipher).slice(0, 12);
            const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0)));
            const ctStr = atob(cipher).slice(12);
            const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0)));
            const plainBuffer = yield window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ctUint8);
            return new TextDecoder().decode(plainBuffer);
        });
    }
    b642ab(base64string) {
        return Uint8Array.from(atob(base64string), c => c.charCodeAt(0)).buffer;
    }
    ab2b64(arrayBuffer) {
        return window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    }
}

class Sigma {
    constructor() {
        this.net = new Network();
        this.store = new Storage();
        this.security = new Security(this.store);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.run();
            this.services = {
                users: new Users(this.net, this.store, this.security)
            };
        });
    }
}

(() => __awaiter(void 0, void 0, void 0, function* () {
    let app = new Sigma();
    yield app.run();
    let { success: s1, data: d1 } = yield app.services.users.create({ username: "kasperius", secret: "0123", name: "keyhan", avatar: "123" });
    if (!s1) {
        console.log(d1.error);
        return;
    }
    console.log(d1.user);
    let { success: s2, data: d2 } = yield app.services.users.get({ userId: d1.user.id });
    if (!s2) {
        console.log(d2.error);
        return;
    }
    console.log(d2.user);
}))();
