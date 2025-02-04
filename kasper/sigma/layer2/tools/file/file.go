package tool_file

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	modulelogger "sigma/sigma/core/module/logger"
)

type File struct {
	logger *modulelogger.Logger
}

func (g *File) SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, topicId string, key string) error {
	var dirPath = fmt.Sprintf("%s/%s", storageRoot, topicId)
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return err
	}
	f, err := fh.Open()
	if err != nil {
		return err
	}
	defer func(f multipart.File) {
		err := f.Close()
		if err != nil {
			g.logger.Println(err)
		}
	}(f)
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, f); err != nil {
		return err
	}
	dest, err := os.OpenFile(fmt.Sprintf("%s/%s", dirPath, key), os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		return err
	}
	defer func(dest *os.File) {
		err := dest.Close()
		if err != nil {
			g.logger.Println(err)
		}
	}(dest)
	if _, err = dest.Write(buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func (g *File) CheckFileFromGlobalStorage(storageRoot string, key string) bool {
	var dirPath = storageRoot
	if _, err := os.Stat(fmt.Sprintf("%s/%s", dirPath, key)); errors.Is(err, os.ErrNotExist) {
		return false
	} else {
		return true
	}
}

func (g *File) ReadFileFromGlobalStorage(storageRoot string, key string) (string, error) {
	var dirPath = storageRoot
	content, err := os.ReadFile(fmt.Sprintf("%s/%s", dirPath, key))
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func (g *File) SaveFileToGlobalStorage(storageRoot string, fh *multipart.FileHeader, key string, overwrite bool) error {
	var dirPath = storageRoot
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return err
	}
	f, err := fh.Open()
	if err != nil {
		return err
	}
	defer func(f multipart.File) {
		err := f.Close()
		if err != nil {
			g.logger.Println(err)
		}
	}(f)
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, f); err != nil {
		return err
	}
	if g.CheckFileFromGlobalStorage(storageRoot, key) {
		err := os.Remove(fmt.Sprintf("%s/%s", dirPath, key))
		if err != nil {
			g.logger.Println(err)
		}
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
	defer func(dest *os.File) {
		err := dest.Close()
		if err != nil {
			g.logger.Println(err)
		}
	}(dest)
	if _, err = dest.Write(buf.Bytes()); err != nil {
		return err
	}
	return nil
}

func (g *File) SaveDataToGlobalStorage(storageRoot string, data []byte, key string, overwrite bool) error {
	var dirPath = storageRoot
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
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
	defer func(dest *os.File) {
		err := dest.Close()
		if err != nil {
			g.logger.Println(err)
		}
	}(dest)
	if _, err = dest.Write(data); err != nil {
		return err
	}
	return nil
}

func NewFileTool(logger *modulelogger.Logger) *File {
	ft := &File{}
	ft.logger = logger
	return ft
}
