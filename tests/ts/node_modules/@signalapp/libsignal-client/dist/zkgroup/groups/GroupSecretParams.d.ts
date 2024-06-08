/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import GroupMasterKey from './GroupMasterKey';
import GroupPublicParams from './GroupPublicParams';
export default class GroupSecretParams extends ByteArray {
    private readonly __type?;
    static generate(): GroupSecretParams;
    static generateWithRandom(random: Buffer): GroupSecretParams;
    static deriveFromMasterKey(groupMasterKey: GroupMasterKey): GroupSecretParams;
    constructor(contents: Buffer);
    getMasterKey(): GroupMasterKey;
    getPublicParams(): GroupPublicParams;
}
