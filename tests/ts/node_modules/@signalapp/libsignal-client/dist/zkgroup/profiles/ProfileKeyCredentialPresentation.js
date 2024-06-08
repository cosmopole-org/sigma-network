"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const UuidCiphertext_1 = require("../groups/UuidCiphertext");
const ProfileKeyCiphertext_1 = require("../groups/ProfileKeyCiphertext");
class ProfileKeyCredentialPresentation extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.ProfileKeyCredentialPresentation_CheckValidContents);
    }
    getUuidCiphertext() {
        return new UuidCiphertext_1.default(Native.ProfileKeyCredentialPresentation_GetUuidCiphertext(this.contents));
    }
    getProfileKeyCiphertext() {
        return new ProfileKeyCiphertext_1.default(Native.ProfileKeyCredentialPresentation_GetProfileKeyCiphertext(this.contents));
    }
}
exports.default = ProfileKeyCredentialPresentation;
//# sourceMappingURL=ProfileKeyCredentialPresentation.js.map