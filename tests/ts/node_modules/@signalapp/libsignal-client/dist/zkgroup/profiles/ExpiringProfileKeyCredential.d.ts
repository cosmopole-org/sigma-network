/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
export default class ExpiringProfileKeyCredential extends ByteArray {
    private readonly __type?;
    constructor(contents: Buffer);
    getExpirationTime(): Date;
}
