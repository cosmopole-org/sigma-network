package services

import (
	"os"
	"sigma/storage/core/dtos"
	"sigma/storage/core/models"
	"sigma/storage/core/runtime"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *runtime.App, coreAccess bool) {
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/api/hello",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		func(app *runtime.App, d dtos.HelloDto, assistant models.Assistant) (any, error) {
			return `{ "hello": "world" }`, nil
		},
	))
	app.Services.AddAction(runtime.CreateAction(
		app,
		"/api/ping",
		runtime.CreateCk(false, false, false),
		runtime.CreateAc(coreAccess, true, false, false, fiber.MethodGet),
		true,
		func(app *runtime.App, d dtos.HelloDto, assistant models.Assistant) (any, error) {
			return os.Getenv("MAIN_PORT"), nil
		},
	))
}
