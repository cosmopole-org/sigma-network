"use client"

import CryptoBrowser from 'crypto';
import CryptoJS from 'crypto-js';
import CryptoENC from 'crypto-js/enc-utf8';

let forge: any = undefined;
export const putForge = (f: any) => {
    forge = f;
}

export default class Crypto {
    static setupCrypto() {
        return new Crypto();
    }
    secrets: { [id: string]: string } = {};
    priKey: any = "";
    pubKey: any = "";
    async configure() {
        let myKeyPair = this.getMyKeyPair();
        if (myKeyPair) {
            this.priKey = forge.pki.privateKeyFromPem(atob(myKeyPair.privateKey));
            this.pubKey = forge.pki.publicKeyFromPem(atob(myKeyPair.publicKey));
        }
    }
    updateRoomSecret(roomId: number, roomSecret: string) {
        localStorage.setItem(`currentRoomSecret:${roomId}`, roomSecret);
    }
    getRoomSecret(roomId: number) {
        let secret = localStorage.getItem(`currentRoomSecret:${roomId}`);
        if (secret && (secret !== null)) {
            return secret;
        } else {
            return undefined;
        }
    }
    generateNewDerivedKey(roomId: number) {
        let roomSecret = this.getRoomSecret(roomId);
        if (!roomSecret) {
            roomSecret = forge.random.getBytesSync(128);
            if (roomSecret) {
                this.updateRoomSecret(roomId, roomSecret);
            }
        }
        let salt = forge.random.getBytesSync(128);
        let key = forge.pkcs5.pbkdf2(roomSecret, salt, 1000, 16);
        console.log(key);
        return [key, salt];
    }
    updateRoomKey(roomId: number, key: string, salt: string) {
        localStorage.setItem(`currentRoomKey:${roomId}`, JSON.stringify({ key, salt }));
    }
    getRoomKey(roomId: number) {
        let key = localStorage.getItem(`currentRoomKey:${roomId}`);
        return JSON.parse(key ?? "{}");
    }
    securifyRoom(roomId: number) {
        let [key, salt] = this.generateNewDerivedKey(roomId);
        this.updateRoomKey(roomId, key, salt);
        return key;
    }
    notifyNewRoomKey(roomId: number, key: string, salt: string) {
        this.updateRoomKey(roomId, this.decryptTextByKeyPair(key), salt);
    }
    async refreshRoomKey(roomId: number, users: { [id: number]: { id: number, publicKey: string } }) {
        return new Promise(resolve => {
            let key = this.securifyRoom(roomId);
            let keyPack: { [id: number]: any } = {};
            Object.values(users).forEach(user => {
                if (user.publicKey) {
                    keyPack[user.id] = this.encryptTextByOtherKeyPair(user.publicKey, key);
                }
            });
            resolve(keyPack)
        });
    }
    updateMyKeyPair(priKey: any, pubKey: any) {
        localStorage.setItem('myKeyPair', JSON.stringify({ privateKey: priKey, publicKey: pubKey }));
    }
    getMyKeyPair() {
        let myKeyPairRaw = localStorage.getItem('myKeyPair');
        if (myKeyPairRaw && (myKeyPairRaw !== null)) {
            return JSON.parse(myKeyPairRaw);
        } else {
            return undefined;
        }
    }
    generateKeyPair(onResult: (keys: string[]) => void) {
        let that = this;
        forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (err: any, keypair: any) {
            that.priKey = keypair.privateKey;
            that.pubKey = keypair.publicKey;
            let priKeyStr = btoa(forge.pki.privateKeyToPem(that.priKey));
            let pubKeyStr = btoa(forge.pki.publicKeyToPem(that.pubKey));
            that.updateMyKeyPair(priKeyStr, pubKeyStr);
            onResult([pubKeyStr, priKeyStr]);
        });
    }
    encryptTextByKeyPair(payload: string) {
        return this.pubKey.encrypt(Buffer.from(payload));
    }
    decryptTextByKeyPair(cipher: string) {
        return this.priKey.decrypt(cipher);
    }
    encryptTextByOtherKeyPair(userPk: string, payload: string) {
        return forge.pki.publicKeyFromPem(atob(userPk)).encrypt(payload);
    }
    async startDH(roomId: number, userId: number, exchangePubKeys: any, onResult: any) {
        let dh1 = CryptoBrowser.getDiffieHellman('modp1');
        dh1.generateKeys();
        let pub1;
        exchangePubKeys(dh1.getPublicKey(), (peerPubKey: any) => {
            pub1 = dh1.computeSecret(peerPubKey).toString('hex');
            this.secrets[`${roomId}_${userId}`] = pub1;
            onResult(pub1);
        });
    }
    async answerDH(roomId: number, userId: number, peerPubKey: any, myPubKeyReady: any, onResult: any) {
        let dh1 = CryptoBrowser.getDiffieHellman('modp1');
        dh1.generateKeys();
        let pub1 = dh1.computeSecret(peerPubKey).toString('hex');
        myPubKeyReady(dh1.getPublicKey());
        this.secrets[`${roomId}_${userId}`] = pub1;
        onResult(pub1);
    }
    openMesage(roomId: number, data: any) {
        let key = this.getRoomKey(roomId).key;
        return CryptoJS.AES.decrypt(data.payload.toString(), key).toString(CryptoENC);
    }
    packageMessage(roomId: number, payload: any) {
        let { key, salt } = this.getRoomKey(roomId);
        let encrypted = CryptoJS.AES.encrypt(payload, key).toString();
        return { salt: salt, payload: encrypted };
    }
    isRoomSecure(roomId: number) {
        let key = this.getRoomKey(roomId);
        return key && (key !== null);
    }
    constructor() {
        this.configure();
    }
}
