"use strict";
//
// Copyright 2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const ReceiptCredentialRequest_1 = require("./ReceiptCredentialRequest");
class ReceiptCredentialRequestContext extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.ReceiptCredentialRequestContext_CheckValidContents);
    }
    getRequest() {
        return new ReceiptCredentialRequest_1.default(Native.ReceiptCredentialRequestContext_GetRequest(this.contents));
    }
}
exports.default = ReceiptCredentialRequestContext;
ReceiptCredentialRequestContext.SIZE = 177;
//# sourceMappingURL=ReceiptCredentialRequestContext.js.map