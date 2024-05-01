package main

import (
	"os"
	app "sigma/main/core/core"
	"sigma/main/core/dtos"
	"sigma/main/core/modules"
	"strconv"

	"github.com/joho/godotenv"
)

func hello(app *modules.App, d interface{}, assistant modules.Assistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

var quit = make(chan struct{})

func main() {

	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	app := app.New(
		"cosmopole",
		os.Getenv("POSTGRES_URI"),
		os.Getenv("POSTGRES_DB") + "_" + os.Getenv("PORT"),
		os.Getenv("REDIS_URI"),
		os.Getenv("STORAGE_ROOT_PATH"),
		os.Getenv("MAP_SERVER"),
	)

	var apiService = modules.CreateService(app, "api")
	apiService.AddMethod(
		modules.CreateMethod(
			"hello",
			hello,
			modules.CreateCheck(false, false, false),
			dtos.HelloDto{},
			modules.CreateMethodOptions(true, false),
		),
	)
	apiService.AddMethod(
		modules.CreateMethod(
			"ping",
			func(app *modules.App, d interface{}, assistant modules.Assistant) (any, error) {
				return os.Getenv("PORT"), nil
			},
			modules.CreateCheck(false, false, false),
			dtos.PingDto{},
			modules.CreateMethodOptions(true, false),
		),
	)
	app.AddService(apiService)

	var portStr = os.Getenv("PORT")
	port, err := strconv.ParseInt(portStr, 10, 32)
	if err != nil {
		panic(err)
	}

	app.Network.Listen(modules.CreateListenOptions(true, int(port), false, 0))

	<-quit
}
