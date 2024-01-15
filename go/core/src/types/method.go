package types

import "sigma/core/src/interfaces"

type Check struct {
	user bool
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

type Guard struct {
	userId int64
	towerId int64
	roomId  int64
}

func (g Guard) GetUserId() int64 {
	return g.userId
}

func (g Guard) GetTowerId() int64 {
	return g.towerId
}

func (g Guard) GetRoomId() int64 {
	return g.roomId
}

type Method struct {
	key        string
	callback   func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard)
	check      Check
	inTemplate interfaces.IDto
}

func (m Method) GetKey() string {
	return m.key
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard)) {
	m.callback = callback
}

func (m Method) GetCallback() func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard) {
	return m.callback
}

func (m Method) GetInTemplate() interfaces.IDto {
	return m.inTemplate
}

func (m Method) GetCheck() interfaces.ICheck {
	return m.check
}

func CreateMethod(key string, callback func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto, guard interfaces.IGuard), check Check, dto interfaces.IDto) Method {
	return Method{key: key, callback: callback, check: check, inTemplate: dto}
}

func CreateCheck(user bool, tower bool, room bool) Check {
	return Check{user: user, tower: tower, room: room}
}

func CreateGuard(userId int64, towerId int64, roomId int64) Guard {
	return Guard{userId: userId, towerId: towerId, roomId: roomId}
}
