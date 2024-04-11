package main

import (
	"os"
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/network"
	"sigma/core/src/types"

	"github.com/joho/godotenv"
)

func hello(app interfaces.IApp, d interface{}, assistant interfaces.IAssistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

type Cat struct {
	Age int
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
	app.AddService(apiService)

	app.GetNetwork().Listen(network.CreateListenOptions(true, 8080, true, 8000))

	<-quit
}
