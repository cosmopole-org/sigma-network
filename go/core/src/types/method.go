package types

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"sigma/core/src/interfaces"
)

type Check struct {
	user  bool
	tower bool
	room  bool
}

func (c Check) NeedUser() bool {
	return c.user
}

func (c Check) NeedTower() bool {
	return c.tower
}

func (c Check) NeedRoom() bool {
	return c.room
}

type Assistant struct {
	userId   int64
	userType string
	workerId int64
	towerId  int64
	roomId   int64
	packet   interfaces.IPacket
}

func (g *Assistant) SaveFileToStorage(storageRoot string, fh *multipart.FileHeader, key string) error {
	var dirPath = fmt.Sprintf("%s/%d", storageRoot, g.roomId)
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

func (g *Assistant) GetWebPacket() interfaces.IPacket {
	return g.packet
}

func (g *Assistant) GetUserId() int64 {
	return g.userId
}

func (g *Assistant) GetUserType() string {
	return g.userType
}

func (g *Assistant) GetTowerId() int64 {
	return g.towerId
}

func (g *Assistant) GetRoomId() int64 {
	return g.roomId
}

func (g *Assistant) GetWorkerId() int64 {
	return g.workerId
}

type Method struct {
	key        string
	callback   func(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error)
	check      Check
	inTemplate interfaces.IDto
	asEndpoint bool
	asRaw      bool
}

func (m Method) GetKey() string {
	return m.key
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback func(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error)) {
	m.callback = callback
}

func (m Method) GetCallback() func(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error) {
	return m.callback
}

func (m Method) GetInTemplate() interfaces.IDto {
	return m.inTemplate
}

func (m Method) GetCheck() interfaces.ICheck {
	return m.check
}

func (m Method) AsEndpoint() bool {
	return m.asEndpoint
}

func (m Method) AsRaw() bool {
	return m.asRaw
}

func CreateMethod(key string, callback func(app *interfaces.IApp, dto interfaces.IDto, assistant interfaces.IAssistant) (any, error), check Check, dto interfaces.IDto, asEndpoint bool, asRaw bool) Method {
	return Method{key: key, callback: callback, check: check, inTemplate: dto, asEndpoint: asEndpoint, asRaw: asRaw}
}

func CreateCheck(user bool, tower bool, room bool) Check {
	return Check{user: user, tower: tower, room: room}
}

func CreateAssistant(userId int64, userType string, towerId int64, roomId int64, workerId int64, packet interfaces.IPacket) *Assistant {
	return &Assistant{userId: userId, userType: userType, towerId: towerId, roomId: roomId, workerId: workerId, packet: packet}
}
