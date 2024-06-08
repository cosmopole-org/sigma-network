"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
class GroupMasterKey extends ByteArray_1.default {
    constructor(contents) {
        super(contents, GroupMasterKey.checkLength(GroupMasterKey.SIZE));
    }
}
exports.default = GroupMasterKey;
GroupMasterKey.SIZE = 32;
//# sourceMappingURL=GroupMasterKey.js.map