package services

import (
	"os"
	"sigma/main/core/dtos"
	"sigma/main/core/modules"
	"sigma/main/shell/manager"

	"github.com/gofiber/fiber/v2"
)

func CreateDummyService(app *modules.App, coreAccess bool) {
	manager.Instance.Endpoint(modules.CreateAction(
		"/api/hello",
		fiber.MethodGet,
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		func(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
			return `{ "hello": "world" }`, nil
		},
	))
	manager.Instance.Endpoint(modules.CreateAction(
		"/api/ping",
		fiber.MethodGet,
		modules.CreateCk(false, false, false),
		modules.CreateAc(coreAccess, true, false, false),
		true,
		func(app *modules.App, d dtos.HelloDto, assistant modules.Assistant) (any, error) {
			return os.Getenv("MAIN_PORT"), nil
		},
	))
}
