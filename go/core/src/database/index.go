package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Database struct {
	db pgxpool.Pool
}

func (d Database) GetDb() *pgxpool.Pool {
	return &d.db
}

func CreateDatabase(uri string) Database {
	fmt.Println("connecting to database...")
	var dbInstance = Database{}
	dbPool, err := pgxpool.Connect(context.Background(), uri)
	if err != nil {
		log.Println(err)
	} else {
		dbInstance.db = *dbPool
	}
	return dbInstance
}
