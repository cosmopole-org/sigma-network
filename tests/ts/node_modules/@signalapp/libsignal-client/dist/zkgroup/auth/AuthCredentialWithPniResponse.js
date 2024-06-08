"use strict";
//
// Copyright 2022 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
class AuthCredentialWithPniResponse extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.AuthCredentialWithPniResponse_CheckValidContents);
    }
}
exports.default = AuthCredentialWithPniResponse;
//# sourceMappingURL=AuthCredentialWithPniResponse.js.map