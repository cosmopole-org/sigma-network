"use strict";
//
// Copyright 2020-2021 Signal Messenger, LLC.
// SPDX-License-Identifier: AGPL-3.0-only
//
Object.defineProperty(exports, "__esModule", { value: true });
const ByteArray_1 = require("../internal/ByteArray");
class ProfileKeyVersion extends ByteArray_1.default {
    constructor(contents) {
        super(typeof contents === 'string' ? Buffer.from(contents) : contents, ProfileKeyVersion.checkLength(ProfileKeyVersion.SIZE));
    }
    toString() {
        return this.contents.toString('utf8');
    }
}
exports.default = ProfileKeyVersion;
ProfileKeyVersion.SIZE = 64;
//# sourceMappingURL=ProfileKeyVersion.js.map