package main

import (
	"os"
	"sigma/map/core/core"
	"sigma/map/core/network"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := core.CreateApp(
		"sigma-sample",
		os.Getenv("POSTGRES_URI"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
	)

	app.GetNetwork().Listen(network.CreateListenOptions(true, 8086, false, 0))

	<-quit
}
