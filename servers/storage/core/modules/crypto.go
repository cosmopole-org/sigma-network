package modules

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"log"
	"os"
	"sigma/storage/core/utils"
)

var keys = map[string][][]byte{}

const keysFolderName = "keys"

func LoadKeys() {
	files, err := os.ReadDir(GetApp().StorageRoot + "/keys")
	if err != nil {
		log.Println(err)
	}
	for _, file := range files {
		if file.IsDir() {
			priKey, err1 := os.ReadFile(GetApp().StorageRoot + "/" + keysFolderName + "/" + file.Name() + "/private.pem")
			if err1 != nil {
				log.Println(err1)
				continue
			}
			pubKey, err2 := os.ReadFile(GetApp().StorageRoot + "/" + keysFolderName + "/" + file.Name() + "/public.pem")
			if err2 != nil {
				log.Println(err2)
				continue
			}
			keys[file.Name()] = [][]byte{priKey, pubKey}
		}
	}
}

func GenerateSecureKeyPair(tag string) {
	var priKey, pubKey = utils.SecureKeyPairs(GetApp().StorageRoot + "/" + keysFolderName + "/" + tag)
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
		log.Println(err)
		return ""
	}
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, publicKey.(*rsa.PublicKey), []byte(plainText))
	if err != nil {
		log.Println(err)
		return ""
	}
	return fmt.Sprintf("%x", ciphertext)
}

func Decrypt(tag string, cipherText string) string {
	privateKeyPEM := keys[tag][0]
	privateKeyBlock, _ := pem.Decode(privateKeyPEM)
	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyBlock.Bytes)
	if err != nil {
		log.Println(err)
		return ""
	}
	plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, []byte(cipherText))
	if err != nil {
		log.Println(err)
		return ""
	}
	return string(plaintext)
}
