/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
export default class ReceiptSerial extends ByteArray {
    private readonly __type?;
    static SIZE: number;
    constructor(contents: Buffer);
}
