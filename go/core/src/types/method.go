package types

import "sigma/core/src/interfaces"

type Check struct {
	human bool
	tower bool
	room  bool
}

type Method struct {
	key      string
	callback func(app *interfaces.IApp, input interfaces.IPacket)
	check    Check
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

func CreateMethod(key string, callback func(app *interfaces.IApp, input interfaces.IPacket), check Check) Method {
	return Method{key: key, callback: callback, check: check}
}

func CreateCheck(human bool, tower bool, room bool) *Check {
	return &Check{human: human, tower: tower, room: room}
}
