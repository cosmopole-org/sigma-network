/// <reference types="node" />
import ByteArray from '../internal/ByteArray';
import ProfileKeyCredentialRequest from './ProfileKeyCredentialRequest';
export default class ProfileKeyCredentialRequestContext extends ByteArray {
    private readonly __type?;
    constructor(contents: Buffer);
    getRequest(): ProfileKeyCredentialRequest;
}
