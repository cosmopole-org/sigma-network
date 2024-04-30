package main

import (
	"os"
	app "sigma/main/core/core"
	"sigma/main/core/dtos"
	"sigma/main/core/types"
	"strconv"

	"github.com/joho/godotenv"
)

func hello(app *types.App, d interface{}, assistant types.Assistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

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
		os.Getenv("MAP_SERVER"),
	)

	var apiService = types.CreateService(app, "api")
	apiService.AddMethod(
		types.CreateMethod(
			"hello",
			hello,
			types.CreateCheck(false, false, false),
			dtos.HelloDto{},
			types.CreateMethodOptions(true, false),
		),
	)
	apiService.AddMethod(
		types.CreateMethod(
			"ping",
			func (app *types.App, d interface{}, assistant types.Assistant) (any, error) {
				return os.Getenv("PORT"), nil
			},
			types.CreateCheck(false, false, false),
			dtos.PingDto{},
			types.CreateMethodOptions(true, false),
		),
	)
	app.AddService(apiService)

	var portStr = os.Getenv("PORT")
	port, err := strconv.ParseInt(portStr, 10, 32)
	if err != nil {
		panic(err)
	}

	app.Network.Listen(types.CreateListenOptions(true, int(port), false, 0))

	<-quit
}
