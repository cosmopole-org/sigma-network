import { base64ToBytes, bytesToBase64 } from "./encoding"

const decrypt = async (cipher: string, distributionMessage: string): Promise<string> => {
    return new Promise(resolve => {
        if (typeof window != 'undefined') {
            (window as any).decrypt("0", "0",
                base64ToBytes(distributionMessage),
                base64ToBytes(cipher),
                (decrypted: string) => {
                    resolve(decrypted)
                })
        } else {
            resolve("")
        }
    })
}

const encrypt = async (roomId: number, authorId: number, content: string): Promise<{ cipher: string, distributionMessage: string }> => {
    return new Promise(resolve => {
        if (typeof window != 'undefined') {
            (window as any).encrypt(roomId.toString(), authorId.toString(), content, (encrypted: any, dm: any) => {
                resolve({ cipher: bytesToBase64(encrypted), distributionMessage: bytesToBase64(dm) })
            })
        }
    })
}

export default {
    encrypt,
    decrypt
}