package crypto

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"sigma/storage/core/utils"
)

type Crypto struct {
	storageRoot string
	keys map[string][][]byte
}

const keysFolderName = "keys"

func (c *Crypto) LoadKeys() {
	files, err := os.ReadDir(c.storageRoot + "/keys")
	if err != nil {
		utils.Log(5, err)
	}
	for _, file := range files {
		if file.IsDir() {
			priKey, err1 := os.ReadFile(c.storageRoot + "/" + keysFolderName + "/" + file.Name() + "/private.pem")
			if err1 != nil {
				utils.Log(5, err1)
				continue
			}
			pubKey, err2 := os.ReadFile(c.storageRoot + "/" + keysFolderName + "/" + file.Name() + "/public.pem")
			if err2 != nil {
				utils.Log(5, err2)
				continue
			}
			c.keys[file.Name()] = [][]byte{priKey, pubKey}
		}
	}
}

func (c *Crypto) GenerateSecureKeyPair(tag string) {
	var priKey, pubKey = utils.SecureKeyPairs(c.storageRoot + "/" + keysFolderName + "/" + tag)
	c.keys[tag] = [][]byte{priKey, pubKey}
}

func (c *Crypto) FetchKeyPair(tag string) [][]byte {
	return c.keys[tag]
}

func (c *Crypto) Encrypt(tag string, plainText string) string {
	publicKeyPEM := c.keys[tag][1]
	publicKeyBlock, _ := pem.Decode(publicKeyPEM)
	publicKey, err := x509.ParsePKIXPublicKey(publicKeyBlock.Bytes)
	if err != nil {
		utils.Log(5, err)
		return ""
	}
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, publicKey.(*rsa.PublicKey), []byte(plainText))
	if err != nil {
		utils.Log(5, err)
		return ""
	}
	return fmt.Sprintf("%x", ciphertext)
}

func (c *Crypto) Decrypt(tag string, cipherText string) string {
	privateKeyPEM := c.keys[tag][0]
	privateKeyBlock, _ := pem.Decode(privateKeyPEM)
	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyBlock.Bytes)
	if err != nil {
		utils.Log(5, err)
		return ""
	}
	plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, []byte(cipherText))
	if err != nil {
		utils.Log(5, err)
		return ""
	}
	return string(plaintext)
}

func CreateCrypto(sr string) *Crypto {
	c := &Crypto{storageRoot: sr, keys: make(map[string][][]byte)}
	c.LoadKeys()
	return c
}
