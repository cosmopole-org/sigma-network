package utils

import (
    "crypto/rand"
    "encoding/base64"
)

func SecureUniqueString(n int) (string, error) {
    b := make([]byte, n)
    _, err := rand.Read(b)
    if err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b)[:n], nil
}