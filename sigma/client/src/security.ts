
type PublicKeyBatch = { [id: string]: CryptoKey };

type RefreshEvents = { [id: string]: string };

type GroupKey = { keyId: string, key: CryptoKey }

type Group = {
    groupId: string
    key: GroupKey,
    publicKeys: PublicKeyBatch,
    history: RefreshEvents
};

export default class Security {
    private groups: {[id: string]: Group} = {}
    private myKeyPair?: CryptoKeyPair
    private keyStore: {[id: string]: CryptoKey} = {}
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
        }
        return this.myKeyPair;
    }
    public async encryptGroupPacket(identifier: string, groupId: string, data: string): Promise<string> {
        this.groups[groupId].history[identifier] = this.groups[groupId].key.keyId;
        return await this.encryptDataByKey(this.groups[groupId].key.key, data)
    }
    public async decryptGroupPacket(identifier: string, groupId: string, cipher: string): Promise<string> {
        this.groups[groupId].history[identifier] = this.groups[groupId].key.keyId;
        return await this.decryptDataByKey(this.groups[groupId].key.key, cipher);
    }
    public async decryptGroupKey(keyCipher: string): Promise<string> {
        return await this.decryptKey(keyCipher);
    }
    public async refreshGroupKey(groupId: string): Promise<{ [id: string]: string }> {
        let group = this.groups[groupId];
        let { id, key } = await this.generateNewKey();
        group.key = {keyId: id, key: key};
        return this.encryptKeyBatch(group.publicKeys, group.key.key);
    }
    public async newGroup(groupId: string): Promise<void> {
        let {id, key} = await this.generateNewKey();
        await this.putGroup({
            groupId: groupId,
            key: {key: key, keyId: id},
            publicKeys: {},
            history: {}
        });
    }
    public deleteGroup(groupId: string) {
        delete this.groups[groupId];
    }
    public async putGroup(group: {groupId: string, key: GroupKey, publicKeys: {[id: string]: string}, history: RefreshEvents}): Promise<void> {
        let g: Group = {
            groupId: group.groupId,
            key: group.key,
            publicKeys: {},
            history: group.history
        };
        let ids = Object.keys(group.publicKeys);
        for (let i = 0; i < ids.length; i++) {
            g.publicKeys[ids[i]] = await this.parsePublicKey(group.publicKeys[ids[i]]);
        }
        if (!this.groups[group.groupId]) {
            this.groups[group.groupId] = g
        }
    }

    // internal api
    private async generateNewKey() : Promise<{id: string, key: CryptoKey}> {
        let id = window.crypto.randomUUID().toString();
        this.keyStore[id] = await window.crypto.subtle.generateKey(
           { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"],
        );
        return {id: id, key: this.keyStore[id]};
    }
    private async parsePublicKey(publicKey: string) : Promise<CryptoKey> {
        return await window.crypto.subtle.importKey("spki", new Uint8Array(this.b642ab(publicKey)), { name: "RSA-OAEP", hash: "SHA-256" }, false, [ "encrypt" ]);
    }
    private async encryptKey(publicKey: CryptoKey, key: string): Promise<string> {
        let encodedKey = new TextEncoder().encode(key);
        return this.ab2b64(await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            encodedKey
        ));
    }
    private async decryptKey(cipherKey: string): Promise<string> {
        const dec = new TextDecoder();
        return dec.decode(await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            this.myKeyPair.privateKey,
            this.b642ab(cipherKey)
        ));
    }
    private async encryptKeyBatch(keys: PublicKeyBatch, key: CryptoKey): Promise<{[id: string]: string}> {
        let exportedKey = await crypto.subtle.exportKey('raw', key);
        let keyMap: {[id: string]: string} = {};
        let ids = Object.keys(keys);
        for (let i = 0; i < ids.length; i++) {
            keyMap[ids[i]] = this.ab2b64(await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP",
                },
                keys[ids[i]], // from generateKey or importKey above
                exportedKey // ArrayBuffer of data you want to encrypt
            ))
        }
        return keyMap;
    }
    private async encryptDataByKey(key: CryptoKey, data: string): Promise<string> {
        let enc = new TextEncoder();
        let iv = crypto.getRandomValues(new Uint8Array(12));
        let ivStr = Array.from(iv).map(b => String.fromCharCode(b)).join('');
        let encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(data)
        );
        const ctArray = Array.from(new Uint8Array(encrypted));
        const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
        return btoa(ivStr+ctStr);
    }
    private async decryptDataByKey(key: CryptoKey, cipher: string): Promise<string> {
        const ivStr = atob(cipher).slice(0,12);
        const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0)));
        const ctStr = atob(cipher).slice(12);
        const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0)));
        const plainBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ctUint8);
        return new TextDecoder().decode(plainBuffer);
    }
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
}
