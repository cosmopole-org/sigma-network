package module_logger

import "log"

type Logger struct {
}

func (l *Logger) Println(args ...interface{}) {
	log.Println(args)
}
