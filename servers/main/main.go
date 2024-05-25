package main

import (
	"os"
	"sigma/main/shell"
	"sigma/main/sigma"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 64)
	if err != nil {
		panic(err)
	}

	var logrusLogger = &logrus.Logger{
		Out:          os.Stderr,
		Formatter:    new(logrus.JSONFormatter),
		Hooks:        make(logrus.LevelHooks),
		Level:        logrus.InfoLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}

	sigmaApp := sigma.New(
		os.Getenv("FED_ORIGIN"),
		shell.Config{
			DbUri:       os.Getenv("POSTGRES_URI"),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  os.Getenv("FEDERATIVE") == "true",
			CoreAccess:  os.Getenv("CORE_ACCESSIBLE") == "true",
			LogCb: func(u uint32, i ...interface{}) {
				logrusLogger.Logln(logrus.DebugLevel)
			},
		},
	)

	sigmaApp.ConnectToNetwork(map[string]int{"http": int(port)})

	<-quit
}
