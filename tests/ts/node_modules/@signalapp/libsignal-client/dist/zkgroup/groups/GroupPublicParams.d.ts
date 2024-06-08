/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import GroupIdentifier from './GroupIdentifier';
export default class GroupPublicParams extends ByteArray {
    private readonly __type?;
    constructor(contents: Buffer);
    getGroupIdentifier(): GroupIdentifier;
}
