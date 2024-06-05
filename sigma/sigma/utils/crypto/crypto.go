package crypto

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"os"

	"github.com/google/uuid"
)

func SecureUniqueString() string {
	return uuid.New().String() + "-" + uuid.New().String()
}

func SecureUniqueId(fed string) string {
	return uuid.New().String() + "@" + fed
}

func SecureKeyPairs(savePath string) ([]byte, []byte) {

	os.MkdirAll(savePath, os.ModePerm)

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	publicKey := &privateKey.PublicKey

	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})
	err = os.WriteFile(savePath+"/private.pem", privateKeyPEM, 0644)
	if err != nil {
		panic(err)
	}

	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		panic(err)
	}
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PUBLIC KEY",
		Bytes: publicKeyBytes,
	})
	err = os.WriteFile(savePath+"/public.pem", publicKeyPEM, 0644)
	if err != nil {
		panic(err)
	}
	return privateKeyPEM, publicKeyPEM
}
