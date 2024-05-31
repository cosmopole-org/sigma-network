package main

import (
	"os"
	admin_builder "sigma/admin/admin"
	"sigma/admin/admin/models"
	sigma "sigma/admin/shell"
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

	port, err := strconv.ParseInt(os.Getenv("MAIN_PORT"), 10, 64)
	if err != nil {
		panic(err.Error())
	}

	var logrusLogger = &logrus.Logger{
		Out:          os.Stderr,
		Formatter:    new(logrus.JSONFormatter),
		Hooks:        make(logrus.LevelHooks),
		Level:        logrus.InfoLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}

	adminApp := admin_builder.BuildAdmin(
		os.Getenv("FED_ORIGIN"),
		sigma.Config{
			DbConn:      postgres.Open(os.Getenv("DB_URI")),
			MemUri:      os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Federation:  false,
			CoreAccess:  false,
			LogCb: func(u uint32, i ...interface{}) {
				logrusLogger.Logln(logrus.DebugLevel)
			},
		},
		[]*models.God{
			{Username: "mani", Name: "mani shabanzadeh"},
			{Username: "aras", Name: "aras mehranfar"},
			{Username: "shahin", Name: "shahin charkhosht"},
			{Username: "amir", Name: "amir ebadi"},
		},
	)

	adminApp.Sigma.ConnectToNetwork(map[string]int{
		"http": int(port),
	})

	<-quit
}
