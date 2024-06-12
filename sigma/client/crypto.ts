
class Security {
    private keyPairs: {[id: string]: CryptoKeyPair}
    private keySingles: {[id: string]: string}
    public async generateKeyPair(keyId: string) : Promise<CryptoKeyPair> {
        let keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"],
        );
        this.keyPairs[keyId] = keyPair;
        return keyPair;
    }
    public async generateKey(keyId: string) : Promise<string> {
        let key = Array.from(
            window.crypto.getRandomValues(new Uint8Array(Math.ceil(32 / 2))),
            (b) => ("0" + (b & 0xFF).toString(16)).slice(-2)
        ).join("")
        this.keySingles[keyId] = key;
        return key;
    }
    public async encryptKeyByPublicKey(keyId: string, key: string) {
        let encodedKey = new TextEncoder().encode(key);
        return await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            this.keyPairs[keyId].publicKey, // from generateKey or importKey above
            encodedKey // ArrayBuffer of data you want to encrypt
        )
    }
}
