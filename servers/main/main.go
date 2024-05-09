package main

import (
	"os"
	app "sigma/main/shell"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	portStr := strings.Split(os.Getenv("ORIGIN"), "->")[1]
	port, err := strconv.ParseInt(portStr, 10, 64)
	if err != nil {
		panic(err)
	}

	app.New(
		os.Getenv("ORIGIN"),
		app.AppConfig{
			DatabaseUri: os.Getenv("POSTGRES_URI"),
			DatabaseName: os.Getenv("POSTGRES_DB") + "_" + portStr,
			MemoryUri: os.Getenv("REDIS_URI"),
			StorageRoot: os.Getenv("STORAGE_ROOT_PATH"),
			Ports: map[string]int{
				"http": int(port),
			},
			MapServerAddress: os.Getenv("MAP_SERVER"),
			EnableFederation: false,
		},
	)

	<-quit
}
