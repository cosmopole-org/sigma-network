package main

import (
	"os"
	cosmopole_services "sigma/core/cosmopole/services"
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"

	"github.com/joho/godotenv"
)

func hello(app *interfaces.IApp, d interfaces.IDto, assistant interfaces.IAssistant) (any, error) {
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

	var apiService = types.CreateService("api").
		AddMethod(
			types.CreateMethod(
				"hello",
				hello,
				types.CreateCheck(false, false, false),
				&dtos.HelloDto{},
				true,
				false,
			),
		)
	app.AddService(apiService)

	var iapp interfaces.IApp = *app
	app.AddService(cosmopole_services.CreateMessengerService(&iapp))

	app.Listen(8000, 8001)

	<-quit
}
