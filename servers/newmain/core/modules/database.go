package modules

import (
	"context"
	"fmt"
	"os"

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

func CreateDatabase(uri string, dbName string) *Database {
	fmt.Println("connecting to database...")
	dbInstance := &Database{}
	config, err := pgxpool.ParseConfig(uri)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to parse config: %v\n", err)
	}
	logrusLogger := &logrus.Logger{
		Out:          os.Stderr,
		Formatter:    new(logrus.JSONFormatter),
		Hooks:        make(logrus.LevelHooks),
		Level:        logrus.InfoLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}
	config.ConnConfig.Logger = logrusadapter.NewLogger(logrusLogger)
	conn, err := pgxpool.ConnectConfig(context.Background(), config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
	}
	var cdbQuery = fmt.Sprintf(`
	    CREATE DATABASE %s;
	`, dbName)
	_, err2 := conn.Exec(context.Background(), cdbQuery)
	if err2 != nil {
		fmt.Println(err2)
	}
	conn.Close()
	config2, err3 := pgxpool.ParseConfig(uri + "/" + dbName)
	if err3 != nil {
		fmt.Fprintf(os.Stderr, "Unable to parse config: %v\n", err3)
	}
	config.ConnConfig.Logger = logrusadapter.NewLogger(logrusLogger)
	conn2, err4 := pgxpool.ConnectConfig(context.Background(), config2)
	if err4 != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err4)
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
		fmt.Println(err4)
	} else {
		fmt.Println(result4)
	}
}
