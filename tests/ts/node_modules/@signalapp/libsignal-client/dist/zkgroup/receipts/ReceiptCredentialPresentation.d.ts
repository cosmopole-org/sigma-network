/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import ReceiptSerial from './ReceiptSerial';
export default class ReceiptCredentialPresentation extends ByteArray {
    private readonly __type?;
    static SIZE: number;
    constructor(contents: Buffer);
    getReceiptExpirationTime(): number;
    getReceiptLevel(): bigint;
    getReceiptSerialBytes(): ReceiptSerial;
}
