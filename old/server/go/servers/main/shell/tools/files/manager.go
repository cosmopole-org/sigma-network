package file_manager

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"sigma/main/core/runtime"
	base_manager "sigma/main/shell/tools/base"
)

type FileManager struct {
	base_manager.BaseManager
}

func (g *FileManager) SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, topicId string, key string) error {
	var dirPath = fmt.Sprintf("%s/%s", storageRoot, topicId)
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

func (g *FileManager) SaveFileToGlobalStorage(storageRoot string, fh *multipart.FileHeader, key string, overwrite bool) error {
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

func (g *FileManager) SaveDataToGlobalStorage(storageRoot string, data []byte, key string, overwrite bool) error {
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

func New(sc *runtime.App) *FileManager {
	sm := &FileManager{}
	sm.App = sc
	return sm
}
