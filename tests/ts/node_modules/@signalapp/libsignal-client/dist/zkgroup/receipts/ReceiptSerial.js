"use strict";
//
// Copyright 2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
class ReceiptSerial extends ByteArray_1.default {
    constructor(contents) {
        super(contents, ReceiptSerial.checkLength(ReceiptSerial.SIZE));
    }
}
exports.default = ReceiptSerial;
ReceiptSerial.SIZE = 16;
//# sourceMappingURL=ReceiptSerial.js.map