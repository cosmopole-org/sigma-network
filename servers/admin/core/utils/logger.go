package utils

import (
	"os"

	"github.com/sirupsen/logrus"
)

var LogrusLogger = &logrus.Logger{
	Out:          os.Stderr,
	Formatter:    new(logrus.JSONFormatter),
	Hooks:        make(logrus.LevelHooks),
	Level:        logrus.InfoLevel,
	ExitFunc:     os.Exit,
	ReportCaller: false,
}

func Log(level logrus.Level, content ...interface{}) {
	LogrusLogger.Logln(level, content...)
}
