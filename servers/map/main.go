package main

import (
	"os"
	app "sigma/map/core/core"
	"sigma/map/core/modules"

	"github.com/joho/godotenv"
)

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := app.New(
		"sigma-sample",
		os.Getenv("POSTGRES_URI"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
	)

	app.Network.Listen(modules.CreateListenOptions(true, 8086, false, 0))

	<-quit
}
