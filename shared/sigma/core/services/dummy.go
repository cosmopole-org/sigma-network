package services

import (
	"os"
	"sigma/main/core/dtos"
	"sigma/main/core/modules"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *modules.App, coreAccess bool) {
	app.Services.AddAction(modules.CreateAction(
		app,
		"/api/hello",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		func(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
			return `{ "hello": "world" }`, nil
		},
	))
	app.Services.AddAction(modules.CreateAction(
		app,
		"/api/ping",
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		func(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
			return os.Getenv("MAIN_PORT"), nil
		},
	))
}
