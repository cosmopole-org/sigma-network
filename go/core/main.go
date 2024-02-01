package main

import (
	cosmopole_services "sigma/core/cosmopole/services"
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	"sigma/core/src/interfaces"
	"sigma/core/src/types"
)

func hello(app *interfaces.IApp, d interfaces.IDto, assistant interfaces.IAssistant) (any, error) {
	return `{ "hello": "world" }`, nil
}

type Cat struct {
	Age int
}

var quit = make(chan struct{})

func main() {
	app := core.CreateApp(
		"sigma-sample",
		"",
		"",
		"",
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
