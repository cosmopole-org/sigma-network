package modules

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"os"
)

type Assistant struct {
	UserId     int64
	UserType   string
	WorkerId   int64
	TowerId    int64
	RoomId     int64
	UserOrigin string
	Packet     IPacket
}

func (g *Assistant) SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, key string) error {
	var dirPath = fmt.Sprintf("%s/%d", storageRoot, g.RoomId)
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

func (g *Assistant) SaveFileToGlobalStorage(storageRoot string, fh *multipart.FileHeader, key string, overwrite bool) error {
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

func (g *Assistant) SaveDataToGlobalStorage(storageRoot string, data []byte, key string, overwrite bool) error {
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

func CreateAssistant(userId int64, userType string, towerId int64, roomId int64, workerId int64, packet IPacket) Assistant {
	return Assistant{UserId: userId, UserType: userType, TowerId: towerId, RoomId: roomId, WorkerId: workerId, Packet: packet}
}
