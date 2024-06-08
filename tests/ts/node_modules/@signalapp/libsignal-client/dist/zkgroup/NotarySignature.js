"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("./internal/ByteArray");
class NotarySignature extends ByteArray_1.default {
    constructor(contents) {
        super(contents, NotarySignature.checkLength(NotarySignature.SIZE));
    }
}
exports.default = NotarySignature;
NotarySignature.SIZE = 64;
//# sourceMappingURL=NotarySignature.js.map