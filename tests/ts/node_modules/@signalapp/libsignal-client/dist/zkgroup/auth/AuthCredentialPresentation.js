"use strict";
//
// Copyright 2020-2022 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const UuidCiphertext_1 = require("../groups/UuidCiphertext");
class AuthCredentialPresentation extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.AuthCredentialPresentation_CheckValidContents);
    }
    getUuidCiphertext() {
        return new UuidCiphertext_1.default(Native.AuthCredentialPresentation_GetUuidCiphertext(this.contents));
    }
    getPniCiphertext() {
        const ciphertextBytes = Native.AuthCredentialPresentation_GetPniCiphertext(this.contents);
        if (ciphertextBytes === null) {
            return null;
        }
        return new UuidCiphertext_1.default(ciphertextBytes);
    }
    getRedemptionTime() {
        return new Date(1000 * Native.AuthCredentialPresentation_GetRedemptionTime(this.contents));
    }
}
exports.default = AuthCredentialPresentation;
//# sourceMappingURL=AuthCredentialPresentation.js.map