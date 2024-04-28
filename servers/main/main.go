package main

import (
	"os"
	"sigma/main/core/core"
	"sigma/main/core/dtos"
	"sigma/main/core/interfaces"
	"sigma/main/core/network"
	"sigma/main/core/types"
	"strconv"

	"github.com/joho/godotenv"
)

func hello(app interfaces.IApp, d interface{}, assistant interfaces.IAssistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

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
			func (app interfaces.IApp, d interface{}, assistant interfaces.IAssistant) (any, error) {
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

	app.GetNetwork().Listen(network.CreateListenOptions(true, int(port), false, 0))

	<-quit
}
