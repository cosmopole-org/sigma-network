/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
export default class GroupMasterKey extends ByteArray {
    private readonly __type?;
    static SIZE: number;
    constructor(contents: Buffer);
}
