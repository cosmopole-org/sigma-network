package types

import "sigma/core/src/interfaces"

type Check struct {
	human bool
	tower bool
	room  bool
}

type Method struct {
	key        string
	callback   func(app *interfaces.IApp, input interfaces.IPacket)
	check      Check
	inTemplate interface{}
}

func (m Method) GetKey() string {
	return m.key
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback func(app *interfaces.IApp, input interfaces.IPacket)) {
	m.callback = callback
}

func (m Method) GetCallback() func(app *interfaces.IApp, input interfaces.IPacket) {
	return m.callback
}

func (m Method) GetInTemplate() interface{} {
	return m.inTemplate
}

func CreateMethod(key string, callback func(app *interfaces.IApp, input interfaces.IPacket), check Check, dto interface{}) Method {
	return Method{key: key, callback: callback, check: check, inTemplate: dto}
}

func CreateCheck(human bool, tower bool, room bool) *Check {
	return &Check{human: human, tower: tower, room: room}
}
