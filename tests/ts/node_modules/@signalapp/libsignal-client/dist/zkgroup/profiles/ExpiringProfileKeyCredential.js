"use strict";
//
// Copyright 2022 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
class ExpiringProfileKeyCredential extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.ExpiringProfileKeyCredential_CheckValidContents);
    }
    getExpirationTime() {
        return new Date(1000 *
            Native.ExpiringProfileKeyCredential_GetExpirationTime(this.contents));
    }
}
exports.default = ExpiringProfileKeyCredential;
//# sourceMappingURL=ExpiringProfileKeyCredential.js.map