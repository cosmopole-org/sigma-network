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


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Security {
    constructor() {
        this.groups = {};
        this.keyStore = {};
    }
    getMyKeyPair() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.myKeyPair) {
                this.myKeyPair = yield window.crypto.subtle.generateKey({
                    name: "RSA-OAEP",
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                }, true, ["encrypt", "decrypt"]);
            }
            return this.myKeyPair;
        });
    }
    encryptGroupPacket(identifier, groupId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.groups[groupId].history[identifier] = this.groups[groupId].key.keyId;
            return yield this.encryptDataByKey(this.groups[groupId].key.key, data);
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
            return yield window.crypto.subtle.importKey("spki", new Uint8Array(this.b642ab(publicKey)), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
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
            }, this.myKeyPair.privateKey, this.b642ab(cipherKey)));
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
    toHex(buffer) {
        return Array.from(buffer)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }
}

(() => __awaiter(void 0, void 0, void 0, function* () {
    let security = new Security();
    const message = "hello world !";
    yield security.getMyKeyPair();
    console.log(message);
    yield security.newGroup("rasht");
    console.log("start");
    const cipher = yield security.encryptGroupPacket("1", "rasht", message);
    console.log(cipher);
    let messageBack = yield security.decryptGroupPacket("2", "rasht", cipher);
    console.log(messageBack);
    console.log("end");
}))();
