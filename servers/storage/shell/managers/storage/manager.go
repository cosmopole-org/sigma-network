package storage_manager

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"sigma/storage/core/runtime"
	base_manager "sigma/storage/shell/managers/base"
)

type StorageManager struct {
	base_manager.BaseManager
}

func (g *StorageManager) SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, topicId int64, key string) error {
	var dirPath = fmt.Sprintf("%s/%d", storageRoot, topicId)
	os.MkdirAll(dirPath, os.ModePerm)
	f, err := fh.Open()
	if err != nil {
		return err
	}
	defer f.Close()
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, f); err != nil {
		return err
	}
	dest, err := os.OpenFile(fmt.Sprintf("%s/%s", dirPath, key), os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		return err
	}
	defer dest.Close()
	if _, err = dest.Write(buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func (g *StorageManager) SaveFileToGlobalStorage(storageRoot string, fh *multipart.FileHeader, key string, overwrite bool) error {
	var dirPath = storageRoot
	os.MkdirAll(dirPath, os.ModePerm)
	f, err := fh.Open()
	if err != nil {
		return err
	}
	defer f.Close()
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, f); err != nil {
		return err
	}
	var flags = 0
	if overwrite {
		flags = os.O_WRONLY | os.O_CREATE
	} else {
		flags = os.O_APPEND | os.O_WRONLY | os.O_CREATE
	}
	dest, err := os.OpenFile(fmt.Sprintf("%s/%s", dirPath, key), flags, 0600)
	if err != nil {
		return err
	}
	defer dest.Close()
	if _, err = dest.Write(buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func (g *StorageManager) SaveDataToGlobalStorage(storageRoot string, data []byte, key string, overwrite bool) error {
	var dirPath = storageRoot
	os.MkdirAll(dirPath, os.ModePerm)
	var flags = 0
	if overwrite {
		flags = os.O_WRONLY | os.O_CREATE
	} else {
		flags = os.O_APPEND | os.O_WRONLY | os.O_CREATE
	}
	dest, err := os.OpenFile(fmt.Sprintf("%s/%s", dirPath, key), flags, 0600)
	if err != nil {
		return err
	}
	defer dest.Close()
	if _, err = dest.Write(data); err != nil {
		return err
	}
	return nil
}

func New(sc *runtime.App) *StorageManager {
	sm := &StorageManager{}
	sm.App = sc
	return sm
}
