package modules

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"sigma/main/core/utils"
)

var keys = map[string][][]byte{}

const keysFolderName = "keys"

func LoadKeys() {
	files, err := os.ReadDir(Instance().StorageRoot + "/keys")
	if err != nil {
		fmt.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {
			priKey, err1 := os.ReadFile(Instance().StorageRoot + "/" + keysFolderName + "/" + file.Name() + "/private.pem")
			if err1 != nil {
				fmt.Println(err1)
				continue
			}
			pubKey, err2 := os.ReadFile(Instance().StorageRoot + "/" + keysFolderName + "/" + file.Name() + "/public.pem")
			if err2 != nil {
				fmt.Println(err2)
				continue
			}
			keys[file.Name()] = [][]byte{priKey, pubKey}
		}
	}
}

func GenerateSecureKeyPair(tag string) {
	var priKey, pubKey = utils.SecureKeyPairs(Instance().StorageRoot + "/" + keysFolderName + "/" + tag)
	keys[tag] = [][]byte{priKey, pubKey}
}

func FetchKeyPair(tag string) [][]byte {
	return keys[tag]
}

func Encrypt(tag string, plainText string) string {
	publicKeyPEM := keys[tag][1]
	publicKeyBlock, _ := pem.Decode(publicKeyPEM)
	publicKey, err := x509.ParsePKIXPublicKey(publicKeyBlock.Bytes)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, publicKey.(*rsa.PublicKey), []byte(plainText))
	if err != nil {
		fmt.Println(err)
		return ""
	}
	return fmt.Sprintf("%x", ciphertext)
}

func Decrypt(tag string, cipherText string) string {
	privateKeyPEM := keys[tag][0]
	privateKeyBlock, _ := pem.Decode(privateKeyPEM)
	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyBlock.Bytes)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, []byte(cipherText))
	if err != nil {
		fmt.Println(err)
		return ""
	}
	return string(plaintext)
}