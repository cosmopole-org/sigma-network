"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const ProfileKeyCredentialRequest_1 = require("./ProfileKeyCredentialRequest");
class ProfileKeyCredentialRequestContext extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.ProfileKeyCredentialRequestContext_CheckValidContents);
    }
    getRequest() {
        return new ProfileKeyCredentialRequest_1.default(Native.ProfileKeyCredentialRequestContext_GetRequest(this.contents));
    }
}
exports.default = ProfileKeyCredentialRequestContext;
//# sourceMappingURL=ProfileKeyCredentialRequestContext.js.map