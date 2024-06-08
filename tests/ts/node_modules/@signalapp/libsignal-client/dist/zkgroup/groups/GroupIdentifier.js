"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
class GroupIdentifier extends ByteArray_1.default {
    constructor(contents) {
        super(contents, GroupIdentifier.checkLength(GroupIdentifier.SIZE));
    }
}
exports.default = GroupIdentifier;
GroupIdentifier.SIZE = 32;
//# sourceMappingURL=GroupIdentifier.js.map