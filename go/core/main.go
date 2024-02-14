package main

import (
	"fmt"
	"os"
	cosmopole_services "sigma/core/cosmopole/services"
	"sigma/core/src/core"
	"sigma/core/src/dtos"
	dtos_humans "sigma/core/src/dtos/humans"
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

	var iapp interfaces.IApp = *app
	var apiService = types.CreateService(&iapp, "api").
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
	app.AddService(cosmopole_services.CreateMessengerService(&iapp))

	app.Listen(8000)

	result, err := app.GetService("humans").CallMethod("signup", &dtos_humans.SignupDto{Email: "..."}, types.CreateAssistant(0, "", 0, 0, 0, nil))
	if (err != nil) {
		fmt.Println(err)
	} else {
		fmt.Println(result)
	}
	<-quit
}
