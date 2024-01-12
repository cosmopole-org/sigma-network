package types

type Check struct {
	human bool
	tower bool
	room  bool
}

type IMethod interface{}

type Method struct {
	key      string
	callback *func(input *IPacket)
	check    Check
}

func (m Method) SetKey(key string) {
	m.key = key
}

func (m Method) SetCallback(callback *func(input *IPacket)) {
	m.callback = callback
}

func (m Method) GetCallback() *func(input *IPacket) {
	return m.callback
}

func CreateMethod(key string, callback func(input *IPacket), check Check) *Method {
	return &Method{key: key, callback: &callback, check: check}
}

func CreateCheck(human bool, tower bool, room bool) *Check {
	return &Check{human: human, tower: tower, room: room}
}
