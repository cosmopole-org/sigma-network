package types

import "sigma/core/src/interfaces"

type Check struct {
	human bool
	tower bool
	room  bool
}

type Method struct {
	key        string
	callback   func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto)
	check      Check
	inTemplate interfaces.IDto
}

func (m Method) GetKey() string {
	return m.key
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto)) {
	m.callback = callback
}

func (m Method) GetCallback() func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto) {
	return m.callback
}

func (m Method) GetInTemplate() interfaces.IDto {
	return m.inTemplate
}

func CreateMethod(key string, callback func(app *interfaces.IApp, packet interfaces.IPacket, dto interfaces.IDto), check Check, dto interfaces.IDto) Method {
	return Method{key: key, callback: callback, check: check, inTemplate: dto}
}

func CreateCheck(human bool, tower bool, room bool) *Check {
	return &Check{human: human, tower: tower, room: room}
}
