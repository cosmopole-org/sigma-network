package types

import "sigma/core/src/interfaces"

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

type Guard struct {
	userId   int64
	userType string
	towerId  int64
	roomId   int64
}

func (g Guard) GetUserId() int64 {
	return g.userId
}

func (g Guard) GetUserType() string {
	return g.userType
}

func (g Guard) GetTowerId() int64 {
	return g.towerId
}

func (g Guard) GetRoomId() int64 {
	return g.roomId
}

type Method struct {
	key        string
	callback   func(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error)
	check      Check
	inTemplate interfaces.IDto
	asEndpoint bool
}

func (m Method) GetKey() string {
	return m.key
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback func(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error)) {
	m.callback = callback
}

func (m Method) GetCallback() func(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error) {
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

func CreateMethod(key string, callback func(app *interfaces.IApp, dto interfaces.IDto, guard interfaces.IGuard) (any, error), check Check, dto interfaces.IDto, asEndpoint bool) Method {
	return Method{key: key, callback: callback, check: check, inTemplate: dto, asEndpoint: asEndpoint}
}

func CreateCheck(user bool, tower bool, room bool) Check {
	return Check{user: user, tower: tower, room: room}
}

func CreateGuard(userId int64, userType string, towerId int64, roomId int64) Guard {
	return Guard{userId: userId, userType: userType, towerId: towerId, roomId: roomId}
}
