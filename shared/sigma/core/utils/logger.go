package utils

var logCb func(uint32, ...interface{})

func RegisterLoggerCallback(lcb func(uint32, ...interface{})) {
	logCb = lcb
}

func Log(level uint32, content ...interface{}) {
	logCb(level, content...)
}
