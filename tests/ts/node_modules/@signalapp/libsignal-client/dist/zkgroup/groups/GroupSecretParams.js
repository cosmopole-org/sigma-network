"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const Constants_1 = require("../internal/Constants");
const GroupMasterKey_1 = require("./GroupMasterKey");
const GroupPublicParams_1 = require("./GroupPublicParams");
class GroupSecretParams extends ByteArray_1.default {
    static generate() {
        const random = (0, crypto_1.randomBytes)(Constants_1.RANDOM_LENGTH);
        return GroupSecretParams.generateWithRandom(random);
    }
    static generateWithRandom(random) {
        return new GroupSecretParams(Native.GroupSecretParams_GenerateDeterministic(random));
    }
    static deriveFromMasterKey(groupMasterKey) {
        return new GroupSecretParams(Native.GroupSecretParams_DeriveFromMasterKey(groupMasterKey.getContents()));
    }
    constructor(contents) {
        super(contents, Native.GroupSecretParams_CheckValidContents);
    }
    getMasterKey() {
        return new GroupMasterKey_1.default(Native.GroupSecretParams_GetMasterKey(this.contents));
    }
    getPublicParams() {
        return new GroupPublicParams_1.default(Native.GroupSecretParams_GetPublicParams(this.contents));
    }
}
exports.default = GroupSecretParams;
//# sourceMappingURL=GroupSecretParams.js.map