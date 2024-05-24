package modules

import (
	"context"
	"os"
	"sigma/storage/core/utils"

	"github.com/jackc/pgx/v4/log/logrusadapter"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/sirupsen/logrus"
)

type Database struct {
	Db *pgxpool.Pool
}

func (d Database) GetDb() *pgxpool.Pool {
	return d.Db
}

func CreateDatabase(uri string) *Database {
	utils.Log(5, "connecting to database...")
	dbInstance := &Database{}
	config2, err3 := pgxpool.ParseConfig(uri)
	if err3 != nil {
		utils.Log(5, "Unable to parse config: %v\n", err3)
	}
	var logrusLogger = &logrus.Logger{
		Out:          os.Stderr,
		Formatter:    new(logrus.JSONFormatter),
		Hooks:        make(logrus.LevelHooks),
		Level:        logrus.InfoLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}
	config2.ConnConfig.Logger = logrusadapter.NewLogger(logrusLogger)
	conn2, err4 := pgxpool.ConnectConfig(context.Background(), config2)
	if err4 != nil {
		utils.Log(5, "Unable to connect to database: %v\n", err4)
	}
	dbInstance.Db = conn2
	return dbInstance
}

func (db *Database) ExecuteSqlFile(path string) {
	c, ioErr := os.ReadFile(path)
	if ioErr != nil {
		panic(ioErr.Error())
	}
	sqlText := string(c)
	result4, err4 := db.GetDb().Exec(context.Background(), string(sqlText))
	if err4 != nil {
		utils.Log(5, err4)
	} else {
		utils.Log(5, result4)
	}
}
