"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
const Native = require("../../../Native");
const GroupIdentifier_1 = require("./GroupIdentifier");
class GroupPublicParams extends ByteArray_1.default {
    constructor(contents) {
        super(contents, Native.GroupPublicParams_CheckValidContents);
    }
    getGroupIdentifier() {
        return new GroupIdentifier_1.default(Native.GroupPublicParams_GetGroupIdentifier(this.contents));
    }
}
exports.default = GroupPublicParams;
//# sourceMappingURL=GroupPublicParams.js.map