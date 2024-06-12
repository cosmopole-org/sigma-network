
import CryptoJS from 'crypto-js';

export default class Security {
    private myKeyPair?: CryptoKeyPair
    private publicKeys: {[id: string]:CryptoKey} = {}
    private keySingles: {[id: string]: string} = {}
    public async getMyKeyPair() : Promise<CryptoKeyPair> {
        if (!this.myKeyPair) {
            this.myKeyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["encrypt", "decrypt"],
            );
            this.publicKeys["me"] = this.myKeyPair.publicKey
        }
        return this.myKeyPair;
    }
    public getOrGenerateSingleKey(keyId: string) : string {
        if (!this.keySingles[keyId]) {
            this.keySingles[keyId] = Array.from(
                window.crypto.getRandomValues(new Uint8Array(Math.ceil(32 / 2))),
                (b) => ("0" + (b & 0xFF).toString(16)).slice(-2)
            ).join("");
        }
        return this.keySingles[keyId];
    }
    public getSingleKey(keyId: string) : string {
        return this.keySingles[keyId]
    }
    public putSingleKey(keyId: string, key: string) : void {
        this.keySingles[keyId] = key;
    }
    public async encryptKeyByPublicKey(keyId: string, key: string): Promise<string> {
        let encodedKey = new TextEncoder().encode(key);
        return this.bufferKeyToHexStr(await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            this.publicKeys[keyId],
            encodedKey
        ));
    }
    public async decryptAndStoreKey(keyId: string, cipherKey: string): Promise<string> {
        let key = await this.decryptKey(cipherKey);
        this.putSingleKey(keyId, key);
        return key;
    }
    public async decryptKey(cipherKey: string): Promise<string> {
        const dec = new TextDecoder();
        return dec.decode(await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            this.myKeyPair.privateKey,
            this.b642ab(cipherKey)
        ));
    }
    public async encryptKeyBatch(keyIds: string[], key: string): Promise<{[id: string]: string}> {
        let encodedKey = new TextEncoder().encode(key);
        let keyMap: {[id: string]: string} = {};
        for (let i = 0; i < keyIds.length; i++) {
            keyMap[keyIds[i]] = this.ab2b64(await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                },
                this.publicKeys[keyIds[i]], // from generateKey or importKey above
                encodedKey // ArrayBuffer of data you want to encrypt
            ))
        }
        return keyMap;
    }
    public async encryptDataByKey(keyId: string, data: string): Promise<string> {
        return CryptoJS.AES.encrypt(
            data,
            this.keySingles[keyId]
        ).toString();
    }
    public async decryptDataByKey(keyId: string, cipher: string): Promise<string> {
        return CryptoJS.AES.decrypt(
            cipher,
            this.keySingles[keyId]
        ).toString(CryptoJS.enc.Utf8);
    }
    public async addRecipientKey(userId: string, publicKey: string) {
        this.publicKeys[userId] = await window.crypto.subtle.importKey("spki",
            new Uint8Array(this.b642ab(publicKey)),
            {name: "RSA-OAEP", hash: "SHA-256"},
            false,
            ["encrypt"]
        )
    }
    // internal functions
    private b642ab(base64string: string) : ArrayBuffer{
        return Uint8Array.from(atob(base64string), c => c.charCodeAt(0)).buffer;
    }
    private ab2b64(arrayBuffer: ArrayBuffer): string {
        return window.btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    }
    private toHex(buffer: Uint8Array) {
        return Array.from(buffer)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    }
    private bufferKeyToHexStr(buffer: ArrayBuffer) {
        return this.toHex(new Uint8Array(buffer));
    }
}
