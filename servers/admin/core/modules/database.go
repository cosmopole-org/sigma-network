package modules

import (
	"context"
	"os"
	"sigma/admin/core/utils"

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
	utils.Log(logrus.DebugLevel, "connecting to database...")
	dbInstance := &Database{}
	config2, err3 := pgxpool.ParseConfig(uri)
	if err3 != nil {
		utils.Log(logrus.DebugLevel, "Unable to parse config: %v\n", err3)
	}
	config2.ConnConfig.Logger = logrusadapter.NewLogger(utils.LogrusLogger)
	conn2, err4 := pgxpool.ConnectConfig(context.Background(), config2)
	if err4 != nil {
		utils.Log(logrus.DebugLevel, "Unable to connect to database: %v\n", err4)
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
		utils.Log(logrus.DebugLevel, err4)
	} else {
		utils.Log(logrus.DebugLevel, result4)
	}
}
