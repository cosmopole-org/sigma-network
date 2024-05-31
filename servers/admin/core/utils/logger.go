package utils

import "log"

var logCb func(uint32, ...interface{})

func RegisterLoggerCallback(lcb func(uint32, ...interface{})) {
	logCb = lcb
}

func Log(level uint32, content ...interface{}) {
	if logCb == nil {
		log.Println(level, content)
	} else {
		logCb(level, content...)
	}
}
