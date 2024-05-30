package services_dummy

import (
	"os"
	"sigma/main/core/inputs"
	"sigma/main/core/models"
	"sigma/main/core/runtime"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *runtime.App, openToNet bool) {
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/api/hello",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodGet),
		true,
		func(app *runtime.App, d inputs.HelloInput, info models.Info) (any, error) {
			return `{ "hello": "world" }`, nil
		},
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/api/ping",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(openToNet, true, false, false, fiber.MethodGet),
		true,
		func(app *runtime.App, d inputs.HelloInput, info models.Info) (any, error) {
			return os.Getenv("MAIN_PORT"), nil
		},
	))
}
