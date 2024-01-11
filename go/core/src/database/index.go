package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Database struct {
	Db *pgxpool.Pool
}
func (d Database) Connect(uri string) {
	dbPool, err := pgxpool.Connect(context.Background(), uri)
	if (err != nil) {
		log.Println(err)
		return
	}
	d.Db = dbPool
	defer dbPool.Close()
}

func CreateDatabase(uri string) *Database {
	fmt.Println("connecting to database...")
	database := new(Database)
	database.Connect(uri)
	return database
}
