package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4/pgxpool"
)

var instance Database
func Instance() *Database {
	return &instance
}

var db pgxpool.Pool
type Database struct{
	
}

func (d Database) Connect(uri string) {
	dbPool, err := pgxpool.Connect(context.Background(), uri)
	if err != nil {
		log.Println(err)
		return
	}
	db = *dbPool
}

func (d Database) GetDb() *pgxpool.Pool {
	return &db
}

func CreateDatabase(uri string) *Database {
	fmt.Println("connecting to database...")
	instance = Database{}
	instance.Connect(uri)
	return &instance
}
