/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import UuidCiphertext from '../groups/UuidCiphertext';
import ProfileKeyCiphertext from '../groups/ProfileKeyCiphertext';
export default class ProfileKeyCredentialPresentation extends ByteArray {
    private readonly __type?;
    constructor(contents: Buffer);
    getUuidCiphertext(): UuidCiphertext;
    getProfileKeyCiphertext(): ProfileKeyCiphertext;
}
