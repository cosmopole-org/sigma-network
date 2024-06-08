/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import UuidCiphertext from '../groups/UuidCiphertext';
export default class AuthCredentialPresentation extends ByteArray {
    private readonly __type?;
    constructor(contents: Buffer);
    getUuidCiphertext(): UuidCiphertext;
    getPniCiphertext(): UuidCiphertext | null;
    getRedemptionTime(): Date;
}
