"use strict";
//
// Copyright 2022 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
class ExpiringProfileKeyCredentialResponse extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.ExpiringProfileKeyCredentialResponse_CheckValidContents);
    }
}
exports.default = ExpiringProfileKeyCredentialResponse;
//# sourceMappingURL=ExpiringProfileKeyCredentialResponse.js.map