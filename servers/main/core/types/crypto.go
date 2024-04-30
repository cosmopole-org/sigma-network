package types

import (
	"fmt"
	"os"
	"sigma/main/core/utils"
)

var keys = map[string][2][]byte{}

func LoadKeys() {
	files, err := os.ReadDir(Instance().StorageRoot)
    if err != nil {
        fmt.Println(err)
    }
    for _, file := range files {
        if file.IsDir() {
			priKey, err1 := os.ReadFile(Instance().StorageRoot + "/" + file.Name() + "/private.pem")
			if err1 != nil {
				fmt.Println(err1)
				continue
			}
			pubKey, err2 := os.ReadFile(Instance().StorageRoot + "/" + file.Name() + "/public.pem")
			if err2 != nil {
				fmt.Println(err2)
				continue
			}
			keys[file.Name()] = [2][]byte{priKey, pubKey}
		}
    }
}

func GenerateSecureKeyPair(tag string) {
	var priKey, pubKey = utils.SecureKeyPairs(Instance().StorageRoot + tag)
	keys[tag] = [2][]byte{priKey, pubKey}
}

func FetchKeyPair(tag string) [2][]byte {
	return keys[tag]
}
