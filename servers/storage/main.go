package main

import (
	"os"
	"sigma/storage/shell"
	storage_builder "sigma/storage/storage"

	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 32)
	if err != nil {
		panic("invalid port number")
	}

	var logrusLogger = &logrus.Logger{
		Out:          os.Stderr,
		Formatter:    new(logrus.JSONFormatter),
		Hooks:        make(logrus.LevelHooks),
		Level:        logrus.InfoLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}

	storageApp := storage_builder.BuildStorage(
		os.Getenv("FED_ORIGIN"),
		shell.Config{
			DbConn:      postgres.Open(os.Getenv("DB_URI")),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  os.Getenv("FEDERATIVE") == "true",
			CoreAccess:  false,
			MaxReqSize:  1000 * 1024 * 1024,
			LogCb: func(u uint32, i ...interface{}) {
				logrusLogger.Logln(logrus.DebugLevel)
			},
		},
	)

	storageApp.Sigma.ConnectToNetwork(map[string]int{"http": int(port)})

	<-quit
}
